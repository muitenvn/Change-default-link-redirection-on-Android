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
 * Thông tin một Trình duyệt Web được hệ thống tự động phát hiện trên thiết bị
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
    val defaultEnabled: Boolean,
    val suggestedPackages: List<Pair<String, String>>
) {
    YOUTUBE_VIDEO(
        id = "youtube_video",
        title = "YouTube Video",
        aliasClassName = "com.example.linkdispatcher.RouteYoutubeVideoAlias",
        defaultPackage = "app.morphe.android.youtube",
        defaultEnabled = true,
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
        defaultEnabled = true,
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
        defaultEnabled = true,
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
        defaultEnabled = true,
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
        defaultEnabled = true,
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
 * - Chuyển tiếp siêu mượt trong vài mili-giây và gọi finish() ngay lập tức.
 * - Phối hợp cùng BrowserUrlInterceptorService để bắt link cả khi người dùng ĐANG Ở TRONG TRÌNH DUYỆT
 *   (nhấn link YouTube trên Google Search hoặc trang web trong Chrome/Brave/Firefox).
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

        // Nếu link không nằm trong các dịch vụ ứng dụng (YouTube, YT Music, Spotify, FB, MXH)
        // -> Tự động chuyển thẳng sang Trình duyệt Web đã chọn / tự động phát hiện trên máy
        if (service == null) {
            prefs.edit()
                .putString(KEY_LAST_DISPATCHED_URL, translated.normalizedHttpsUrl)
                .putString(KEY_LAST_VIDEO_ID, "WEB_BROWSER")
                .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
                .apply()
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            return
        }

        val isRouteEnabled = prefs.getBoolean(
            prefKeyRouteEnabled(service),
            service.defaultEnabled
        )

        if (!isRouteEnabled) {
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            return
        }

        val targetPackage = resolveTargetPackageForLink(this, prefs, service, translated.linkSubType)
        val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, false)

        prefs.edit()
            .putString(KEY_LAST_DISPATCHED_URL, translated.normalizedHttpsUrl)
            .putString(KEY_LAST_VIDEO_ID, translated.extractedId ?: service.title)
            .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
            .apply()

        if (targetPackage.isBlank()) {
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            return
        }

        if (!isPackageInstalled(this, targetPackage)) {
            disableRouteAndAliasSilently(this, prefs, service)
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            return
        }

        val launched = tryLaunchTargetPackage(
            context = this,
            translated = translated,
            targetPackage = targetPackage,
            preferNativeScheme = useNativeScheme
        )

        if (!launched) {
            disableRouteAndAliasSilently(this, prefs, service)
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
        }
    }

    private fun extractIncomingUri(incomingIntent: Intent?): Uri? {
        if (incomingIntent == null) return null
        return when (incomingIntent.action) {
            Intent.ACTION_VIEW -> incomingIntent.data
            Intent.ACTION_SEND -> {
                val sharedText = incomingIntent.getStringExtra(Intent.EXTRA_TEXT) ?: return null
                extractFirstUrlUri(sharedText)
            }
            Intent.ACTION_PROCESS_TEXT -> {
                val selectedText = incomingIntent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString()
                    ?: return null
                extractFirstUrlUri(selectedText)
            }
            else -> incomingIntent.data
        }
    }

    private fun extractFirstUrlUri(text: String): Uri? {
        val matcher = URL_EXTRACT_PATTERN.matcher(text)
        return if (matcher.find()) {
            matcher.group(1)?.let { Uri.parse(it) }
        } else {
            val trimmed = text.trim()
            if (trimmed.contains(".") && !trimmed.contains(" ")) {
                Uri.parse(if (trimmed.startsWith("http")) trimmed else "https://$trimmed")
            } else null
        }
    }

    companion object {
        const val PREFS_NAME = "link_dispatcher_prefs"
        const val KEY_USE_NATIVE_SCHEME = "use_vnd_scheme"
        const val KEY_WALLPAPER_STYLE = "wallpaper_style"
        const val KEY_FALLBACK_BROWSER_PACKAGE = "fallback_browser_package"
        const val KEY_IN_BROWSER_INTERCEPT_ENABLED = "in_browser_intercept_enabled"
        const val KEY_IN_BROWSER_AUTO_BACK = "in_browser_auto_back"
        const val KEY_LAST_DISPATCHED_URL = "last_dispatched_url"
        const val KEY_LAST_VIDEO_ID = "last_video_id"
        const val KEY_DISPATCH_COUNT = "dispatch_count"

        fun prefKeyRouteEnabled(route: ServiceRoute): String = "route_enabled_${route.id}"
        fun prefKeyRoutePackage(route: ServiceRoute): String =
            if (route == ServiceRoute.YOUTUBE_VIDEO) "target_package" else "route_pkg_${route.id}"

        private val URL_EXTRACT_PATTERN: Pattern =
            Pattern.compile("(https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+)")

        /**
         * Được gọi trực tiếp từ BrowserUrlInterceptorService khi phát hiện người dùng
         * nhấn vào link YouTube / YT Music / Spotify NGAY BÊN TRONG TRÌNH DUYỆT.
         * Trả về true nếu đã phóng thành công sang ứng dụng Mod đích.
         */
        fun dispatchUrlFromBrowserService(context: Context, httpsUrl: String): Boolean {
            val rawUri = try {
                Uri.parse(httpsUrl)
            } catch (_: Exception) {
                return false
            }

            val translated = analyzeAndTranslateUri(rawUri)
            val service = translated.service ?: return false

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val isRouteEnabled = prefs.getBoolean(prefKeyRouteEnabled(service), service.defaultEnabled)
            if (!isRouteEnabled) return false

            val targetPackage = resolveTargetPackageForLink(
                context,
                prefs,
                service,
                translated.linkSubType
            )
            if (targetPackage.isBlank()) return false

            if (!isPackageInstalled(context, targetPackage)) {
                disableRouteAndAliasSilently(context, prefs, service)
                return false
            }

            val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, false)
            val launched = tryLaunchTargetPackage(
                context = context,
                translated = translated,
                targetPackage = targetPackage,
                preferNativeScheme = useNativeScheme
            )

            if (launched) {
                prefs.edit()
                    .putString(KEY_LAST_DISPATCHED_URL, translated.normalizedHttpsUrl)
                    .putString(KEY_LAST_VIDEO_ID, translated.extractedId ?: service.title)
                    .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
                    .apply()
            }
            return launched
        }

        fun analyzeAndTranslateUri(rawUri: Uri): TranslatedLinkResult {
            var workingUri = rawUri
            val initialScheme = workingUri.scheme?.lowercase() ?: ""

            // Hỗ trợ khi trình duyệt bắn custom scheme vnd.youtube:// hoặc youtube://
            if (initialScheme == "vnd.youtube" || initialScheme == "youtube") {
                val idFromScheme = workingUri.schemeSpecificPart
                    ?.removePrefix("//")
                    ?.substringBefore("?")
                    ?.substringBefore("&")
                    ?.trim()
                if (!idFromScheme.isNullOrBlank()) {
                    workingUri = Uri.parse("https://www.youtube.com/watch?v=$idFromScheme")
                }
            } else if (initialScheme == "vnd.youtube.music") {
                val idFromScheme = workingUri.schemeSpecificPart
                    ?.removePrefix("//")
                    ?.substringBefore("?")
                    ?.trim()
                if (!idFromScheme.isNullOrBlank()) {
                    workingUri = Uri.parse("https://music.youtube.com/watch?v=$idFromScheme")
                }
            }

            // Tự động bóc tách liên kết chuyển hướng từ Google Search trong trình duyệt (google.com/url?q=...)
            val initialHost = workingUri.host?.lowercase() ?: ""
            if (initialHost.contains("google.") && workingUri.path == "/url") {
                val redirectedTarget = workingUri.getQueryParameter("q")
                    ?: workingUri.getQueryParameter("url")
                if (!redirectedTarget.isNullOrBlank() && redirectedTarget.startsWith("http")) {
                    workingUri = Uri.parse(redirectedTarget)
                }
            }

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

            return TranslatedLinkResult(
                service = null,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = null,
                extractedId = null,
                linkSubType = "GENERIC_WEB"
            )
        }

        private fun resolveTargetPackageForLink(
            context: Context,
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
                    "INSTAGRAM" -> if (isPackageInstalled(context, "com.instander.android")) "com.instander.android" else "com.instagram.android"
                    "THREADS" -> "com.instagram.barcelona"
                    "X_TWITTER" -> "com.twitter.android"
                    "REDDIT" -> "com.reddit.frontpage"
                    else -> configured
                }
            }
            return configured
        }

        private fun tryLaunchTargetPackage(
            context: Context,
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
                    context.startActivity(forwardIntent)
                    return true
                } catch (_: ActivityNotFoundException) {
                    // Thử URI kế tiếp
                } catch (_: Exception) {
                    // Tiếp tục
                }
            }
            return false
        }

        private fun disableRouteAndAliasSilently(
            context: Context,
            prefs: android.content.SharedPreferences,
            service: ServiceRoute
        ) {
            prefs.edit().putBoolean(prefKeyRouteEnabled(service), false).apply()
            try {
                val componentName = ComponentName(context.packageName, service.aliasClassName)
                context.packageManager.setComponentEnabledSetting(
                    componentName,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
                )
            } catch (_: Exception) {
                // Bỏ qua
            }
        }

        private fun openInDetectedBrowser(
            context: Context,
            prefs: android.content.SharedPreferences,
            httpsUrl: String
        ) {
            val uri = Uri.parse(httpsUrl)
            val preferredBrowserPkg = prefs.getString(KEY_FALLBACK_BROWSER_PACKAGE, "")?.trim().orEmpty()

            if (preferredBrowserPkg.isNotEmpty() && preferredBrowserPkg != context.packageName && isPackageInstalled(context, preferredBrowserPkg)) {
                if (tryStartBrowserPackage(context, uri, preferredBrowserPkg)) {
                    return
                }
            }

            val detectedBrowsers = detectInstalledBrowsers(context)
            for (browser in detectedBrowsers) {
                if (tryStartBrowserPackage(context, uri, browser.packageName)) {
                    return
                }
            }
        }

        private fun tryStartBrowserPackage(context: Context, uri: Uri, browserPkg: String): Boolean {
            return try {
                val browserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage(browserPkg)
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(browserIntent)
                true
            } catch (_: Exception) {
                false
            }
        }

        private fun isPackageInstalled(context: Context, targetPkg: String): Boolean {
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

        /**
         * Tự động phát hiện (Auto-detect) tất cả trình duyệt Web đang được cài đặt trên thiết bị
         */
        fun detectInstalledBrowsers(context: Context): List<DetectedBrowser> {
            val pm = context.packageManager
            val probeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com")).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            }

            val resolveInfos = try {
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

            val seenPackages = mutableSetOf<String>()
            val browsers = mutableListOf<DetectedBrowser>()

            for (info in resolveInfos) {
                val pkg = info.activityInfo?.packageName ?: continue
                if (pkg == context.packageName || !seenPackages.add(pkg)) continue
                val label = try {
                    info.loadLabel(pm).toString().takeIf { it.isNotBlank() } ?: pkg
                } catch (_: Exception) {
                    pkg
                }
                browsers.add(DetectedBrowser(appName = label, packageName = pkg))
            }

            return browsers
        }
    }
}
