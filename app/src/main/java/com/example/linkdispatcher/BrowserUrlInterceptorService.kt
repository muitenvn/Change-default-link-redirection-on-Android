package com.example.linkdispatcher

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * BrowserUrlInterceptorService:
 * Giải quyết triệt để vấn đề "Khi đã ở sẵn bên trong Trình duyệt (Chrome, Brave, Firefox, Samsung Internet...)
 * mà nhấn vào link YouTube / YouTube Music / Spotify thì trình duyệt tự mở tab web chứ không gọi Default Browser".
 *
 * Cơ chế hoạt động:
 * 1. Chỉ lắng nghe khi ứng dụng đang mở trên màn hình là một Trình duyệt Web (được phát hiện động).
 * 2. Đọc thanh địa chỉ (URL Bar) của trình duyệt (bỏ qua nếu người dùng đang gõ phím - isFocused == true).
 * 3. Ngay khi phát hiện URL trên thanh địa chỉ vừa chuyển sang link video/nhạc thuộc luồng đang BẬT
 *    (ví dụ: m.youtube.com/watch?v=..., youtube.com/shorts/..., youtu.be/..., music.youtube.com/watch?v=..., open.spotify.com/track/...),
 *    dịch vụ lập tức bắn Intent sang ứng dụng Mod (ví dụ app.morphe.android.youtube) và tự động bấm Back
 *    trên trình duyệt để trả trình duyệt về trang trước đó.
 */
class BrowserUrlInterceptorService : AccessibilityService() {

    private val mainHandler = Handler(Looper.getMainLooper())
    private var lastInterceptedKey: String = ""
    private var lastInterceptedTimeMs: Long = 0L
    private var cachedBrowserPackages: Set<String> = emptySet()
    private var lastBrowserCacheTimeMs: Long = 0L

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val pkgName = event.packageName?.toString() ?: return
        if (pkgName == packageName) return

        val prefs = getSharedPreferences(RouterActivity.PREFS_NAME, Context.MODE_PRIVATE)
        val interceptorEnabled = prefs.getBoolean(
            RouterActivity.KEY_IN_BROWSER_INTERCEPT_ENABLED,
            true
        )
        if (!interceptorEnabled) return

        // Chỉ kiểm tra trên các ứng dụng Trình duyệt Web đã phát hiện trên thiết bị
        if (!isDetectedBrowserPackage(pkgName)) return

        val rootNode = rootInActiveWindow ?: return
        val rawUrlText = extractUrlFromBrowserWindow(rootNode, pkgName) ?: return

        val normalizedUrl = normalizeBrowserBarUrl(rawUrlText) ?: return
        val uri = try {
            Uri.parse(normalizedUrl)
        } catch (_: Exception) {
            return
        }

        // Chỉ bắt các đường dẫn thực sự là nội dung cần mở App (watch, shorts, live, playlist, track...)
        // Không bắt trang chủ m.youtube.com trống để tránh gây khó chịu nếu người dùng chỉ vào trang chủ
        if (!isActionableMediaDeepLink(uri)) return

        val dedupKey = "${uri.host?.lowercase()}${uri.path}?${uri.getQueryParameter("v") ?: uri.getQueryParameter("list") ?: ""}"
        val now = System.currentTimeMillis()
        if (dedupKey == lastInterceptedKey && (now - lastInterceptedTimeMs) < COOLDOWN_MS) {
            return
        }

        val dispatched = RouterActivity.dispatchUrlFromBrowserService(
            context = this,
            httpsUrl = normalizedUrl
        )

        if (dispatched) {
            lastInterceptedKey = dedupKey
            lastInterceptedTimeMs = now

            // Tự động bấm Back trên trình duyệt để đóng tab web YouTube thừa vừa mở
            val autoBack = prefs.getBoolean(RouterActivity.KEY_IN_BROWSER_AUTO_BACK, true)
            if (autoBack) {
                mainHandler.postDelayed({
                    try {
                        performGlobalAction(GLOBAL_ACTION_BACK)
                    } catch (_: Exception) {
                        // Bỏ qua
                    }
                }, 120L)
            }
        }
    }

    override fun onInterrupt() {
        // Không cần xử lý
    }

    private fun isDetectedBrowserPackage(pkgName: String): Boolean {
        val now = System.currentTimeMillis()
        if (cachedBrowserPackages.isEmpty() || (now - lastBrowserCacheTimeMs) > 15_000L) {
            cachedBrowserPackages = RouterActivity.detectInstalledBrowsers(this)
                .map { it.packageName }
                .toSet()
            lastBrowserCacheTimeMs = now
        }
        return pkgName in cachedBrowserPackages
    }

    private fun extractUrlFromBrowserWindow(
        rootNode: AccessibilityNodeInfo,
        browserPkg: String
    ): String? {
        // 1. Tìm nhanh theo các View ID thanh địa chỉ phổ biến của các trình duyệt
        for (idSuffix in KNOWN_URL_BAR_ID_SUFFIXES) {
            val fullViewId = "$browserPkg:id/$idSuffix"
            val matchedNodes = try {
                rootNode.findAccessibilityNodeInfosByViewId(fullViewId)
            } catch (_: Exception) {
                null
            }
            if (!matchedNodes.isNullOrEmpty()) {
                for (node in matchedNodes) {
                    // Nếu người dùng đang bấm vào thanh địa chỉ để gõ chữ (isFocused == true) thì không tự cắt ngang
                    if (node.isFocused) continue
                    val text = node.text?.toString()?.trim()
                    if (!text.isNullOrBlank() && looksLikeTargetDomainUrl(text)) {
                        return text
                    }
                }
            }
        }

        // 2. Cơ chế quét dự phòng thông minh cho mọi trình duyệt lạ (Via, Cốc Cốc, DuckDuckGo, Kiwi...):
        // Quét tối đa 45 node đầu tiên trên thanh công cụ để tìm chuỗi URL khớp tên miền mục tiêu
        return scanNodeTreeForUrl(rootNode, depth = 0, maxDepth = 7)
    }

    private fun scanNodeTreeForUrl(
        node: AccessibilityNodeInfo?,
        depth: Int,
        maxDepth: Int
    ): String? {
        if (node == null || depth > maxDepth) return null
        if (!node.isFocused) {
            val text = node.text?.toString()?.trim()
            if (!text.isNullOrBlank() && text.length < 300 && !text.contains(" ") && looksLikeTargetDomainUrl(text)) {
                return text
            }
        }

        val count = node.childCount.coerceAtMost(12)
        for (i in 0 until count) {
            val child = try {
                node.getChild(i)
            } catch (_: Exception) {
                null
            } ?: continue
            val found = scanNodeTreeForUrl(child, depth + 1, maxDepth)
            if (found != null) return found
        }
        return null
    }

    private fun looksLikeTargetDomainUrl(rawText: String): Boolean {
        val cleaned = rawText.lowercase()
            .removePrefix("https://")
            .removePrefix("http://")
        return TARGET_DOMAIN_PREFIXES.any { domain ->
            cleaned.startsWith("$domain/") || cleaned.startsWith("www.$domain/")
        }
    }

    private fun normalizeBrowserBarUrl(rawText: String): String? {
        val trimmed = rawText.trim()
        if (trimmed.contains(" ")) return null
        return when {
            trimmed.startsWith("https://", ignoreCase = true) -> trimmed
            trimmed.startsWith("http://", ignoreCase = true) ->
                "https://" + trimmed.substring(7)
            else -> "https://$trimmed"
        }
    }

    private fun isActionableMediaDeepLink(uri: Uri): Boolean {
        val host = uri.host?.lowercase() ?: return false
        val path = uri.path?.lowercase() ?: return false
        val firstSeg = uri.pathSegments.firstOrNull()?.lowercase() ?: ""

        // YouTube & YouTube Music
        if (host.contains("youtube.com") || host == "youtu.be") {
            if (host == "youtu.be" && firstSeg.isNotBlank()) return true
            if (firstSeg in setOf("watch", "shorts", "live", "playlist", "embed", "v")) {
                return true
            }
            if (!uri.getQueryParameter("v").isNullOrBlank() || !uri.getQueryParameter("list").isNullOrBlank()) {
                return true
            }
            return false
        }

        // Spotify
        if (host.contains("spotify.com") || host == "spotify.link" || host == "spoti.fi") {
            return firstSeg in setOf("track", "album", "playlist", "artist", "episode", "show") ||
                host == "spotify.link" || host == "spoti.fi"
        }

        // Facebook Watch / Video
        if (host.contains("facebook.com") || host == "fb.watch") {
            return host == "fb.watch" || path.contains("/watch") || path.contains("/videos/") || path.contains("/reel/")
        }

        // Mạng xã hội (TikTok, Instagram Reel/Post, X Status, Reddit)
        if (
            host.contains("tiktok.com") ||
            host.contains("instagram.com") ||
            host.contains("threads.net") ||
            host == "x.com" ||
            host.contains("twitter.com") ||
            host.contains("reddit.com")
        ) {
            return uri.pathSegments.size >= 2 || host == "vm.tiktok.com" || host == "vt.tiktok.com"
        }

        return false
    }

    companion object {
        private const val COOLDOWN_MS = 2800L

        private val KNOWN_URL_BAR_ID_SUFFIXES = listOf(
            "url_bar",
            "location_bar_edit_text",
            "mozac_browser_toolbar_url_view",
            "url_field",
            "omnibox_text_field",
            "address_bar",
            "search_box_text"
        )

        private val TARGET_DOMAIN_PREFIXES = listOf(
            "youtube.com",
            "m.youtube.com",
            "youtu.be",
            "music.youtube.com",
            "open.spotify.com",
            "spotify.link",
            "fb.watch",
            "facebook.com",
            "m.facebook.com",
            "tiktok.com",
            "vm.tiktok.com",
            "instagram.com",
            "threads.net",
            "x.com",
            "twitter.com",
            "reddit.com"
        )

        /**
         * Kiểm tra xem người dùng đã bật dịch vụ "Bắt link trong Trình duyệt" trong Cài đặt Hỗ trợ tiếp cận chưa
         */
        fun isServiceEnabled(context: Context): Boolean {
            val expectedComponentName = "${context.packageName}/${BrowserUrlInterceptorService::class.java.canonicalName}"
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            return enabledServices.split(':').any { it.equals(expectedComponentName, ignoreCase = true) }
        }
    }
}
