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
 * Kết quả phân tích (bóc tách) liên kết YouTube
 */
data class ParsedYoutubeLink(
    val originalUrl: String,
    val normalizedHttpsUrl: String,
    val videoId: String?,
    val playlistId: String?,
    val timestampSeconds: String?,
    val linkType: String // "WATCH", "SHORTS", "LIVE", "PLAYLIST", "SHORTLINK", "GENERIC"
) {
    /**
     * Sinh URI theo custom scheme "vnd.youtube:<id>" nếu bóc tách được videoId
     */
    fun toVndYoutubeUri(): Uri? {
        if (videoId.isNullOrBlank()) return null
        val base = "vnd.youtube:$videoId"
        return if (!timestampSeconds.isNullOrBlank()) {
            Uri.parse("$base?t=$timestampSeconds")
        } else {
            Uri.parse(base)
        }
    }
}

/**
 * RouterActivity: Activity trung gian không giao diện nền (Theme.Translucent.NoTitleBar).
 * - Tự động bóc tách videoId / playlistId / URL gốc trong onCreate.
 * - Ưu tiên mở trực tiếp qua Package Name đích đã cấu hình và gọi finish() ngay lập tức.
 * - Nếu không tìm thấy ứng dụng đích, hiển thị ModalBottomSheet (Compose Material 3)
 *   để người dùng chọn mở qua gói dự phòng, trình duyệt hoặc chỉnh lại cấu hình.
 */
class RouterActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val incomingUri = extractIncomingUri(intent)
        if (incomingUri == null) {
            finish()
            return
        }

        val parsed = parseYoutubeUri(incomingUri)
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val configuredPackage = prefs.getString(KEY_TARGET_PACKAGE, DEFAULT_TARGET_PACKAGE)
            ?.trim()
            .takeUnless { it.isNullOrEmpty() }
            ?: DEFAULT_TARGET_PACKAGE
        val preferVndScheme = prefs.getBoolean(KEY_USE_VND_SCHEME, false)

        // Ghi nhận thống kê liên kết vừa xử lý
        prefs.edit()
            .putString(KEY_LAST_DISPATCHED_URL, parsed.normalizedHttpsUrl)
            .putString(KEY_LAST_VIDEO_ID, parsed.videoId ?: "N/A")
            .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
            .apply()

        // Bước 1: Thử chuyển tiếp tức thì sang package đích đã cấu hình
        val launchedPrimary = tryLaunchPackage(
            parsed = parsed,
            targetPackage = configuredPackage,
            useVndScheme = preferVndScheme
        )

        if (launchedPrimary) {
            // Thành công -> đóng ngay lập tức để không lưu vết trên backstack
            finish()
            return
        }

        // Bước 2: Nếu không tìm thấy app đích, hiển thị BottomSheet Fallback bằng Jetpack Compose
        val installedAlternatives = KNOWN_YOUTUBE_PACKAGES.filter { pkg ->
            pkg != configuredPackage && isPackageInstalled(pkg)
        }

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                FallbackBottomSheet(
                    parsed = parsed,
                    missingPackage = configuredPackage,
                    installedAlternatives = installedAlternatives,
                    onSelectPackage = { selectedPkg ->
                        tryLaunchPackage(parsed, selectedPkg, useVndScheme = false)
                        finish()
                    },
                    onOpenVndSchemeImplicit = {
                        launchImplicitVndOrBrowser(parsed, forceBrowser = false)
                        finish()
                    },
                    onOpenBrowser = {
                        launchImplicitVndOrBrowser(parsed, forceBrowser = true)
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

    /**
     * Lấy Uri từ Intent.ACTION_VIEW hoặc tách URL từ Intent.ACTION_SEND (Share text)
     */
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
     * Bóc tách chi tiết Video ID, Playlist ID, Timestamp từ các biến thể link YouTube:
     * - https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL123
     * - https://youtu.be/dQw4w9WgXcQ?t=42
     * - https://m.youtube.com/shorts/abc123xyz
     * - https://www.youtube.com/live/xyz987abc
     */
    private fun parseYoutubeUri(rawUri: Uri): ParsedYoutubeLink {
        var workingUri = rawUri

        // Giải bọc nếu là link attribution_link
        if (workingUri.path == "/attribution_link") {
            val innerU = workingUri.getQueryParameter("u")
            if (!innerU.isNullOrBlank()) {
                workingUri = Uri.parse("https://www.youtube.com$innerU")
            }
        }

        val host = workingUri.host?.lowercase() ?: "www.youtube.com"
        val pathSegments = workingUri.pathSegments
        val firstSegment = pathSegments.firstOrNull()?.lowercase()

        var videoId: String? = null
        var linkType = "GENERIC"

        when {
            host == "youtu.be" -> {
                videoId = pathSegments.firstOrNull()
                linkType = "SHORTLINK"
            }
            firstSegment == "watch" -> {
                videoId = workingUri.getQueryParameter("v")
                linkType = "WATCH"
            }
            firstSegment == "shorts" -> {
                videoId = pathSegments.getOrNull(1)
                linkType = "SHORTS"
            }
            firstSegment == "live" -> {
                videoId = pathSegments.getOrNull(1)
                linkType = "LIVE"
            }
            firstSegment == "embed" || firstSegment == "v" -> {
                videoId = pathSegments.getOrNull(1)
                linkType = "WATCH"
            }
            firstSegment == "playlist" -> {
                linkType = "PLAYLIST"
            }
            else -> {
                videoId = workingUri.getQueryParameter("v")
            }
        }

        val playlistId = workingUri.getQueryParameter("list")
        val timestamp = workingUri.getQueryParameter("t") ?: workingUri.getQueryParameter("start")

        val httpsUri = if (workingUri.scheme == "http") {
            workingUri.buildUpon().scheme("https").build()
        } else {
            workingUri
        }

        return ParsedYoutubeLink(
            originalUrl = rawUri.toString(),
            normalizedHttpsUrl = httpsUri.toString(),
            videoId = videoId?.takeIf { it.isNotBlank() },
            playlistId = playlistId?.takeIf { it.isNotBlank() },
            timestampSeconds = timestamp?.takeIf { it.isNotBlank() },
            linkType = linkType
        )
    }

    /**
     * Bắn Intent sang package đích. Hỗ trợทั้ง URL https gốc và scheme vnd.youtube:<id>
     */
    private fun tryLaunchPackage(
        parsed: ParsedYoutubeLink,
        targetPackage: String,
        useVndScheme: Boolean
    ): Boolean {
        val candidateUris = mutableListOf<Uri>()
        if (useVndScheme) {
            parsed.toVndYoutubeUri()?.let { candidateUris.add(it) }
        }
        candidateUris.add(Uri.parse(parsed.normalizedHttpsUrl))
        if (!useVndScheme) {
            parsed.toVndYoutubeUri()?.let { candidateUris.add(it) }
        }

        for (targetUri in candidateUris) {
            val forwardIntent = Intent(Intent.ACTION_VIEW, targetUri).apply {
                setPackage(targetPackage)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            try {
                startActivity(forwardIntent)
                return true
            } catch (_: ActivityNotFoundException) {
                // Thử URI kế tiếp (ví dụ fallback từ https sang vnd.youtube)
            } catch (_: Exception) {
                // Tiếp tục
            }
        }
        return false
    }

    /**
     * Mở bằng vnd.youtube scheme (hệ thống tự chọn) hoặc mở bằng Trình duyệt web
     */
    private fun launchImplicitVndOrBrowser(parsed: ParsedYoutubeLink, forceBrowser: Boolean) {
        if (!forceBrowser) {
            val vndUri = parsed.toVndYoutubeUri()
            if (vndUri != null) {
                try {
                    val vndIntent = Intent(Intent.ACTION_VIEW, vndUri).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(vndIntent)
                    return
                } catch (_: Exception) {
                    // Nếu không có app nhận vnd.youtube, chuyển xuống mở trình duyệt
                }
            }
        }

        try {
            val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(parsed.normalizedHttpsUrl)).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(
                Intent.createChooser(browserIntent, "Chọn ứng dụng hoặc trình duyệt để mở")
                    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            )
        } catch (_: Exception) {
            // Bỏ qua nếu thiết bị không có trình duyệt
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
        const val KEY_TARGET_PACKAGE = "target_package"
        const val KEY_USE_VND_SCHEME = "use_vnd_scheme"
        const val KEY_LAST_DISPATCHED_URL = "last_dispatched_url"
        const val KEY_LAST_VIDEO_ID = "last_video_id"
        const val KEY_DISPATCH_COUNT = "dispatch_count"
        const val DEFAULT_TARGET_PACKAGE = "app.morphe.android.youtube"

        val KNOWN_YOUTUBE_PACKAGES = listOf(
            "app.morphe.android.youtube",
            "app.revanced.android.youtube",
            "app.rvx.android.youtube",
            "app.rvx.android.apps.youtube.music",
            "com.google.android.youtube"
        )

        private val URL_EXTRACT_PATTERN: Pattern =
            Pattern.compile("(https?://[\\w\\-._~:/?#\\[\\]@!$&'()*+,;=%]+)")
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FallbackBottomSheet(
    parsed: ParsedYoutubeLink,
    missingPackage: String,
    installedAlternatives: List<String>,
    onSelectPackage: (String) -> Unit,
    onOpenVndSchemeImplicit: () -> Unit,
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
                text = "Không tìm thấy ứng dụng đích",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Gói cấu hình \"$missingPackage\" hiện chưa được cài đặt trên thiết bị.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "URL: ${parsed.normalizedHttpsUrl}",
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace
                )
                if (!parsed.videoId.isNullOrBlank()) {
                    Text(
                        text = "Video ID: ${parsed.videoId} · Scheme: vnd.youtube:${parsed.videoId}",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            HorizontalDivider()

            if (installedAlternatives.isNotEmpty()) {
                Text(
                    text = "Ứng dụng tương thích phát hiện trên máy:",
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

            if (!parsed.videoId.isNullOrBlank()) {
                OutlinedButton(
                    onClick = onOpenVndSchemeImplicit,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Mở qua giao thức vnd.youtube:${parsed.videoId}")
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
                    Text("Đổi Package đích")
                }
                TextButton(onClick = onDismiss) {
                    Text("Đóng")
                }
            }

            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}
