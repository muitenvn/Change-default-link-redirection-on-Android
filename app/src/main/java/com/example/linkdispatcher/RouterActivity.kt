package com.example.linkdispatcher

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.util.regex.Pattern

/**
 * Danh mục các dịch vụ (luồng điều hướng) được hỗ trợ
 */
enum class ServiceRoute(
    val id: String,
    val title: String,
    val aliasClassName: String,
    val defaultPackage: String,
    val officialPackage: String,
    val suggestedPackages: List<Pair<String, String>>
) {
    YOUTUBE_VIDEO(
        id = "youtube_video",
        title = "YouTube Video",
        aliasClassName = "com.example.linkdispatcher.RouteYoutubeVideoAlias",
        defaultPackage = "app.morphe.android.youtube",
        officialPackage = "com.google.android.youtube",
        suggestedPackages = listOf(
            "YouTube Morphe (Mod)" to "app.morphe.android.youtube",
            "YouTube ReVanced (Mod)" to "app.revanced.android.youtube",
            "RVX YouTube (Mod)" to "app.rvx.android.youtube",
            "YouTube Mặc định (Official)" to "com.google.android.youtube",
            "NewPipe" to "org.schabi.newpipe",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    YOUTUBE_MUSIC(
        id = "youtube_music",
        title = "YouTube Music",
        aliasClassName = "com.example.linkdispatcher.RouteYoutubeMusicAlias",
        defaultPackage = "app.rvx.android.apps.youtube.music",
        officialPackage = "com.google.android.apps.youtube.music",
        suggestedPackages = listOf(
            "RVX Music (Mod)" to "app.rvx.android.apps.youtube.music",
            "ReVanced Music (Mod)" to "app.revanced.android.apps.youtube.music",
            "Morphe Music (Mod)" to "app.morphe.android.apps.youtube.music",
            "YouTube Music Mặc định" to "com.google.android.apps.youtube.music",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    SPOTIFY(
        id = "spotify",
        title = "Spotify",
        aliasClassName = "com.example.linkdispatcher.RouteSpotifyAlias",
        defaultPackage = "com.spotify.music",
        officialPackage = "com.spotify.music",
        suggestedPackages = listOf(
            "Spotify Mặc định / xManager" to "com.spotify.music",
            "Spotify Lite" to "com.spotify.lite",
            "Spotube (Open Source)" to "oss.krtirtho.spotube",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    FACEBOOK(
        id = "facebook",
        title = "Facebook & Watch",
        aliasClassName = "com.example.linkdispatcher.RouteFacebookAlias",
        defaultPackage = "com.facebook.katana",
        officialPackage = "com.facebook.katana",
        suggestedPackages = listOf(
            "Facebook Mặc định" to "com.facebook.katana",
            "Facebook Lite" to "com.facebook.lite",
            "SlimSocial for Facebook" to "it.rignanese.leo.slimfacebook",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    SOCIAL_MEDIA(
        id = "social_media",
        title = "Mạng xã hội (TikTok / IG / X / Reddit)",
        aliasClassName = "com.example.linkdispatcher.RouteSocialAlias",
        defaultPackage = "com.ss.android.ugc.trill",
        officialPackage = "com.ss.android.ugc.trill",
        suggestedPackages = listOf(
            "TikTok Mặc định (Châu Á)" to "com.ss.android.ugc.trill",
            "TikTok Quốc tế / Mod" to "com.zhiliaoapp.musically",
            "Instagram Mặc định" to "com.instagram.android",
            "Instander (IG Mod)" to "com.instander.android",
            "X / Twitter" to "com.twitter.android",
            "Reddit Mặc định" to "com.reddit.frontpage",
            "Mở bằng Web (Để trống)" to ""
        )
    )
}

/**
 * Kết quả phân tích và dịch tự động URL đầu vào sang URI đích
 */
data class TranslatedLinkResult(
    val service: ServiceRoute,
    val originalUrl: String,
    val normalizedHttpsUrl: String,
    val nativeSchemeUri: Uri?,
    val extractedId: String?,
    val linkSubType: String
)

class RouterActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val incomingUri = extractIncomingUri(intent)
        if (incomingUri == null) {
            finish()
            return
        }

        val translated = analyzeAndTranslateUri(incomingUri)
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // Kiểm tra xem người dùng có tắt luồng dịch vụ này để tránh đụng hàng hay không
        val isRouteEnabled = prefs.getBoolean(prefKeyRouteEnabled(translated.service), true)
        if (!isRouteEnabled) {
            // Nếu người dùng đã tắt luồng này, chuyển thẳng sang bộ chọn/trình duyệt mà không ép package
            launchSystemDefaultOrBrowser(translated.normalizedHttpsUrl)
            finish()
            return
        }

        val targetPackage = resolveTargetPackageForLink(prefs, translated)
        val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, false)

        // Lưu nhật ký điều hướng gần nhất
        prefs.edit()
            .putString(KEY_LAST_DISPATCHED_URL, translated.normalizedHttpsUrl)
            .putString(KEY_LAST_VIDEO_ID, translated.extractedId ?: translated.service.title)
            .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
            .apply()

        // Nếu người dùng để trống Package (chế độ mở Web), chuyển thẳng ra Trình duyệt
        if (targetPackage.isBlank()) {
            launchSystemDefaultOrBrowser(translated.normalizedHttpsUrl)
            finish()
            return
        }

        // Bước 1: Tự động dịch và bắn thẳng tới ứng dụng đích
        val launched = tryLaunchTargetPackage(
            translated = translated,
            targetPackage = targetPackage,
            preferNativeScheme = useNativeScheme
        )

        if (launched) {
            finish()
            return
        }

        // Bước 2: Nếu gói đích chưa cài đặt, kiểm tra xem người dùng có bật chế độ tự động fallback sang App Mặc định không
        val autoFallbackOfficial = prefs.getBoolean(KEY_AUTO_FALLBACK_OFFICIAL, true)
        if (autoFallbackOfficial && targetPackage != translated.service.officialPackage) {
            val officialLaunched = tryLaunchTargetPackage(
                translated = translated,
                targetPackage = translated.service.officialPackage,
                preferNativeScheme = false
            )
            if (officialLaunched) {
                finish()
                return
            }
        }

        // Bước 3: Hiển thị ModalBottomSheet Compose Material 3 để người dùng chọn
        val installedSuggestions = translated.service.suggestedPackages
            .map { it.second }
            .distinct()
            .filter { pkg -> pkg != targetPackage && isPackageInstalled(pkg) }

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                FallbackBottomSheet(
                    translated = translated,
                    missingPackage = targetPackage,
                    installedAlternatives = installedSuggestions,
                    onSelectPackage = { chosenPkg ->
                        tryLaunchTargetPackage(translated, chosenPkg, preferNativeScheme = false)
                        finish()
                    },
                    onOpenNativeScheme = {
                        launchImplicitNativeOrBrowser(translated, forceBrowser = false)
                        finish()
                    },
                    onOpenBrowser = {
                        launchImplicitNativeOrBrowser(translated, forceBrowser = true)
                        finish()
                    },
                    onOpenSettings = {
                        startActivity(Intent(this@RouterActivity, MainActivity::class.java))
                        finish()
                    },
                    onDismiss = {
                        finish()
                    }
                )
            }
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

    /**
     * Tự động nhận diện tên miền (YouTube Music, YouTube Video, Spotify, Facebook, TikTok, IG, X...)
     * và dịch sang cả URL chuẩn lẫn Native Deep Link Scheme tương ứng.
     */
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
            val nativeUri = when {
                !videoId.isNullOrBlank() -> Uri.parse("vnd.youtube.music:$videoId")
                else -> null
            }
            return TranslatedLinkResult(
                service = ServiceRoute.YOUTUBE_MUSIC,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = nativeUri,
                extractedId = videoId ?: playlistId,
                linkSubType = if (!playlistId.isNullOrBlank()) "YT_MUSIC_PLAYLIST" else "YT_MUSIC_TRACK"
            )
        }

        // 2. Luồng cho SPOTIFY (open.spotify.com, spotify.link, spoti.fi)
        if (host.contains("spotify.com") || host == "spotify.link" || host == "spoti.fi") {
            // Dịch open.spotify.com/track/<id> -> spotify:track:<id>
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

        // 3. Luồng cho FACEBOOK (facebook.com, m.facebook.com, fb.watch, fb.com)
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

        // 4. Luồng cho MẠNG XÃ HỘI KHÁC (TikTok, Instagram, Threads, X/Twitter, Reddit)
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

        // 5. Mặc định: YOUTUBE VIDEO (youtube.com, www.youtube.com, m.youtube.com, youtu.be)
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

    /**
     * Xác định chính xác Package Name đích theo từng dịch vụ hoặc từng tên miền mạng xã hội
     */
    private fun resolveTargetPackageForLink(
        prefs: android.content.SharedPreferences,
        translated: TranslatedLinkResult
    ): String {
        val rawSaved = prefs.getString(
            prefKeyRoutePackage(translated.service),
            translated.service.defaultPackage
        )
        // Nếu người dùng chủ động để trống ("") cho phần Web, giữ nguyên chuỗi rỗng
        if (rawSaved != null && rawSaved.trim().isEmpty()) {
            return ""
        }
        val configured = rawSaved?.trim() ?: translated.service.defaultPackage

        // Hỗ trợ tự động chọn đúng app cho nhóm SOCIAL_MEDIA nếu người dùng chưa ghi đè package riêng
        if (translated.service == ServiceRoute.SOCIAL_MEDIA && configured == ServiceRoute.SOCIAL_MEDIA.defaultPackage) {
            return when (translated.linkSubType) {
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
                // Tiếp tục thử phương án URI kế tiếp
            } catch (_: Exception) {
                // Bỏ qua lỗi
            }
        }
        return false
    }

    private fun launchImplicitNativeOrBrowser(translated: TranslatedLinkResult, forceBrowser: Boolean) {
        if (!forceBrowser && translated.nativeSchemeUri != null) {
            try {
                startActivity(
                    Intent(Intent.ACTION_VIEW, translated.nativeSchemeUri).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                )
                return
            } catch (_: Exception) {
                // Nếu không có app hỗ trợ scheme nội bộ, mở qua trình duyệt
            }
        }
        launchSystemDefaultOrBrowser(translated.normalizedHttpsUrl)
    }

    private fun launchSystemDefaultOrBrowser(httpsUrl: String) {
        try {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(httpsUrl)).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(
                Intent.createChooser(browserIntent, "Chọn ứng dụng để mở liên kết")
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            )
        } catch (_: Exception) {
            // Bỏ qua
        }
    }

    private fun isPackageInstalled(packageName: String): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(
                    packageName,
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(packageName, 0)
            }
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }

    companion object {
        const val PREFS_NAME = "link_dispatcher_prefs"
        const val KEY_USE_NATIVE_SCHEME = "use_vnd_scheme"
        const val KEY_AUTO_FALLBACK_OFFICIAL = "auto_fallback_official"
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FallbackBottomSheet(
    translated: TranslatedLinkResult,
    missingPackage: String,
    installedAlternatives: List<String>,
    onSelectPackage: (String) -> Unit,
    onOpenNativeScheme: () -> Unit,
    onOpenBrowser: () -> Unit,
    onOpenSettings: () -> Unit,
    onDismiss: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Không tìm thấy ứng dụng đích (${translated.service.title})",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Gói đã cấu hình \"$missingPackage\" hiện chưa được cài đặt. Bạn có thể mở ngay bằng ứng dụng mặc định, ứng dụng thay thế hoặc tắt luồng này nếu bị đụng hàng.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "URL: ${translated.normalizedHttpsUrl}",
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace
                )
                if (translated.nativeSchemeUri != null) {
                    Text(
                        text = "Native URI: ${translated.nativeSchemeUri}",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            HorizontalDivider()

            if (installedAlternatives.isNotEmpty()) {
                Text(
                    text = "Ứng dụng tương thích phát hiện trên thiết bị:",
                    style = MaterialTheme.typography.labelLarge
                )
                installedAlternatives.forEach { altPkg ->
                    Button(
                        onClick = { onSelectPackage(altPkg) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Mở bằng $altPkg")
                    }
                }
            }

            if (translated.nativeSchemeUri != null) {
                OutlinedButton(
                    onClick = onOpenNativeScheme,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Mở qua giao thức ${translated.nativeSchemeUri}")
                }
            }

            OutlinedButton(
                onClick = onOpenBrowser,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Mở qua Trình duyệt hoặc Bộ chọn hệ thống")
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                TextButton(onClick = onOpenSettings) {
                    Text("Cấu hình / Tắt luồng này")
                }
                TextButton(onClick = onDismiss) {
                    Text("Đóng")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}
