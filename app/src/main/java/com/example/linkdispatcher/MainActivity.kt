package com.example.linkdispatcher

import android.content.ComponentName
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
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
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
                DispatcherMainScreen()
            }
        }
    }
}

@Composable
fun AtmosphericAppBackground(
    wallpaperStyle: String,
    content: @Composable () -> Unit
) {
    val palette = when (wallpaperStyle) {
        "aurora_emerald" -> listOf(Color(0xFF06101E), Color(0xFF0B2926), Color(0xFF090D16))
        "crimson_stage" -> listOf(Color(0xFF1A0812), Color(0xFF2B0F1C), Color(0xFF090D16))
        "cyber_indigo" -> listOf(Color(0xFF0A0D24), Color(0xFF1B1438), Color(0xFF090D16))
        else -> listOf(Color(0xFF0B1325), Color(0xFF111C35), Color(0xFF090D16))
    }

    val accentGlow = when (wallpaperStyle) {
        "aurora_emerald" -> Color(0xFF10B981)
        "crimson_stage" -> Color(0xFFF43F5E)
        "cyber_indigo" -> Color(0xFF818CF8)
        else -> Color(0xFF38BDF8)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(palette))
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(accentGlow.copy(alpha = 0.22f), Color.Transparent),
                    center = Offset(w * 0.85f, h * 0.12f),
                    radius = w * 0.65f
                ),
                center = Offset(w * 0.85f, h * 0.12f),
                radius = w * 0.65f
            )

            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(accentGlow.copy(alpha = 0.14f), Color.Transparent),
                    center = Offset(w * 0.15f, h * 0.78f),
                    radius = w * 0.55f
                ),
                center = Offset(w * 0.15f, h * 0.78f),
                radius = w * 0.55f
            )

            for (i in 0..3) {
                val offsetFactor = i * 65f
                val wavePath = Path().apply {
                    moveTo(0f, h * 0.28f + offsetFactor)
                    cubicTo(
                        w * 0.35f, h * 0.18f + offsetFactor,
                        w * 0.65f, h * 0.38f + offsetFactor,
                        w, h * 0.24f + offsetFactor
                    )
                }
                drawPath(
                    path = wavePath,
                    color = accentGlow.copy(alpha = 0.12f - (i * 0.02f)),
                    style = Stroke(width = 2.dp.toPx())
                )
            }
        }

        content()
    }
}

@Composable
fun AppLogoBadge() {
    Canvas(
        modifier = Modifier
            .padding(end = 10.dp)
            .background(Color(0xFF0B2228), shape = MaterialTheme.shapes.small)
            .padding(6.dp)
    ) {
        val w = 28.dp.toPx()
        drawCircle(
            color = Color(0xFF10B981),
            radius = w * 0.42f,
            style = Stroke(width = 2.dp.toPx())
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun DispatcherMainScreen() {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val prefs = remember {
        context.getSharedPreferences(RouterActivity.PREFS_NAME, Context.MODE_PRIVATE)
    }

    var wallpaperStyle by remember {
        mutableStateOf(
            prefs.getString(RouterActivity.KEY_WALLPAPER_STYLE, "aurora_emerald")
                ?: "aurora_emerald"
        )
    }

    var detectedBrowsers by remember {
        mutableStateOf(RouterActivity.detectInstalledBrowsers(context))
    }

    var selectedBrowserPkg by remember {
        mutableStateOf(
            prefs.getString(RouterActivity.KEY_FALLBACK_BROWSER_PACKAGE, "") ?: ""
        )
    }

    var inBrowserAccessibilityActive by remember {
        mutableStateOf(BrowserUrlInterceptorService.isServiceEnabled(context))
    }

    var inBrowserInterceptEnabled by remember {
        mutableStateOf(
            prefs.getBoolean(RouterActivity.KEY_IN_BROWSER_INTERCEPT_ENABLED, true)
        )
    }

    // Điền sẵn đường link mặc định để người dùng có thể bấm thử ngay lập tức
    var testUrl by remember {
        mutableStateOf(RouterActivity.DEFAULT_SAMPLE_YOUTUBE_URL)
    }

    var dispatchCount by remember {
        mutableIntStateOf(prefs.getInt(RouterActivity.KEY_DISPATCH_COUNT, 0))
    }

    var lastDispatchedUrl by remember {
        mutableStateOf(
            prefs.getString(RouterActivity.KEY_LAST_DISPATCHED_URL, "Chưa có liên kết nào")
                ?: "Chưa có liên kết nào"
        )
    }

    val routePackageMap = remember {
        mutableStateMapOf<ServiceRoute, String>().apply {
            ServiceRoute.entries.forEach { route ->
                val saved = prefs.getString(
                    RouterActivity.prefKeyRoutePackage(route),
                    route.defaultPackage
                )
                put(route, saved ?: route.defaultPackage)
            }
        }
    }

    val routeEnabledMap = remember {
        mutableStateMapOf<ServiceRoute, Boolean>().apply {
            ServiceRoute.entries.forEach { route ->
                val pkg = routePackageMap[route] ?: route.defaultPackage
                val pkgInstalledOrWeb = pkg.isBlank() || checkPackageInstalled(context, pkg)
                val savedEnabled = prefs.getBoolean(
                    RouterActivity.prefKeyRouteEnabled(route),
                    route.defaultEnabled
                )
                val effectiveEnabled = if (!pkgInstalledOrWeb) {
                    setRouteComponentEnabled(context, prefs, route, false)
                    false
                } else {
                    savedEnabled
                }
                put(route, effectiveEnabled)
            }
        }
    }

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                dispatchCount = prefs.getInt(RouterActivity.KEY_DISPATCH_COUNT, 0)
                lastDispatchedUrl = prefs.getString(
                    RouterActivity.KEY_LAST_DISPATCHED_URL,
                    "Chưa có liên kết nào"
                ) ?: "Chưa có liên kết nào"

                detectedBrowsers = RouterActivity.detectInstalledBrowsers(context)
                inBrowserAccessibilityActive = BrowserUrlInterceptorService.isServiceEnabled(context)

                ServiceRoute.entries.forEach { route ->
                    val currentPkg = routePackageMap[route] ?: route.defaultPackage
                    val isValid = currentPkg.isBlank() || checkPackageInstalled(context, currentPkg)
                    if (!isValid && routeEnabledMap[route] == true) {
                        routeEnabledMap[route] = false
                        setRouteComponentEnabled(context, prefs, route, false)
                    } else {
                        routeEnabledMap[route] = prefs.getBoolean(
                            RouterActivity.prefKeyRouteEnabled(route),
                            false
                        )
                    }
                }
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    AtmosphericAppBackground(wallpaperStyle = wallpaperStyle) {
        Scaffold(
            containerColor = Color.Transparent,
            topBar = {
                TopAppBar(
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            AppLogoBadge()
                            Column {
                                Text(
                                    text = "Link Dispatcher",
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Đầy đủ Đường liên kết mặc định & Bắt link TRONG Trình duyệt",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xCC090D16)
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
                // CARD 1: CẤP QUYỀN MỞ THEO MẶC ĐỊNH (ĐẦY ĐỦ 25+ ĐƯỜNG LINK MẶC ĐỊNH)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xD90E2229)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "1. Bật Các Đường Liên Kết Mặc Định (Open by default)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Đã khai báo đầy đủ 25+ tên miền mặc định (youtube.com, m.youtube.com, youtu.be, music.youtube.com, open.spotify.com, fb.watch, tiktok.com...) trực tiếp trong RouterActivity để mục '+ Thêm đường liên kết' trong Cài đặt luôn hiển thị đầy đủ:",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Button(
                            onClick = { openSystemDefaultLinksSettings(context) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Mở 'Mở theo mặc định' & Chọn tất cả đường liên kết")
                        }
                    }
                }

                // CARD 2: BẮT LINK NGAY BÊN TRONG TRÌNH DUYỆT (ĐÃ SỬA LỖI VĂNG CHROME)
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xBF111827)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "2. Bắt link YouTube / Nhạc ngay TRONG Trình duyệt",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = if (inBrowserAccessibilityActive) {
                                        "ĐANG HOẠT ĐỘNG: Đã sửa triệt để lỗi tự bấm Back văng ngược về Chrome. Khi bấm vào video/Shorts trong trình duyệt, ứng dụng sẽ mở thẳng YouTube Morphe và giữ nguyên màn hình phát!"
                                    } else {
                                        "CHƯA BẬT TRỢ NĂNG: Bật mục này để khi bạn đang ở trong Chrome / Brave / Firefox mà bấm vào video YouTube thì nó tự nhảy sang YouTube Mod."
                                    },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (inBrowserAccessibilityActive) {
                                        MaterialTheme.colorScheme.primary
                                    } else {
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                    }
                                )
                            }

                            Switch(
                                checked = inBrowserInterceptEnabled,
                                onCheckedChange = { enabled ->
                                    inBrowserInterceptEnabled = enabled
                                    prefs.edit()
                                        .putBoolean(RouterActivity.KEY_IN_BROWSER_INTERCEPT_ENABLED, enabled)
                                        .apply()
                                }
                            )
                        }

                        Button(
                            onClick = { openAccessibilitySettings(context) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                if (inBrowserAccessibilityActive) {
                                    "Đã bật 'Bắt link trong Trình duyệt' (Mở Cài đặt Hỗ trợ tiếp cận)"
                                } else {
                                    "Bật ngay 'Link Dispatcher - Bắt link trong Trình duyệt'"
                                }
                            )
                        }
                    }
                }

                // CARD 3: TỰ ĐỘNG PHÁT HIỆN & CHỌN TRÌNH DUYỆT CHO CÁC LINK CÒN LẠI
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xBF111827)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Trình duyệt mở các liên kết Web còn lại",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "Tự động phát hiện các trình duyệt đang cài trên máy để mở các liên kết ngoài danh sách:",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }

                            OutlinedButton(
                                onClick = {
                                    detectedBrowsers = RouterActivity.detectInstalledBrowsers(context)
                                }
                            ) {
                                Text("Quét lại", style = MaterialTheme.typography.labelSmall)
                            }
                        }

                        if (detectedBrowsers.isEmpty()) {
                            Text(
                                text = "Không tìm thấy trình duyệt Web nào khác trên thiết bị.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.error
                            )
                        } else {
                            FlowRow(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                FilterChip(
                                    selected = selectedBrowserPkg.isBlank(),
                                    onClick = {
                                        selectedBrowserPkg = ""
                                        prefs.edit()
                                            .putString(RouterActivity.KEY_FALLBACK_BROWSER_PACKAGE, "")
                                            .apply()
                                    },
                                    label = {
                                        val firstAuto = detectedBrowsers.first().appName
                                        Text(
                                            text = "Tự động ($firstAuto)",
                                            style = MaterialTheme.typography.labelSmall
                                        )
                                    }
                                )

                                detectedBrowsers.forEach { browser ->
                                    FilterChip(
                                        selected = selectedBrowserPkg == browser.packageName,
                                        onClick = {
                                            selectedBrowserPkg = browser.packageName
                                            prefs.edit()
                                                .putString(
                                                    RouterActivity.KEY_FALLBACK_BROWSER_PACKAGE,
                                                    browser.packageName
                                                )
                                                .apply()
                                        },
                                        label = {
                                            Text(
                                                text = "${browser.appName} (${browser.packageName})",
                                                style = MaterialTheme.typography.labelSmall
                                            )
                                        }
                                    )
                                }
                            }
                        }
                    }
                }

                // CARD CHỌN HÌNH NỀN
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xBF111827)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Chủ đề Hình nền Ứng dụng",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )

                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(
                                "Aurora Ngọc Lục Bảo" to "aurora_emerald",
                                "Đỏ Sân Khấu" to "crimson_stage",
                                "Tím Indigo" to "cyber_indigo",
                                "Xanh Đại Dương" to "ocean_slate"
                            ).forEach { (label, styleId) ->
                                FilterChip(
                                    selected = wallpaperStyle == styleId,
                                    onClick = {
                                        wallpaperStyle = styleId
                                        prefs.edit()
                                            .putString(RouterActivity.KEY_WALLPAPER_STYLE, styleId)
                                            .apply()
                                    },
                                    label = { Text(label, style = MaterialTheme.typography.labelSmall) }
                                )
                            }
                        }
                    }
                }

                // DANH SÁCH CẤU HÌNH TỪNG LUỒNG DỊCH VỤ
                ServiceRoute.entries.forEachIndexed { index, route ->
                    val currentPkg = routePackageMap[route] ?: route.defaultPackage
                    val isInstalled = currentPkg.isNotBlank() && checkPackageInstalled(context, currentPkg)
                    val isEnabled = routeEnabledMap[route] ?: false

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isEnabled) Color(0xBF111827) else Color(0x730F172A)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "${index + 1}. ${route.title}",
                                        style = MaterialTheme.typography.titleMedium,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Text(
                                        text = when {
                                            !isEnabled && currentPkg.isNotBlank() && !isInstalled ->
                                                "Đã tự động tắt luồng (Chưa cài $currentPkg -> Mở thẳng bằng Trình duyệt đã chọn)"
                                            isEnabled ->
                                                "Đang bật đón bắt liên kết"
                                            else ->
                                                "Đã tắt (Mở qua Trình duyệt đã chọn)"
                                        },
                                        style = MaterialTheme.typography.bodySmall,
                                        color = if (isEnabled) {
                                            MaterialTheme.colorScheme.primary
                                        } else {
                                            MaterialTheme.colorScheme.onSurfaceVariant
                                        }
                                    )
                                }

                                Switch(
                                    checked = isEnabled,
                                    onCheckedChange = { requestedEnable ->
                                        if (requestedEnable && currentPkg.isNotBlank() && !checkPackageInstalled(context, currentPkg)) {
                                            routeEnabledMap[route] = false
                                            setRouteComponentEnabled(context, prefs, route, false)
                                        } else {
                                            routeEnabledMap[route] = requestedEnable
                                            setRouteComponentEnabled(context, prefs, route, requestedEnable)
                                        }
                                    }
                                )
                            }

                            FlowRow(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                route.suggestedPackages.forEach { (label, pkg) ->
                                    FilterChip(
                                        selected = currentPkg == pkg,
                                        onClick = {
                                            routePackageMap[route] = pkg
                                            prefs.edit()
                                                .putString(RouterActivity.prefKeyRoutePackage(route), pkg)
                                                .apply()
                                            val valid = pkg.isBlank() || checkPackageInstalled(context, pkg)
                                            routeEnabledMap[route] = valid
                                            setRouteComponentEnabled(context, prefs, route, valid)
                                        },
                                        label = { Text(label, style = MaterialTheme.typography.labelSmall) }
                                    )
                                }
                            }

                            OutlinedTextField(
                                value = currentPkg,
                                onValueChange = { value ->
                                    val cleaned = value.trim()
                                    routePackageMap[route] = cleaned
                                    prefs.edit()
                                        .putString(RouterActivity.prefKeyRoutePackage(route), cleaned)
                                        .apply()
                                    val valid = cleaned.isBlank() || checkPackageInstalled(context, cleaned)
                                    if (!valid) {
                                        routeEnabledMap[route] = false
                                        setRouteComponentEnabled(context, prefs, route, false)
                                    }
                                },
                                label = { Text("Package Name đích (Để trống = Mở bằng Trình duyệt)") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }

                // CARD KIỂM TRA NHANH VỚI CÁC ĐƯỜNG LINK MẶC ĐỊNH CÓ SẴN
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xBF111827)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "Kiểm tra nhanh Chuyển tiếp (Có sẵn Đường Link Mặc Định)",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )

                        FlowRow(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(
                                "YouTube Video" to "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                                "YouTube Shorts" to "https://m.youtube.com/shorts/5qap5aO4i9A",
                                "YouTube Music" to "https://music.youtube.com/watch?v=dQw4w9WgXcQ",
                                "Spotify" to "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
                            ).forEach { (label, sampleLink) ->
                                FilterChip(
                                    selected = testUrl == sampleLink,
                                    onClick = { testUrl = sampleLink },
                                    label = { Text(label, style = MaterialTheme.typography.labelSmall) }
                                )
                            }
                        }

                        OutlinedTextField(
                            value = testUrl,
                            onValueChange = { testUrl = it },
                            label = { Text("Đường link kiểm tra mặc định") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Button(
                            onClick = {
                                val trimmed = testUrl.trim().ifEmpty {
                                    RouterActivity.DEFAULT_SAMPLE_YOUTUBE_URL
                                }
                                testUrl = trimmed
                                val testIntent = Intent(context, RouterActivity::class.java).apply {
                                    action = Intent.ACTION_VIEW
                                    data = Uri.parse(trimmed)
                                }
                                context.startActivity(testIntent)
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Bắn thử Intent qua RouterActivity")
                        }

                        HorizontalDivider()

                        Text(
                            text = "Đã xử lý: $dispatchCount liên kết · URL gần nhất: $lastDispatchedUrl",
                            style = MaterialTheme.typography.bodySmall,
                            fontFamily = FontFamily.Monospace,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

private fun openAccessibilitySettings(context: Context) {
    try {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    } catch (e: Exception) {
        Toast.makeText(
            context,
            "Không thể mở Cài đặt Hỗ trợ tiếp cận: ${e.localizedMessage}",
            Toast.LENGTH_SHORT
        ).show()
    }
}

private fun setRouteComponentEnabled(
    context: Context,
    prefs: android.content.SharedPreferences,
    route: ServiceRoute,
    enabled: Boolean
) {
    prefs.edit().putBoolean(RouterActivity.prefKeyRouteEnabled(route), enabled).apply()
    try {
        val componentName = ComponentName(context.packageName, route.aliasClassName)
        val newState = if (enabled) {
            PackageManager.COMPONENT_ENABLED_STATE_ENABLED
        } else {
            PackageManager.COMPONENT_ENABLED_STATE_DISABLED
        }
        context.packageManager.setComponentEnabledSetting(
            componentName,
            newState,
            PackageManager.DONT_KILL_APP
        )
    } catch (_: Exception) {
        // Bỏ qua
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
    val packageUri = Uri.parse("package:${context.packageName}")
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
                "Không thể mở Cài đặt hệ thống: ${e.localizedMessage}",
                Toast.LENGTH_SHORT
            ).show()
        }
    }
}
