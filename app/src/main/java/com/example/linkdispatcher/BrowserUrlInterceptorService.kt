package com.example.linkdispatcher

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.TextUtils
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * BrowserUrlInterceptorService:
 * Bắt link YouTube / YouTube Music / Spotify NGAY BÊN TRONG TRÌNH DUYỆT (Chrome, Brave, Firefox, Samsung Internet...).
 *
 * CƠ CHẾ HIỆN NÚT XÁC NHẬN "ĐỒNG Ý MỞ YOUTUBE" (THEO YÊU CẦU):
 * 1. Khi phát hiện người dùng mở một video YouTube / Shorts / Nhạc hợp lệ trong trình duyệt:
 *    - Thay vì tự động nhảy sang app khác gây giật mình hoặc văng lặp, dịch vụ sẽ hiển thị
 *      một thanh nút bấm nổi ngay phía dưới màn hình trình duyệt (TYPE_ACCESSIBILITY_OVERLAY):
 *      [ Đồng ý mở YouTube ]  |  [ Ở lại ]
 *    - Chỉ khi người dùng chủ động nhấn vào nút "Đồng ý mở YouTube", ứng dụng mới thực hiện
 *      chuyển hướng sang YouTube Mod (VD: YouTube Morphe / ReVanced).
 *    - Nếu người dùng nhấn "Ở lại" hoặc lướt tiếp trên trình duyệt, thanh xác nhận sẽ ẩn đi
 *      và không làm gián đoạn trình duyệt.
 * 2. Người dùng cũng có thể bật/tắt chế độ "Hiện nút Đồng ý trước khi chuyển hướng" trong MainActivity.
 */
class BrowserUrlInterceptorService : AccessibilityService() {

    private var lastInterceptedKey: String = ""
    private var activeOverlayMediaKey: String = ""
    private var lastInterceptedTimeMs: Long = 0L
    private var cachedBrowserPackages: Set<String> = emptySet()
    private var lastBrowserCacheTimeMs: Long = 0L

    private val mainHandler = Handler(Looper.getMainLooper())
    private var confirmationOverlayView: View? = null
    private val autoDismissRunnable = Runnable {
        dismissConfirmationOverlay()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val pkgName = event.packageName?.toString() ?: return
        if (pkgName == packageName) return

        // Ignore system UI overlays (volume bar, notification shade) so we don't accidentally hide the prompt
        if (pkgName == "com.android.systemui") return

        val prefs = getSharedPreferences(RouterActivity.PREFS_NAME, Context.MODE_PRIVATE)
        val interceptorEnabled = prefs.getBoolean(
            RouterActivity.KEY_IN_BROWSER_INTERCEPT_ENABLED,
            true
        )
        if (!interceptorEnabled) {
            dismissConfirmationOverlay()
            return
        }

        // Nếu người dùng đã thoát khỏi trình duyệt sang ứng dụng khác -> ẩn nút xác nhận
        if (!isDetectedBrowserPackage(pkgName)) {
            dismissConfirmationOverlay()
            return
        }

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
            if (isDefinitelyNonVideoPage(uri)) {
                lastInterceptedKey = ""
                dismissConfirmationOverlay()
            }
            return
        }

        // Chống lặp tuyệt đối: Nếu video này đã xử lý (đã bấm Đồng ý hoặc đã bấm Ở lại) thì không hiện lại
        if (mediaKey == lastInterceptedKey) {
            return
        }

        val now = System.currentTimeMillis()
        if (now - lastInterceptedTimeMs < MIN_TRANSITION_GAP_MS) {
            return
        }

        // Kiểm tra xem luồng dịch vụ có đang bật và App đích (VD: YouTube Morphe) đã cài đặt chưa
        val readyTarget = RouterActivity.prepareBrowserServiceTarget(this, normalizedUrl)
        if (readyTarget == null) {
            return
        }

        val confirmBeforeRedirect = prefs.getBoolean(
            RouterActivity.KEY_CONFIRM_BEFORE_REDIRECT,
            true
        )

        lastInterceptedKey = mediaKey
        lastInterceptedTimeMs = now

        if (confirmBeforeRedirect) {
            // Hiển thị nút "Đồng ý mở YouTube" nổi ngay trên trình duyệt để người dùng xác nhận
            showConfirmationBannerOverlay(
                mediaKey = mediaKey,
                readyTarget = readyTarget,
                normalizedUrl = normalizedUrl
            )
        } else {
            // Chế độ chuyển thẳng không hỏi xác nhận
            val dispatched = RouterActivity.dispatchUrlFromBrowserService(
                context = this,
                httpsUrl = normalizedUrl
            )
            if (!dispatched) {
                lastInterceptedKey = ""
            }
        }
    }

    override fun onInterrupt() {
        dismissConfirmationOverlay()
    }

    override fun onDestroy() {
        dismissConfirmationOverlay()
        super.onDestroy()
    }

    /**
     * Hiển thị thanh nút bấm xác nhận "Đồng ý mở YouTube" bằng TYPE_ACCESSIBILITY_OVERLAY
     * ngay phía dưới trình duyệt mà không làm gián đoạn thao tác cuộn trang của người dùng.
     */
    private fun showConfirmationBannerOverlay(
        mediaKey: String,
        readyTarget: ReadyDispatchTarget,
        normalizedUrl: String
    ) {
        mainHandler.post {
            dismissConfirmationOverlayInternal()
            activeOverlayMediaKey = mediaKey

            val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
            if (wm == null) {
                launchFallbackConfirmationActivity(normalizedUrl)
                return@post
            }

            try {
                val bannerView = buildConfirmationBannerView(
                    readyTarget = readyTarget,
                    onAgreeClick = {
                        dismissConfirmationOverlayInternal()
                        RouterActivity.dispatchUrlFromBrowserService(
                            context = this@BrowserUrlInterceptorService,
                            httpsUrl = normalizedUrl
                        )
                    },
                    onStayClick = {
                        dismissConfirmationOverlayInternal()
                    }
                )

                val layoutParams = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                    y = dpToPx(20)
                }

                wm.addView(bannerView, layoutParams)
                confirmationOverlayView = bannerView

                // Tự động ẩn sau 15 giây nếu người dùng không bấm
                mainHandler.removeCallbacks(autoDismissRunnable)
                mainHandler.postDelayed(autoDismissRunnable, OVERLAY_TIMEOUT_MS)
            } catch (_: Exception) {
                // Nếu ROM chặn Accessibility Overlay thì mở hộp thoại xác nhận của RouterActivity
                launchFallbackConfirmationActivity(normalizedUrl)
            }
        }
    }

    private fun launchFallbackConfirmationActivity(normalizedUrl: String) {
        try {
            val confirmIntent = Intent(this, RouterActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = Uri.parse(normalizedUrl)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(confirmIntent)
        } catch (_: Exception) {
            // Bỏ qua
        }
    }

    private fun buildConfirmationBannerView(
        readyTarget: ReadyDispatchTarget,
        onAgreeClick: () -> Unit,
        onStayClick: () -> Unit
    ): View {
        val outerWrapper = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dpToPx(14), dpToPx(8), dpToPx(14), dpToPx(8))
        }

        val cardBackground = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(18).toFloat()
            setColor(Color.parseColor("#F20F172A"))
            setStroke(dpToPx(1), Color.parseColor("#4D10B981"))
        }

        val cardContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = cardBackground
            setPadding(dpToPx(16), dpToPx(14), dpToPx(16), dpToPx(14))
            elevation = dpToPx(10).toFloat()
        }

        val titleView = TextView(this).apply {
            text = "Phát hiện liên kết ${readyTarget.service.title}"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setTypeface(typeface, Typeface.BOLD)
            maxLines = 1
            ellipsize = TextUtils.TruncateAt.END
        }

        val subtitleView = TextView(this).apply {
            text = "Đích: ${readyTarget.targetPackage} · Nhấn Đồng ý để chuyển sang ứng dụng"
            setTextColor(Color.parseColor("#94A3B8"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            maxLines = 1
            ellipsize = TextUtils.TruncateAt.END
            setPadding(0, dpToPx(2), 0, dpToPx(10))
        }

        val buttonRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        val stayBtnBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(12).toFloat()
            setColor(Color.parseColor("#1E293B"))
            setStroke(dpToPx(1), Color.parseColor("#334155"))
        }

        val stayButton = Button(this).apply {
            text = "Ở lại Web"
            isAllCaps = false
            setTextColor(Color.parseColor("#CBD5E1"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            background = stayBtnBg
            setPadding(dpToPx(14), dpToPx(8), dpToPx(14), dpToPx(8))
            setOnClickListener { onStayClick() }
        }

        val stayParams = LinearLayout.LayoutParams(
            0,
             dpToPx(42),
            1f
        ).apply {
            marginEnd = dpToPx(10)
        }

        val agreeBtnBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(12).toFloat()
            setColor(Color.parseColor("#10B981"))
        }

        val agreeButton = Button(this).apply {
            text = "Đồng ý mở ${readyTarget.service.shortActionLabel}"
            isAllCaps = false
            setTextColor(Color.parseColor("#04130E"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTypeface(typeface, Typeface.BOLD)
            background = agreeBtnBg
            setPadding(dpToPx(16), dpToPx(8), dpToPx(16), dpToPx(8))
            setOnClickListener { onAgreeClick() }
        }

        val agreeParams = LinearLayout.LayoutParams(
            0,
            dpToPx(42),
            1.65f
        )

        buttonRow.addView(stayButton, stayParams)
        buttonRow.addView(agreeButton, agreeParams)

        cardContainer.addView(titleView)
        cardContainer.addView(subtitleView)
        cardContainer.addView(buttonRow)
        outerWrapper.addView(cardContainer)

        return outerWrapper
    }

    private fun dismissConfirmationOverlay() {
        mainHandler.post {
            dismissConfirmationOverlayInternal()
        }
    }

    private fun dismissConfirmationOverlayInternal() {
        mainHandler.removeCallbacks(autoDismissRunnable)
        val view = confirmationOverlayView ?: return
        confirmationOverlayView = null
        activeOverlayMediaKey = ""
        try {
            val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
            wm?.removeViewImmediate(view)
        } catch (_: Exception) {
            // Bỏ qua nếu view đã được gỡ
        }
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            resources.displayMetrics
        ).toInt()
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
                    if (node.isFocused) return null
                    val text = node.text?.toString()?.trim()
                    if (!text.isNullOrBlank()) {
                        return text
                    }
                }
                return null
            }
        }

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

    private fun extractActionableMediaKey(uri: Uri): String? {
        val host = uri.host?.lowercase() ?: return null
        val segments = uri.pathSegments
        val firstSeg = segments.firstOrNull()?.lowercase() ?: ""

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
        private const val OVERLAY_TIMEOUT_MS = 15_000L

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
