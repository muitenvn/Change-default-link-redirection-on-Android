package com.example.linkdispatcher

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.net.Uri
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * BrowserUrlInterceptorService:
 * Bắt link YouTube / YouTube Music / Spotify NGAY BÊN TRONG TRÌNH DUYỆT (Chrome, Brave, Firefox, Samsung Internet...).
 *
 * ĐÃ SỬA TRIỆT ĐỂ LỖI VĂNG NGƯỢC LẠI CHROME & LẶP VÔ TẬN (TRONG VIDEO):
 * 1. Đã XÓA hoàn toàn lệnh performGlobalAction(GLOBAL_ACTION_BACK) sau khi mở App Mod:
 *    Trước đây lệnh Back chạy sau 120ms lúc YouTube Morphe vừa hiện logo "M", khiến hệ thống bấm Back
 *    ngay trên YouTube Morphe làm văng ngược về lại trình duyệt Chrome.
 * 2. Chống lặp tuyệt đối theo trạng thái URL (State-based Deduplication):
 *    Khi đã phóng 1 video (lastInterceptedKey), dịch vụ sẽ KHÔNG bao giờ tự phóng lại cùng video đó
 *    dù sau 3 giây hay 10 phút, cho tới khi thanh địa chỉ trình duyệt thực sự chuyển sang trang khác
 *    (ví dụ: quay về trang chủ m.youtube.com, m.youtube.com/feed, google.com hoặc bấm sang video khác).
 * 3. Chỉ đọc đúng thanh địa chỉ (url_bar) của trình duyệt và kiểm tra chặt chẽ ID video/playlist hợp lệ.
 */
class BrowserUrlInterceptorService : AccessibilityService() {

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

        // Chỉ xử lý khi cửa sổ hiện tại là một Trình duyệt Web trên máy
        if (!isDetectedBrowserPackage(pkgName)) return

        val rootNode = rootInActiveWindow ?: return
        val rawUrlBarText = extractBrowserAddressBarText(rootNode, pkgName) ?: return

        val normalizedUrl = normalizeBrowserBarUrl(rawUrlBarText) ?: return
        val uri = try {
            Uri.parse(normalizedUrl)
        } catch (_: Exception) {
            return
        }

        // Bóc tách khóa định danh duy nhất cho video/nhạc (nếu là link video/nhạc hợp lệ)
        val mediaKey = extractActionableMediaKey(uri)

        if (mediaKey == null) {
            // Người dùng đang ở trang thường (trang chủ m.youtube.com, /feed, /results, google.com...)
            // -> Reset khóa để lần tới bấm vào bất kỳ video nào (kể cả video cũ) đều mở YouTube Mod ngay
            if (isDefinitelyNonVideoPage(uri)) {
                lastInterceptedKey = ""
            }
            return
        }

        val now = System.currentTimeMillis()

        // Chống lặp tuyệt đối: Nếu vẫn là cùng một video đang hiển thị trên thanh địa chỉ trình duyệt
        // thì KHÔNG mở lại lần 2 (ngăn chặn hoàn toàn vòng lặp 3 giây trong video)
        if (mediaKey == lastInterceptedKey) {
            return
        }

        // Khoảng nghỉ an toàn tối thiểu khi chuyển tiếp liên tục
        if (now - lastInterceptedTimeMs < MIN_TRANSITION_GAP_MS) {
            return
        }

        // Đánh dấu khóa trước khi bắn Intent để mọi sự kiện Accessibility phát sinh thêm đều bị chặn ngay
        lastInterceptedKey = mediaKey
        lastInterceptedTimeMs = now

        val dispatched = RouterActivity.dispatchUrlFromBrowserService(
            context = this,
            httpsUrl = normalizedUrl
        )

        if (!dispatched) {
            // Nếu luồng đang tắt hoặc chưa cài Mod thì không khóa
            lastInterceptedKey = ""
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

    /**
     * Đọc chính xác nội dung thanh địa chỉ (URL Bar) của trình duyệt.
     * Nếu tìm thấy View ID của thanh địa chỉ thì chỉ lấy giá trị từ node đó,
     * tuyệt đối không quét nhầm xuống nội dung trang web bên dưới.
     */
    private fun extractBrowserAddressBarText(
        rootNode: AccessibilityNodeInfo,
        browserPkg: String
    ): String? {
        for (idSuffix in KNOWN_URL_BAR_ID_SUFFIXES) {
            val fullViewId = "$browserPkg:id/$idSuffix"
            val matchedNodes = try {
                rootNode.findAccessibilityNodeInfosByViewId(fullViewId)
            } catch (_: Exception) {
                null
            }
            if (!matchedNodes.isNullOrEmpty()) {
                for (node in matchedNodes) {
                    // Nếu người dùng đang đặt con trỏ gõ chữ trên thanh địa chỉ thì không can thiệp
                    if (node.isFocused) return null
                    val text = node.text?.toString()?.trim()
                    if (!text.isNullOrBlank()) {
                        return text
                    }
                }
                return null
            }
        }

        // Dự phòng cho trình duyệt không dùng ID chuẩn: chỉ quét tầng trên cùng (Toolbar)
        return scanTopToolbarForUrl(rootNode, depth = 0, maxDepth = 5)
    }

    private fun scanTopToolbarForUrl(
        node: AccessibilityNodeInfo?,
        depth: Int,
        maxDepth: Int
    ): String? {
        if (node == null || depth > maxDepth) return null
        if (!node.isFocused) {
            val text = node.text?.toString()?.trim()
            if (!text.isNullOrBlank() && text.length < 260 && !text.contains(" ") && looksLikeUrlText(text)) {
                return text
            }
        }

        val count = node.childCount.coerceAtMost(8)
        for (i in 0 until count) {
            val child = try {
                node.getChild(i)
            } catch (_: Exception) {
                null
            } ?: continue
            val found = scanTopToolbarForUrl(child, depth + 1, maxDepth)
            if (found != null) return found
        }
        return null
    }

    private fun looksLikeUrlText(rawText: String): Boolean {
        val cleaned = rawText.lowercase()
            .removePrefix("https://")
            .removePrefix("http://")
        return TARGET_DOMAIN_PREFIXES.any { domain ->
            cleaned == domain ||
                cleaned == "www.$domain" ||
                cleaned.startsWith("$domain/") ||
                cleaned.startsWith("www.$domain/")
        }
    }

    private fun normalizeBrowserBarUrl(rawText: String): String? {
        val trimmed = rawText.trim()
        if (trimmed.isEmpty() || trimmed.contains(" ")) return null
        return when {
            trimmed.startsWith("https://", ignoreCase = true) -> trimmed
            trimmed.startsWith("http://", ignoreCase = true) ->
                "https://" + trimmed.substring(7)
            trimmed.contains(".") -> "https://$trimmed"
            else -> null
        }
    }

    /**
     * Kiểm tra xem trình duyệt đang ở trang chủ / trang feed / trang tìm kiếm (không phải trang phát video)
     * để xóa khóa lastInterceptedKey, cho phép bấm lại video bất kỳ.
     */
    private fun isDefinitelyNonVideoPage(uri: Uri): Boolean {
        val host = uri.host?.lowercase() ?: return false
        val segments = uri.pathSegments
        val firstSeg = segments.firstOrNull()?.lowercase() ?: ""

        if (host.contains("youtube.com")) {
            if (segments.isEmpty()) return true
            if (firstSeg in setOf("feed", "results", "channel", "c", "user", "gaming", "account", "reporthistory")) {
                return true
            }
        }
        if (!host.contains("youtube.com") && host != "youtu.be" && !host.contains("spotify.com") && !host.contains("facebook.com") && host != "fb.watch") {
            return true
        }
        return false
    }

    /**
     * Trả về khóa định danh duy nhất (VD: "yt_video:dQw4w9WgXcQ" hoặc "yt_shorts:abc123xyz")
     * CHỈ KHI URL trên thanh địa chỉ có đầy đủ ID hợp lệ.
     * Nếu URL bị cụt (như "m.youtube.com/shor" hoặc "m.youtube.com/watch" chưa có ?v=) sẽ trả về null
     * để không bao giờ bắn URL lỗi sang YouTube Morphe.
     */
    private fun extractActionableMediaKey(uri: Uri): String? {
        val host = uri.host?.lowercase() ?: return null
        val segments = uri.pathSegments
        val firstSeg = segments.firstOrNull()?.lowercase() ?: ""

        // 1. YouTube & YouTube Music
        if (host.contains("youtube.com") || host == "youtu.be") {
            if (host == "youtu.be") {
                val id = firstSeg.takeIf { it.length >= 6 } ?: return null
                return "yt_shortlink:$id"
            }

            if (firstSeg == "watch") {
                val videoId = uri.getQueryParameter("v")?.takeIf { it.length >= 6 }
                val listId = uri.getQueryParameter("list")?.takeIf { it.length >= 6 }
                val keyId = videoId ?: listId ?: return null
                return "yt_watch:$host:$keyId"
            }

            if (firstSeg == "shorts" || firstSeg == "live" || firstSeg == "embed" || firstSeg == "v") {
                val videoId = segments.getOrNull(1)?.takeIf { it.length >= 6 } ?: return null
                return "yt_$firstSeg:$videoId"
            }

            if (firstSeg == "playlist") {
                val listId = uri.getQueryParameter("list")?.takeIf { it.length >= 6 } ?: return null
                return "yt_playlist:$listId"
            }

            return null
        }

        // 2. Spotify
        if (host.contains("spotify.com") || host == "spotify.link" || host == "spoti.fi") {
            if (host == "spotify.link" || host == "spoti.fi") {
                val code = firstSeg.takeIf { it.length >= 4 } ?: return null
                return "spotify_short:$code"
            }
            if (firstSeg in setOf("track", "album", "playlist", "artist", "episode", "show")) {
                val id = segments.getOrNull(1)?.takeIf { it.length >= 6 } ?: return null
                return "spotify_$firstSeg:$id"
            }
            return null
        }

        // 3. Facebook Watch / Video
        if (host.contains("facebook.com") || host == "fb.watch") {
            if (host == "fb.watch") {
                val id = firstSeg.takeIf { it.length >= 4 } ?: return null
                return "fb_watch:$id"
            }
            if (firstSeg == "watch" || firstSeg == "reel" || segments.contains("videos")) {
                val id = uri.getQueryParameter("v") ?: segments.lastOrNull()?.takeIf { it.length >= 5 } ?: return null
                return "fb_video:$id"
            }
            return null
        }

        // 4. Mạng xã hội (TikTok, Instagram Reel/Post, X Status, Reddit)
        if (
            host.contains("tiktok.com") ||
            host.contains("instagram.com") ||
            host.contains("threads.net") ||
            host == "x.com" ||
            host.contains("twitter.com") ||
            host.contains("reddit.com")
        ) {
            if (segments.size >= 2) {
                val lastSeg = segments.lastOrNull()?.takeIf { it.length >= 4 } ?: return null
                return "social:$host:$lastSeg"
            }
        }

        return null
    }

    companion object {
        private const val MIN_TRANSITION_GAP_MS = 900L

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
