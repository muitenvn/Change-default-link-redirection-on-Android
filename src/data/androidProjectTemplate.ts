export interface ProjectConfig {
  appName: string;
  applicationId: string;
  defaultTargetPackage: string;
  compileSdk: number;
  minSdk: number;
  targetSdk: number;
  preferVndSchemeDefault: boolean;
  intentPriority: number;
}

export interface GeneratedFile {
  path: string;
  title: string;
  language: 'xml' | 'kotlin' | 'gradle' | 'yaml' | 'properties';
  category: 'core' | 'gradle' | 'ci';
  description: string;
  content: string;
}

export interface ParsedYoutubePreview {
  originalInput: string;
  extractedUrl: string | null;
  normalizedHttpsUrl: string | null;
  videoId: string | null;
  playlistId: string | null;
  timestampSeconds: string | null;
  vndYoutubeUri: string | null;
  linkType: 'WATCH' | 'SHORTS' | 'LIVE' | 'PLAYLIST' | 'SHORTLINK' | 'GENERIC' | 'INVALID';
  host: string | null;
}

export function parseYoutubeInputForPreview(input: string): ParsedYoutubePreview {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/i);
  const candidate = urlMatch ? urlMatch[1] : trimmed;

  try {
    const urlObj = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
    let workingUrl = urlObj;

    if (workingUrl.pathname === '/attribution_link') {
      const innerU = workingUrl.searchParams.get('u');
      if (innerU) {
        workingUrl = new URL(`https://www.youtube.com${innerU}`);
      }
    }

    const host = workingUrl.hostname.toLowerCase();
    const segments = workingUrl.pathname.split('/').filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase() ?? '';

    let videoId: string | null = null;
    let linkType: ParsedYoutubePreview['linkType'] = 'GENERIC';

    if (host === 'youtu.be') {
      videoId = segments[0] || null;
      linkType = 'SHORTLINK';
    } else if (firstSegment === 'watch') {
      videoId = workingUrl.searchParams.get('v');
      linkType = 'WATCH';
    } else if (firstSegment === 'shorts') {
      videoId = segments[1] || null;
      linkType = 'SHORTS';
    } else if (firstSegment === 'live') {
      videoId = segments[1] || null;
      linkType = 'LIVE';
    } else if (firstSegment === 'embed' || firstSegment === 'v') {
      videoId = segments[1] || null;
      linkType = 'WATCH';
    } else if (firstSegment === 'playlist') {
      linkType = 'PLAYLIST';
    } else {
      videoId = workingUrl.searchParams.get('v');
    }

    const playlistId = workingUrl.searchParams.get('list');
    const timestampSeconds =
      workingUrl.searchParams.get('t') || workingUrl.searchParams.get('start');

    workingUrl.protocol = 'https:';
    const normalizedHttpsUrl = workingUrl.toString();

    const vndYoutubeUri = videoId
      ? timestampSeconds
        ? `vnd.youtube:${videoId}?t=${timestampSeconds}`
        : `vnd.youtube:${videoId}`
      : null;

    return {
      originalInput: input,
      extractedUrl: candidate,
      normalizedHttpsUrl,
      videoId,
      playlistId,
      timestampSeconds,
      vndYoutubeUri,
      linkType,
      host,
    };
  } catch {
    return {
      originalInput: input,
      extractedUrl: null,
      normalizedHttpsUrl: null,
      videoId: null,
      playlistId: null,
      timestampSeconds: null,
      vndYoutubeUri: null,
      linkType: 'INVALID',
      host: null,
    };
  }
}

export function generateAndroidProjectFiles(config: ProjectConfig): GeneratedFile[] {
  const pkgPath = config.applicationId.replace(/\./g, '/');

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!--
      Chính sách Package Visibility của Android 11+ (API 30+):
      Khai báo danh sách các package ứng dụng YouTube Mod và Intent scheme cần truy vấn
    -->
    <queries>
        <package android:name="${config.defaultTargetPackage}" />
        <package android:name="app.morphe.android.youtube" />
        <package android:name="app.revanced.android.youtube" />
        <package android:name="app.rvx.android.youtube" />
        <package android:name="app.rvx.android.apps.youtube.music" />
        <package android:name="com.google.android.youtube" />

        <intent>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="https" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="vnd.youtube" />
        </intent>
    </queries>

    <application
        android:allowBackup="true"
        android:label="${config.appName}"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar"
        tools:targetApi="${config.targetSdk}">

        <!-- 1. MainActivity: Giao diện cài đặt Compose Material 3 -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="${config.appName}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!--
          2. RouterActivity: Activity trung gian trong suốt (Theme.Translucent.NoTitleBar)
          - Khi tìm thấy app Mod: chuyển hướng tức thì trong vài mili-giây và gọi finish() ngay.
          - Khi KHÔNG tìm thấy app Mod: hiển thị Compose ModalBottomSheet / Dialog để người dùng
            chọn mở bằng ứng dụng khác hoặc trình duyệt mà không bị văng (crash) như Theme.NoDisplay.
        -->
        <activity
            android:name=".RouterActivity"
            android:exported="true"
            android:excludeFromRecents="true"
            android:noHistory="true"
            android:theme="@android:style/Theme.Translucent.NoTitleBar">

            <!-- Đón bắt toàn bộ liên kết YouTube với autoVerify="true" và priority="${config.intentPriority}" -->
            <intent-filter
                android:autoVerify="true"
                android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />

                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <!-- Schemes -->
                <data android:scheme="http" />
                <data android:scheme="https" />

                <!-- Hosts -->
                <data android:host="youtube.com" />
                <data android:host="m.youtube.com" />
                <data android:host="youtu.be" />
                <data android:host="www.youtube.com" />
                <data android:host="music.youtube.com" />

                <!-- Path Prefixes -->
                <data android:pathPrefix="/" />
                <data android:pathPrefix="/watch" />
                <data android:pathPrefix="/shorts" />
                <data android:pathPrefix="/live" />
                <data android:pathPrefix="/playlist" />
            </intent-filter>

            <!-- Đón bắt thêm thao tác Share link (ACTION_SEND) từ Zalo, Messenger, Trình duyệt -->
            <intent-filter android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>
        </activity>

    </application>

</manifest>`;

  const routerActivityKt = `package ${config.applicationId}

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
        val preferVndScheme = prefs.getBoolean(KEY_USE_VND_SCHEME, ${config.preferVndSchemeDefault})

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
     * Bắn Intent sang package đích. Hỗ trợ cả URL https gốc và scheme vnd.youtube:<id>
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
        const val DEFAULT_TARGET_PACKAGE = "${config.defaultTargetPackage}"

        val KNOWN_YOUTUBE_PACKAGES = listOf(
            "app.morphe.android.youtube",
            "app.revanced.android.youtube",
            "app.rvx.android.youtube",
            "app.rvx.android.apps.youtube.music",
            "com.google.android.youtube"
        )

        private val URL_EXTRACT_PATTERN: Pattern =
            Pattern.compile("(https?://[\\\\w\\\\-._~:/?#\\\\[\\\\]@!$&'()*+,;=%]+)")
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
                text = "Gói cấu hình \\"$missingPackage\\" hiện chưa được cài đặt trên thiết bị.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "URL: \${parsed.normalizedHttpsUrl}",
                    style = MaterialTheme.typography.bodySmall,
                    fontFamily = FontFamily.Monospace
                )
                if (!parsed.videoId.isNullOrBlank()) {
                    Text(
                        text = "Video ID: \${parsed.videoId} · Scheme: vnd.youtube:\${parsed.videoId}",
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
                    Text("Mở qua giao thức vnd.youtube:\${parsed.videoId}")
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
}`;

  const mainActivityKt = `package ${config.applicationId}

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLifecycleOwner
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DispatcherSettingsScreen()
                }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun DispatcherSettingsScreen() {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val prefs = remember {
        context.getSharedPreferences(RouterActivity.PREFS_NAME, Context.MODE_PRIVATE)
    }

    var targetPackage by remember {
        mutableStateOf(
            prefs.getString(
                RouterActivity.KEY_TARGET_PACKAGE,
                RouterActivity.DEFAULT_TARGET_PACKAGE
            ) ?: RouterActivity.DEFAULT_TARGET_PACKAGE
        )
    }

    var useVndScheme by remember {
        mutableStateOf(prefs.getBoolean(RouterActivity.KEY_USE_VND_SCHEME, ${config.preferVndSchemeDefault}))
    }

    var testUrl by remember {
        mutableStateOf("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    }

    var isPackageInstalled by remember {
        mutableStateOf(checkPackageInstalled(context, targetPackage))
    }

    var dispatchCount by remember {
        mutableIntStateOf(prefs.getInt(RouterActivity.KEY_DISPATCH_COUNT, 0))
    }

    var lastVideoId by remember {
        mutableStateOf(prefs.getString(RouterActivity.KEY_LAST_VIDEO_ID, "Chưa có") ?: "Chưa có")
    }

    var lastDispatchedUrl by remember {
        mutableStateOf(
            prefs.getString(RouterActivity.KEY_LAST_DISPATCHED_URL, "Chưa có liên kết nào")
                ?: "Chưa có liên kết nào"
        )
    }

    DisposableEffect(lifecycleOwner, targetPackage) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                isPackageInstalled = checkPackageInstalled(context, targetPackage)
                dispatchCount = prefs.getInt(RouterActivity.KEY_DISPATCH_COUNT, 0)
                lastVideoId = prefs.getString(RouterActivity.KEY_LAST_VIDEO_ID, "Chưa có") ?: "Chưa có"
                lastDispatchedUrl = prefs.getString(
                    RouterActivity.KEY_LAST_DISPATCHED_URL,
                    "Chưa có liên kết nào"
                ) ?: "Chưa có liên kết nào"
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    val presetPackages = listOf(
        "YouTube Morphe" to "app.morphe.android.youtube",
        "YouTube ReVanced" to "app.revanced.android.youtube",
        "RVX YouTube" to "app.rvx.android.youtube",
        "RVX Music" to "app.rvx.android.apps.youtube.music"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "${config.appName}",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Router trung gian chuyển hướng liên kết YouTube",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // PHẦN 1: CẤU HÌNH PACKAGE ĐÍCH & CHẾ ĐỘ INTENT
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "1. Package Name ứng dụng đích",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )

                    Text(
                        text = "Chọn nhanh hoặc nhập Package Name của bản YouTube Mod (mặc định: ${config.defaultTargetPackage}):",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        presetPackages.forEach { (label, pkg) ->
                            FilterChip(
                                selected = targetPackage == pkg,
                                onClick = {
                                    targetPackage = pkg
                                    prefs.edit()
                                        .putString(RouterActivity.KEY_TARGET_PACKAGE, pkg)
                                        .apply()
                                    isPackageInstalled = checkPackageInstalled(context, pkg)
                                },
                                label = { Text(label, style = MaterialTheme.typography.labelSmall) }
                            )
                        }
                    }

                    OutlinedTextField(
                        value = targetPackage,
                        onValueChange = { value ->
                            targetPackage = value.trim()
                            isPackageInstalled = checkPackageInstalled(context, targetPackage)
                        },
                        label = { Text("Package Name đích") },
                        placeholder = { Text("${config.defaultTargetPackage}") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Ưu tiên scheme vnd.youtube:<id>",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium
                            )
                            Text(
                                text = "Truyền thẳng Video ID qua giao thức nội bộ vnd.youtube thay vì URL https",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = useVndScheme,
                            onCheckedChange = { checked ->
                                useVndScheme = checked
                                prefs.edit()
                                    .putBoolean(RouterActivity.KEY_USE_VND_SCHEME, checked)
                                    .apply()
                            }
                        )
                    }

                    HorizontalDivider()

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (isPackageInstalled) {
                                "Đã cài đặt trên thiết bị"
                            } else {
                                "Chưa phát hiện package này (Sẽ bật BottomSheet khi mở link)"
                            },
                            style = MaterialTheme.typography.bodySmall,
                            color = if (isPackageInstalled) {
                                MaterialTheme.colorScheme.primary
                            } else {
                                MaterialTheme.colorScheme.error
                            },
                            modifier = Modifier.weight(1f)
                        )

                        Button(
                            onClick = {
                                val cleaned = targetPackage.trim().ifEmpty {
                                    RouterActivity.DEFAULT_TARGET_PACKAGE
                                }
                                targetPackage = cleaned
                                prefs.edit()
                                    .putString(RouterActivity.KEY_TARGET_PACKAGE, cleaned)
                                    .apply()
                                isPackageInstalled = checkPackageInstalled(context, cleaned)
                                Toast.makeText(
                                    context,
                                    "Đã lưu cấu hình: $cleaned",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                        ) {
                            Text("Lưu Package")
                        }
                    }
                }
            }

            // PHẦN 2: CÀI ĐẶT "MỞ THEO MẶC ĐỊNH" (OPEN BY DEFAULT)
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "2. Cấp quyền 'Mở theo mặc định' (Open by default)",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )

                    Text(
                        text = "Nhấn nút bên dưới để mở trực tiếp màn hình cấu hình liên kết mặc định của Android (Settings.ACTION_APP_OPEN_BY_DEFAULT_SETTINGS). Hãy bật 'Mở đường liên kết được hỗ trợ' và tích chọn các tên miền youtube.com, m.youtube.com, youtu.be.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Button(
                        onClick = { openSystemDefaultLinksSettings(context) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Mở màn hình 'Mở theo mặc định' của hệ thống")
                    }
                }
            }

            // PHẦN 3: KIỂM TRA NHANH INTENT CHUYỂN HƯỚNG
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.45f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "3. Kiểm tra nhanh Intent chuyển hướng",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )

                    OutlinedTextField(
                        value = testUrl,
                        onValueChange = { testUrl = it },
                        label = { Text("Nhập link YouTube (watch, shorts, live, youtu.be)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { testUrl = "https://youtu.be/dQw4w9WgXcQ?t=42" },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Mẫu youtu.be")
                        }
                        OutlinedButton(
                            onClick = { testUrl = "https://m.youtube.com/shorts/5qap5aO4i9A" },
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Mẫu Shorts")
                        }
                    }

                    Button(
                        onClick = {
                            val trimmed = testUrl.trim()
                            if (trimmed.isNotEmpty()) {
                                val testIntent = Intent(context, RouterActivity::class.java).apply {
                                    action = Intent.ACTION_VIEW
                                    data = Uri.parse(trimmed)
                                }
                                context.startActivity(testIntent)
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Bắn thử Intent qua RouterActivity")
                    }

                    HorizontalDivider()

                    Text(
                        text = "Đã xử lý: $dispatchCount liên kết · Video ID cuối: $lastVideoId",
                        style = MaterialTheme.typography.labelMedium,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "URL gần nhất: $lastDispatchedUrl",
                        style = MaterialTheme.typography.bodySmall,
                        fontFamily = FontFamily.Monospace,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

private fun checkPackageInstalled(context: Context, packageName: String): Boolean {
    if (packageName.isBlank()) return false
    return try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.packageManager.getPackageInfo(
                packageName,
                PackageManager.PackageInfoFlags.of(0)
            )
        } else {
            @Suppress("DEPRECATION")
            context.packageManager.getPackageInfo(packageName, 0)
        }
        true
    } catch (_: PackageManager.NameNotFoundException) {
        false
    }
}

private fun openSystemDefaultLinksSettings(context: Context) {
    val packageUri = Uri.parse("package:\${context.packageName}")
    val primaryIntent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
        Intent(Settings.ACTION_APP_OPEN_BY_DEFAULT_SETTINGS, packageUri)
    } else {
        Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, packageUri)
    }

    try {
        context.startActivity(primaryIntent)
    } catch (_: Exception) {
        try {
            context.startActivity(
                Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, packageUri)
            )
        } catch (e: Exception) {
            Toast.makeText(
                context,
                "Không thể mở Cài đặt hệ thống: \${e.localizedMessage}",
                Toast.LENGTH_SHORT
            ).show()
        }
    }
}`;

  const appBuildGradleKts = `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "${config.applicationId}"
    compileSdk = ${config.compileSdk}

    defaultConfig {
        applicationId = "${config.applicationId}"
        minSdk = ${config.minSdk}
        targetSdk = ${config.targetSdk}
        versionCode = 1
        versionName = "1.0.0"

        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.09.00")
    implementation(composeBom)

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.activity:activity-compose:1.9.2")

    // Jetpack Compose UI & Material 3
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
}`;

  const rootBuildGradleKts = `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.20" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.20" apply false
}`;

  const settingsGradleKts = `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "LinkDispatcher"
include(":app")`;

  const gradleProperties = `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true`;

  const gradleWrapperProperties = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`;

  const githubWorkflowYml = `name: Build & Release Android APK

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build-apk:
    name: Assemble Debug APK & Publish Release
    runs-on: ubuntu-latest

    steps:
      - name: 1. Checkout mã nguồn
        uses: actions/checkout@v4

      - name: 2. Cài đặt JDK 17 (Temurin)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 3. Khởi tạo Gradle Wrapper & Cấp quyền thực thi
        run: |
          if [ ! -f "./gradlew" ] || [ ! -f "./gradle/wrapper/gradle-wrapper.jar" ]; then
            gradle wrapper --gradle-version 8.7
          fi
          chmod +x ./gradlew

      - name: 4. Build file APK (assembleDebug)
        run: ./gradlew assembleDebug --stacktrace

      - name: 5. Tải file app-debug.apk lên GitHub Artifacts
        uses: actions/upload-artifact@v4
        with:
          name: LinkDispatcher-debug-apk
          path: app/build/outputs/apk/debug/app-debug.apk
          if-no-files-found: error

      - name: 6. Tự động tạo GitHub Release đính kèm file APK
        if: github.event_name != 'pull_request'
        uses: softprops/action-gh-release@v2
        with:
          tag_name: v1.0.\${{ github.run_number }}
          name: "${config.appName} APK Build #\${{ github.run_number }}"
          body: |
            ### Bản dựng tự động ${config.appName} (Android Native)
            - **Application ID:** \`${config.applicationId}\`
            - **Package đích mặc định:** \`${config.defaultTargetPackage}\`
            - **Hướng dẫn:** Tải file **\`app-debug.apk\`** bên dưới về điện thoại Android, cài đặt, sau đó mở ứng dụng và bật quyền **Mở theo mặc định (Open by default)**.
          files: app/build/outputs/apk/debug/app-debug.apk
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

  return [
    {
      path: 'app/src/main/AndroidManifest.xml',
      title: 'AndroidManifest.xml',
      language: 'xml',
      category: 'core',
      description:
        'Khai báo RouterActivity (Theme.Translucent.NoTitleBar), intent-filter với autoVerify="true", priority="999" cho 5 tên miền YouTube, các pathPrefix (/, /watch, /shorts, /live) và thẻ <queries> cho Android 11+.',
      content: manifestXml,
    },
    {
      path: `app/src/main/java/${pkgPath}/RouterActivity.kt`,
      title: 'RouterActivity.kt',
      language: 'kotlin',
      category: 'core',
      description:
        'Activity trung gian bóc tách videoId / playlistId / timestamp từ intent.data, tạo Intent ACTION_VIEW (https hoặc vnd.youtube:<id>), ưu tiên bắn sang package đích và gọi finish() tức thì; tích hợp ModalBottomSheet Compose Material 3 khi cần fallback.',
      content: routerActivityKt,
    },
    {
      path: `app/src/main/java/${pkgPath}/MainActivity.kt`,
      title: 'MainActivity.kt',
      language: 'kotlin',
      category: 'core',
      description:
        'Giao diện cài đặt Jetpack Compose Material 3: chọn/nhập Package Name đích, bật/tắt scheme vnd.youtube:<id>, nút test nhanh Intent và nút mở trực tiếp Settings.ACTION_APP_OPEN_BY_DEFAULT_SETTINGS.',
      content: mainActivityKt,
    },
    {
      path: 'app/build.gradle.kts',
      title: 'app/build.gradle.kts',
      language: 'gradle',
      category: 'gradle',
      description:
        'Cấu hình Module-level Gradle: compileSdk 34, targetSdk 34, Java 17, Compose Compiler plugin và các thư viện Compose Material 3, activity-compose, core-ktx.',
      content: appBuildGradleKts,
    },
    {
      path: 'build.gradle.kts',
      title: 'build.gradle.kts (Project)',
      language: 'gradle',
      category: 'gradle',
      description:
        'Cấu hình Project-level Gradle: khai báo plugin com.android.application (8.5.2), org.jetbrains.kotlin.android (2.0.20) và org.jetbrains.kotlin.plugin.compose (2.0.20).',
      content: rootBuildGradleKts,
    },
    {
      path: 'settings.gradle.kts',
      title: 'settings.gradle.kts',
      language: 'gradle',
      category: 'gradle',
      description:
        'Khai báo kho lưu trữ google(), mavenCentral(), gradlePluginPortal() và tên dự án gốc LinkDispatcher.',
      content: settingsGradleKts,
    },
    {
      path: 'gradle/wrapper/gradle-wrapper.properties',
      title: 'gradle-wrapper.properties',
      language: 'properties',
      category: 'gradle',
      description: 'Cấu hình phiên bản Gradle 8.7 tương thích chuẩn với AGP 8.5.2 và JDK 17.',
      content: gradleWrapperProperties,
    },
    {
      path: 'gradle.properties',
      title: 'gradle.properties',
      language: 'properties',
      category: 'gradle',
      description: 'Khai báo thuộc tính JVM Args, AndroidX và Non-Transitive R Class.',
      content: gradleProperties,
    },
    {
      path: '.github/workflows/build-apk.yml',
      title: '.github/workflows/build-apk.yml',
      language: 'yaml',
      category: 'ci',
      description:
        'GitHub Actions Workflow tự động cài JDK 17, khởi tạo Gradle Wrapper, biên dịch ./gradlew assembleDebug, đẩy Artifact và tạo GitHub Release chứa file app-debug.apk.',
      content: githubWorkflowYml,
    },
  ];
}
