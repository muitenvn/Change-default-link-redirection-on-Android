package com.example.linkdispatcher

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import java.util.regex.Pattern

/**
 * Thông tin một trình duyệt Web được hệ thống tự động phát hiện trên thiết bị
 */
data class DetectedBrowser(
    val appName: String,
    val packageName: String
)

/**
 * Danh mục các dịch vụ (luồng điều hướng) được hỗ trợ
 */
enum class ServiceRoute(
    val id: String,
    val title: String,
    val aliasClassName: String,
    val defaultPackage: String,
    val suggestedPackages: List<Pair<String, String>>
) {
    YOUTUBE_VIDEO(
        id = "youtube_video",
        title = "YouTube Video",
        aliasClassName = "com.example.linkdispatcher.RouteYoutubeVideoAlias",
        defaultPackage = "app.morphe.android.youtube",
        suggestedPackages = listOf(
            "YouTube Morphe (Mod)" to "app.morphe.android.youtube",
            "YouTube ReVanced (Mod)" to "app.revanced.android.youtube",
            "RVX YouTube (Mod)" to "app.rvx.android.youtube",
            "YouTube Thường" to "com.google.android.youtube",
            "NewPipe" to "org.schabi.newpipe",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    YOUTUBE_MUSIC(
        id = "youtube_music",
        title = "YouTube Music",
        aliasClassName = "com.example.linkdispatcher.RouteYoutubeMusicAlias",
        defaultPackage = "app.rvx.android.apps.youtube.music",
        suggestedPackages = listOf(
            "RVX Music (Mod)" to "app.rvx.android.apps.youtube.music",
            "ReVanced Music (Mod)" to "app.revanced.android.apps.youtube.music",
            "Morphe Music (Mod)" to "app.morphe.android.apps.youtube.music",
            "YouTube Music Thường" to "com.google.android.apps.youtube.music",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    SPOTIFY(
        id = "spotify",
        title = "Spotify",
        aliasClassName = "com.example.linkdispatcher.RouteSpotifyAlias",
        defaultPackage = "com.spotify.music",
        suggestedPackages = listOf(
            "Spotify / xManager" to "com.spotify.music",
            "Spotify Lite" to "com.spotify.lite",
            "Spotube" to "oss.krtirtho.spotube",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    FACEBOOK(
        id = "facebook",
        title = "Facebook & Watch",
        aliasClassName = "com.example.linkdispatcher.RouteFacebookAlias",
        defaultPackage = "com.facebook.katana",
        suggestedPackages = listOf(
            "Facebook" to "com.facebook.katana",
            "Facebook Lite" to "com.facebook.lite",
            "SlimSocial" to "it.rignanese.leo.slimfacebook",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    SOCIAL_MEDIA(
        id = "social_media",
        title = "Mạng xã hội (TikTok / IG / X / Reddit)",
        aliasClassName = "com.example.linkdispatcher.RouteSocialAlias",
        defaultPackage = "com.ss.android.ugc.trill",
        suggestedPackages = listOf(
            "TikTok (Châu Á)" to "com.ss.android.ugc.trill",
            "TikTok Quốc tế / Mod" to "com.zhiliaoapp.musically",
            "Instagram" to "com.instagram.android",
            "Instander (IG Mod)" to "com.instander.android",
            "X / Twitter" to "com.twitter.android",
            "Reddit" to "com.reddit.frontpage",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    )
}

/**
 * Kết quả phân tích và dịch tự động URL đầu vào sang URI đích
 */
data class TranslatedLinkResult(
    val service: ServiceRoute?,
    val originalUrl: String,
    val normalizedHttpsUrl: String,
    val nativeSchemeUri: Uri?,
    val extractedId: String?,
    val linkSubType: String
)

/**
 * RouterActivity kế thừa trực tiếp từ android.app.Activity với Theme.NoDisplay:
 * - Nếu liên kết thuộc các app đã bật (YouTube, YT Music, Spotify, FB, MXH) và đã cài đặt -> mở thẳng app đó.
 * - Nếu liên kết KHÔNG nằm trong các app trên (ví dụ link báo chí, tìm kiếm, web bất kỳ)
 *   HOẶC luồng đó đã tắt / chưa cài bản Mod -> tự động chuyển thẳng qua Trình duyệt Web
 *   mà người dùng đã chọn (hoặc trình duyệt phát hiện tự động trên máy).
 */
class RouterActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIncomingIntent(intent)
        finish()
    }

    private fun handleIncomingIntent(incomingIntent: Intent?) {
        val incomingUri = extractIncomingUri(incomingIntent) ?: return
        val translated = analyzeAndTranslateUri(incomingUri)
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val service = translated.service

        // Lưu thống kê liên kết gần nhất
        prefs.edit()
            .putString(KEY_LAST_DISPATCHED_URL, translated.normalizedHttpsUrl)
            .putString(KEY_LAST_VIDEO_ID, translated.extractedId ?: (service?.title ?: "Web Link"))
            .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
            .apply()

        // 1. Nếu đường dẫn KHÔNG nằm trong danh sách các app (YouTube, YT Music, Spotify, FB, MXH):
        // Chuyển thẳng qua Trình duyệt Web đã chọn / tự động phát hiện trên máy!
        if (service == null) {
            openInDetectedBrowser(prefs, translated.normalizedHttpsUrl)
            return
        }

        // 2. Nếu luồng dịch vụ đó đang bị tắt: chuyển thẳng qua Trình duyệt đã chọn
        val isRouteEnabled = prefs.getBoolean(prefKeyRouteEnabled(service), true)
        if (!isRouteEnabled) {
            openInDetectedBrowser(prefs, translated.normalizedHttpsUrl)
            return
        }

        val targetPackage = resolveTargetPackageForLink(prefs, service, translated.linkSubType)
        val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, false)

        // 3. Nếu người dùng để trống Package của luồng đó: chuyển thẳng qua Trình duyệt đã chọn
        if (targetPackage.isBlank()) {
            openInDetectedBrowser(prefs, translated.normalizedHttpsUrl)
            return
        }

        // 4. Nếu chưa cài đặt gói Mod đích: tự động tắt luồng / vô hiệu hóa ComponentName
        // và mở thẳng qua Trình duyệt đã chọn mà không hiện bảng báo lỗi
        if (!isPackageInstalled(this, targetPackage)) {
            disableRouteAndAliasSilently(prefs, service)
            openInDetectedBrowser(prefs, translated.normalizedHttpsUrl)
            return
        }

        // 5. Bắn Intent sang ứng dụng đích
        val launched = tryLaunchTargetPackage(
            translated = translated,
            targetPackage = targetPackage,
            preferNativeScheme = useNativeScheme
        )

        if (!launched) {
            disableRouteAndAliasSilently(prefs, service)
            openInDetectedBrowser(prefs, translated.normalizedHttpsUrl)
        }
    }

    private fun disableRouteAndAliasSilently(
        prefs: android.content.SharedPreferences,
        service: ServiceRoute
    ) {
        prefs.edit().putBoolean(prefKeyRouteEnabled(service), false).apply()
        try {
            val componentName = ComponentName(packageName, service.aliasClassName)
            packageManager.setComponentEnabledSetting(
                componentName,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
        } catch (_: Exception) {
            // Bỏ qua
        }
    }

    private fun extractIncomingUri(incomingIntent: Intent?): Uri? {
        if (incomingIntent == null) return null
        return when (incomingIntent.action) {
            Intent.ACTION_VIEW -> incomingIntent.data
            Intent.ACTION_SEND -> {
                val sharedText = incomingIntent.getStringExtra(Intent.EXTRA_TEXT) ?: return null
                val matcher = URL_EXTRACT_PATTERN.matcher(sharedText)
                if (matcher.find()) {
                    matcher.group(1)?.let { Uri.parse(it) }
                } else null
            }
            else -> incomingIntent.data
        }
    }

    private fun analyzeAndTranslateUri(rawUri: Uri): TranslatedLinkResult {
        var workingUri = rawUri
        if (workingUri.path == "/attribution_link") {
            val innerU = workingUri.getQueryParameter("u")
            if (!innerU.isNullOrBlank()) {
                workingUri = Uri.parse("https://www.youtube.com$innerU")
            }
        }

        val host = workingUri.host?.lowercase() ?: ""
        val segments = workingUri.pathSegments
        val firstSegment = segments.firstOrNull()?.lowercase() ?: ""
        val httpsUri = if (workingUri.scheme == "http") {
            workingUri.buildUpon().scheme("https").build()
        } else {
            workingUri
        }
        val httpsString = httpsUri.toString()

        // 1. YOUTUBE MUSIC (music.youtube.com)
        if (host == "music.youtube.com") {
            val videoId = workingUri.getQueryParameter("v")
            val playlistId = workingUri.getQueryParameter("list")
            val nativeUri = if (!videoId.isNullOrBlank()) {
                Uri.parse("vnd.youtube.music:$videoId")
            } else null

            return TranslatedLinkResult(
                service = ServiceRoute.YOUTUBE_MUSIC,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = nativeUri,
                extractedId = videoId ?: playlistId,
                linkSubType = if (!playlistId.isNullOrBlank()) "YT_MUSIC_PLAYLIST" else "YT_MUSIC_TRACK"
            )
        }

        // 2. YOUTUBE VIDEO (youtube.com, www.youtube.com, m.youtube.com, youtu.be)
        if (
            host == "youtube.com" ||
            host == "www.youtube.com" ||
            host == "m.youtube.com" ||
            host == "youtu.be"
        ) {
            var videoId: String? = null
            var subType = "WATCH"
            when {
                host == "youtu.be" -> {
                    videoId = segments.firstOrNull()
                    subType = "SHORTLINK"
                }
                firstSegment == "watch" -> {
                    videoId = workingUri.getQueryParameter("v")
                    subType = "WATCH"
                }
                firstSegment == "shorts" -> {
                    videoId = segments.getOrNull(1)
                    subType = "SHORTS"
                }
                firstSegment == "live" -> {
                    videoId = segments.getOrNull(1)
                    subType = "LIVE"
                }
                firstSegment == "playlist" -> {
                    subType = "PLAYLIST"
                }
                else -> {
                    videoId = workingUri.getQueryParameter("v")
                }
            }
            val timestamp = workingUri.getQueryParameter("t") ?: workingUri.getQueryParameter("start")
            val vndUri = if (!videoId.isNullOrBlank()) {
                val base = "vnd.youtube:$videoId"
                Uri.parse(if (!timestamp.isNullOrBlank()) "$base?t=$timestamp" else base)
            } else null

            return TranslatedLinkResult(
                service = ServiceRoute.YOUTUBE_VIDEO,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = vndUri,
                extractedId = videoId ?: workingUri.getQueryParameter("list"),
                linkSubType = subType
            )
        }

        // 3. SPOTIFY
        if (host.contains("spotify.com") || host == "spotify.link" || host == "spoti.fi") {
            val validSpotifyTypes = setOf("track", "album", "playlist", "artist", "episode", "show")
            val resourceType = firstSegment.takeIf { it in validSpotifyTypes }
            val resourceId = segments.getOrNull(1)
            val spotifyNativeUri = if (resourceType != null && !resourceId.isNullOrBlank()) {
                Uri.parse("spotify:$resourceType:$resourceId")
            } else null

            return TranslatedLinkResult(
                service = ServiceRoute.SPOTIFY,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = spotifyNativeUri,
                extractedId = resourceId,
                linkSubType = resourceType?.uppercase() ?: "SPOTIFY_LINK"
            )
        }

        // 4. FACEBOOK
        if (host.contains("facebook.com") || host == "fb.watch" || host == "fb.com") {
            val encodedHref = Uri.encode(httpsString)
            val fbNativeUri = Uri.parse("fb://facewebmodal/f?href=$encodedHref")
            val videoId = workingUri.getQueryParameter("v") ?: segments.lastOrNull()
            return TranslatedLinkResult(
                service = ServiceRoute.FACEBOOK,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = fbNativeUri,
                extractedId = videoId,
                linkSubType = if (host == "fb.watch" || firstSegment == "watch") "FB_WATCH" else "FB_POST"
            )
        }

        // 5. MẠNG XÃ HỘI KHÁC (TikTok, Instagram, Threads, X/Twitter, Reddit)
        if (
            host.contains("tiktok.com") ||
            host.contains("instagram.com") ||
            host.contains("threads.net") ||
            host == "x.com" ||
            host.contains("twitter.com") ||
            host.contains("reddit.com")
        ) {
            val subType = when {
                host.contains("tiktok.com") -> "TIKTOK"
                host.contains("instagram.com") -> "INSTAGRAM"
                host.contains("threads.net") -> "THREADS"
                host.contains("reddit.com") -> "REDDIT"
                else -> "X_TWITTER"
            }
            return TranslatedLinkResult(
                service = ServiceRoute.SOCIAL_MEDIA,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = null,
                extractedId = segments.lastOrNull(),
                linkSubType = subType
            )
        }

        // 6. Các liên kết Web khác không nằm trong 5 nhóm trên -> service = null (Sẽ chuyển qua Trình duyệt)
        return TranslatedLinkResult(
            service = null,
            originalUrl = rawUri.toString(),
            normalizedHttpsUrl = httpsString,
            nativeSchemeUri = null,
            extractedId = host,
            linkSubType = "EXTERNAL_WEB_LINK"
        )
    }

    private fun resolveTargetPackageForLink(
        prefs: android.content.SharedPreferences,
        service: ServiceRoute,
        linkSubType: String
    ): String {
        val rawSaved = prefs.getString(prefKeyRoutePackage(service), service.defaultPackage)
        if (rawSaved != null && rawSaved.trim().isEmpty()) {
            return ""
        }
        val configured = rawSaved?.trim() ?: service.defaultPackage

        if (service == ServiceRoute.SOCIAL_MEDIA && configured == ServiceRoute.SOCIAL_MEDIA.defaultPackage) {
            return when (linkSubType) {
                "INSTAGRAM" -> if (isPackageInstalled(this, "com.instander.android")) "com.instander.android" else "com.instagram.android"
                "THREADS" -> "com.instagram.barcelona"
                "X_TWITTER" -> "com.twitter.android"
                "REDDIT" -> "com.reddit.frontpage"
                else -> configured
            }
        }
        return configured
    }

    private fun tryLaunchTargetPackage(
        translated: TranslatedLinkResult,
        targetPackage: String,
        preferNativeScheme: Boolean
    ): Boolean {
        val candidateUris = mutableListOf<Uri>()
        if (preferNativeScheme && translated.nativeSchemeUri != null) {
            candidateUris.add(translated.nativeSchemeUri)
        }
        candidateUris.add(Uri.parse(translated.normalizedHttpsUrl))
        if (!preferNativeScheme && translated.nativeSchemeUri != null) {
            candidateUris.add(translated.nativeSchemeUri)
        }

        for (uri in candidateUris) {
            val forwardIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                setPackage(targetPackage)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            try {
                startActivity(forwardIntent)
                return true
            } catch (_: ActivityNotFoundException) {
                // Thử URI kế tiếp
            } catch (_: Exception) {
                // Tiếp tục
            }
        }
        return false
    }

    /**
     * Mở liên kết qua Trình duyệt Web mà người dùng đã chọn, hoặc tự động lấy trình duyệt
     * đầu tiên phát hiện được trên thiết bị thông qua PackageManager.queryIntentActivities().
     */
    private fun openInDetectedBrowser(
        prefs: android.content.SharedPreferences,
        httpsUrl: String
    ) {
        val uri = Uri.parse(httpsUrl)
        val userChosenBrowserPkg = prefs.getString(KEY_FALLBACK_BROWSER_PACKAGE, "")?.trim().orEmpty()

        // 1. Ưu tiên mở bằng trình duyệt mà người dùng đã chọn trong MainActivity
        if (userChosenBrowserPkg.isNotEmpty() && isPackageInstalled(this, userChosenBrowserPkg)) {
            try {
                val chosenBrowserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage(userChosenBrowserPkg)
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(chosenBrowserIntent)
                return
            } catch (_: Exception) {
                // Nếu lỗi thì chuyển xuống danh sách trình duyệt tự động phát hiện
            }
        }

        // 2. Tự động quét danh sách trình duyệt hiện có trên máy và mở bằng trình duyệt đầu tiên tìm thấy
        val detectedBrowsers = detectInstalledBrowsers(this)
        for (browser in detectedBrowsers) {
            try {
                val autoBrowserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage(browser.packageName)
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(autoBrowserIntent)
                return
            } catch (_: Exception) {
                // Thử trình duyệt kế tiếp
            }
        }
    }

    companion object {
        const val PREFS_NAME = "link_dispatcher_prefs"
        const val KEY_USE_NATIVE_SCHEME = "use_vnd_scheme"
        const val KEY_WALLPAPER_STYLE = "wallpaper_style"
        const val KEY_FALLBACK_BROWSER_PACKAGE = "fallback_browser_package"
        const val KEY_LAST_DISPATCHED_URL = "last_dispatched_url"
        const val KEY_LAST_VIDEO_ID = "last_video_id"
        const val KEY_DISPATCH_COUNT = "dispatch_count"

        fun prefKeyRouteEnabled(route: ServiceRoute): String = "route_enabled_${route.id}"
        fun prefKeyRoutePackage(route: ServiceRoute): String =
            if (route == ServiceRoute.YOUTUBE_VIDEO) "target_package" else "route_pkg_${route.id}"

        private val URL_EXTRACT_PATTERN: Pattern =
            Pattern.compile("(https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+)")

        /**
         * Tự động phát hiện mọi trình duyệt Web đang cài đặt trên điện thoại thông qua
         * PackageManager.queryIntentActivities() với một URL web chuẩn (http://www.example.com).
         * Không cần định sẵn hay đoán trước tên gói trình duyệt.
         */
        fun detectInstalledBrowsers(context: Context): List<DetectedBrowser> {
            val pm = context.packageManager
            val probeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com")).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            }

            val resolveList = try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    pm.queryIntentActivities(
                        probeIntent,
                        PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_ALL.toLong())
                    )
                } else {
                    @Suppress("DEPRECATION")
                    pm.queryIntentActivities(probeIntent, PackageManager.MATCH_ALL)
                }
            } catch (_: Exception) {
                emptyList()
            }

            val result = mutableListOf<DetectedBrowser>()
            val seenPackages = mutableSetOf<String>()

            for (info in resolveList) {
                val pkg = info.activityInfo?.packageName ?: continue
                // Loại trừ chính ứng dụng Link Dispatcher để tránh vòng lặp
                if (pkg == context.packageName || !seenPackages.add(pkg)) continue

                val label = try {
                    info.loadLabel(pm).toString().ifBlank { pkg }
                } catch (_: Exception) {
                    pkg
                }
                result.add(DetectedBrowser(appName = label, packageName = pkg))
            }

            return result
        }

        fun isPackageInstalled(context: Context, targetPkg: String): Boolean {
            if (targetPkg.isBlank()) return false
            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    context.packageManager.getPackageInfo(
                        targetPkg,
                        PackageManager.PackageInfoFlags.of(0)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    context.packageManager.getPackageInfo(targetPkg, 0)
                }
                true
            } catch (_: PackageManager.NameNotFoundException) {
                false
            }
        }
    }
}
