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
            "Mở bằng Web (Để trống)" to ""
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
            "Mở bằng Web (Để trống)" to ""
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
            "Mở bằng Web (Để trống)" to ""
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
            "Mở bằng Web (Để trống)" to ""
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
            "Mở bằng Web (Để trống)" to ""
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
 * RouterActivity kế thừa trực tiếp từ android.app.Activity với Theme.NoDisplay (như phiên bản đầu):
 * - Không khởi tạo giao diện, chuyển tiếp siêu mượt trong vài mili-giây và gọi finish() ngay lập tức.
 * - KHÔNG tự mở app mặc định khi chưa cài bản Mod.
 * - KHÔNG hiển thị bảng báo lỗi "Không tìm thấy ứng dụng đích".
 * - Nếu gói đích (ví dụ app.morphe.android.youtube) chưa được cài đặt trên máy:
 *   tự động tắt luồng / vô hiệu hóa ComponentName của luồng đó và mở thẳng qua trình duyệt Web.
 */
class RouterActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIncomingIntent(intent)
        // Đóng ngay lập tức không để lại bất kỳ cửa sổ hay lịch sử nào trên backstack
        finish()
    }

    private fun handleIncomingIntent(incomingIntent: Intent?) {
        val incomingUri = extractIncomingUri(incomingIntent) ?: return
        val translated = analyzeAndTranslateUri(incomingUri)
        val service = translated.service

        // Nếu liên kết không thuộc 5 nhóm dịch vụ (khi app được đặt làm Default Browser), mở thẳng ra trình duyệt
        if (service == null) {
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isRouteEnabled = prefs.getBoolean(prefKeyRouteEnabled(service), true)

        if (!isRouteEnabled) {
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        val targetPackage = resolveTargetPackageForLink(prefs, service, translated.linkSubType)
        val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, false)

        // Lưu thống kê liên kết gần nhất
        prefs.edit()
            .putString(KEY_LAST_DISPATCHED_URL, translated.normalizedHttpsUrl)
            .putString(KEY_LAST_VIDEO_ID, translated.extractedId ?: service.title)
            .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
            .apply()

        // Nếu để trống Package (chế độ mở bằng Web), chuyển thẳng ra trình duyệt
        if (targetPackage.isBlank()) {
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        // Kiểm tra xem gói đích (ví dụ app.morphe.android.youtube) đã cài đặt chưa
        if (!isPackageInstalled(targetPackage)) {
            // Chưa cài bản Mod -> Tự động tắt luồng & vô hiệu hóa ComponentName của luồng đó,
            // đồng thời mở thẳng qua trình duyệt mà KHÔNG hiện bảng báo lỗi
            disableRouteAndAliasSilently(prefs, service)
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        // Thử bắn Intent sang gói đích đã chọn
        val launched = tryLaunchTargetPackage(
            translated = translated,
            targetPackage = targetPackage,
            preferNativeScheme = useNativeScheme
        )

        if (!launched) {
            // Nếu không mở được, tự động tắt luồng đó và chuyển thẳng qua trình duyệt, không báo lỗi
            disableRouteAndAliasSilently(prefs, service)
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
        }
    }

    /**
     * Tự động tắt công tắc luồng trong SharedPreferences và vô hiệu hóa ComponentName (<activity-alias>)
     * ở cấp hệ điều hành khi phát hiện gói đích chưa được cài đặt.
     */
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
            // Bỏ qua nếu hệ thống không cho phép
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

        // 1. Luồng riêng cho YOUTUBE MUSIC (music.youtube.com)
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

        // 2. Luồng cho YOUTUBE VIDEO (youtube.com, www.youtube.com, m.youtube.com, youtu.be)
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

        // 3. Luồng cho SPOTIFY
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

        // 4. Luồng cho FACEBOOK
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

        // 5. Luồng cho MẠNG XÃ HỘI KHÁC
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

        // Các tên miền web thông thường khác (khi đặt làm Default Browser)
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
                "INSTAGRAM" -> if (isPackageInstalled("com.instander.android")) "com.instander.android" else "com.instagram.android"
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
     * Mở thẳng liên kết qua trình duyệt Web bên ngoài mà không hiện bất kỳ bảng báo lỗi nào
     * và không bị vòng lặp lại vào chính ứng dụng này.
     */
    private fun openDirectlyInExternalBrowser(httpsUrl: String) {
        val uri = Uri.parse(httpsUrl)
        val knownBrowsers = listOf(
            "com.android.chrome",
            "com.brave.browser",
            "org.mozilla.firefox",
            "com.microsoft.emmx",
            "com.sec.android.app.sbrowser",
            "com.opera.browser"
        )

        for (browserPkg in knownBrowsers) {
            if (isPackageInstalled(browserPkg)) {
                try {
                    val directBrowserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                        setPackage(browserPkg)
                        addCategory(Intent.CATEGORY_BROWSABLE)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(directBrowserIntent)
                    return
                } catch (_: Exception) {
                    // Thử trình duyệt tiếp theo
                }
            }
        }

        // Nếu máy dùng trình duyệt khác ngoài danh sách trên, truy vấn động từ PackageManager
        try {
            val probeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com")).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            }
            val resolveInfos = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.queryIntentActivities(
                    probeIntent,
                    PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_ALL.toLong())
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.queryIntentActivities(probeIntent, PackageManager.MATCH_ALL)
            }

            val externalBrowserPkg = resolveInfos
                .mapNotNull { it.activityInfo?.packageName }
                .firstOrNull { it != packageName }

            if (!externalBrowserPkg.isNullOrBlank()) {
                val fallbackBrowserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage(externalBrowserPkg)
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                startActivity(fallbackBrowserIntent)
                return
            }
        } catch (_: Exception) {
            // Bỏ qua
        }

        try {
            val genericIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(genericIntent)
        } catch (_: Exception) {
            // Không hiển thị bất kỳ thông báo lỗi nào theo yêu cầu
        }
    }

    private fun isPackageInstalled(targetPkg: String): Boolean {
        if (targetPkg.isBlank()) return false
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(
                    targetPkg,
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(targetPkg, 0)
            }
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }

    companion object {
        const val PREFS_NAME = "link_dispatcher_prefs"
        const val KEY_USE_NATIVE_SCHEME = "use_vnd_scheme"
        const val KEY_WALLPAPER_STYLE = "wallpaper_style"
        const val KEY_LAST_DISPATCHED_URL = "last_dispatched_url"
        const val KEY_LAST_VIDEO_ID = "last_video_id"
        const val KEY_DISPATCH_COUNT = "dispatch_count"

        fun prefKeyRouteEnabled(route: ServiceRoute): String = "route_enabled_${route.id}"
        fun prefKeyRoutePackage(route: ServiceRoute): String =
            if (route == ServiceRoute.YOUTUBE_VIDEO) "target_package" else "route_pkg_${route.id}"

        private val URL_EXTRACT_PATTERN: Pattern =
            Pattern.compile("(https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+)")
    }
}
