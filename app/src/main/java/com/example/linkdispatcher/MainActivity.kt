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

/**
 * Hình nền đồ họa बहु-lớp (Atmospheric Mesh & Wave Canvas Background)
 * cho phép người dùng đổi chủ đề hình nền ngay trong ứng dụng.
 */
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

            // Quầng sáng nghệ thuật phía trên
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(accentGlow.copy(alpha = 0.22f), Color.Transparent),
                    center = Offset(w * 0.85f, h * 0.12f),
                    radius = w * 0.65f
                ),
                center = Offset(w * 0.85f, h * 0.12f),
                radius = w * 0.65f
            )

            // Quầng sáng phụ phía dưới
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(accentGlow.copy(alpha = 0.14f), Color.Transparent),
                    center = Offset(w * 0.15f, h * 0.78f),
                    radius = w * 0.55f
                ),
                center = Offset(w * 0.15f, h * 0.78f),
                radius = w * 0.55f
            )

            // Các đường sóng kiến trúc mềm mại
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

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun DispatcherMainScreen() {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val prefs = remember {
        context.getSharedPreferences(RouterActivity.PREFS_NAME, Context.MODE_PRIVATE)
    }

    var wallpaperStyle by remember {
        mutableStateOf(prefs.getString(RouterActivity.KEY_WALLPAPER_STYLE, "aurora_emerald") ?: "aurora_emerald")
    }

    var useNativeScheme by remember {
        mutableStateOf(prefs.getBoolean(RouterActivity.KEY_USE_NATIVE_SCHEME, false))
    }

    var autoFallbackOfficial by remember {
        mutableStateOf(prefs.getBoolean(RouterActivity.KEY_AUTO_FALLBACK_OFFICIAL, true))
    }

    var testUrl by remember {
        mutableStateOf("https://music.youtube.com/watch?v=dQw4w9WgXcQ")
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

    // Trạng thái Bật/Tắt và Package Name của từng dịch vụ (YouTube, YT Music, Spotify, Facebook, Social)
    val routeEnabledMap = remember {
        mutableStateMapOf<ServiceRoute, Boolean>().apply {
            ServiceRoute.entries.forEach { route ->
                put(route, prefs.getBoolean(RouterActivity.prefKeyRouteEnabled(route), true))
            }
        }
    }

    val routePackageMap = remember {
        mutableStateMapOf<ServiceRoute, String>().apply {
            ServiceRoute.entries.forEach { route ->
                val saved = prefs.getString(RouterActivity.prefKeyRoutePackage(route), route.defaultPackage)
                put(route, saved ?: route.defaultPackage)
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
                        Column {
                            Text(
                                text = "Link Dispatcher",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Điều hướng thông minh YouTube, YT Music, Spotify & Mạng xã hội",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
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
                // CARD 0: CHỌN HÌNH NỀN & CHỐNG ĐỤNG HÀNG NHANH
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
                            text = "Giao diện Hình nền & Chống đụng hàng ứng dụng",
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

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Tự động mở App Mặc định nếu chưa cài bản Mod",
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = FontWeight.Medium
                                )
                                Text(
                                    text = "Nếu gói Mod chưa cài, tự chuyển về YouTube / YT Music / Spotify chính thức",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(
                                checked = autoFallbackOfficial,
                                onCheckedChange = { checked ->
                                    autoFallbackOfficial = checked
                                    prefs.edit()
                                        .putBoolean(RouterActivity.KEY_AUTO_FALLBACK_OFFICIAL, checked)
                                        .apply()
                                }
                            )
                        }

                        OutlinedButton(
                            onClick = {
                                // Tự động tắt các dịch vụ ngoài YouTube nếu phát hiện máy đã có sẵn App chính thức để tránh đụng hàng
                                ServiceRoute.entries.forEach { route ->
                                    if (route != ServiceRoute.YOUTUBE_VIDEO && route != ServiceRoute.YOUTUBE_MUSIC) {
                                        val officialInstalled = checkPackageInstalled(context, route.officialPackage)
                                        if (officialInstalled) {
                                            routeEnabledMap[route] = false
                                            setRouteComponentEnabled(context, prefs, route, false)
                                        }
                                    }
                                }
                                Toast.makeText(
                                    context,
                                    "Đã tự động tắt các luồng Spotify/MXH đã có app riêng để tránh đụng hàng!",
                                    Toast.LENGTH_LONG
                                ).show()
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Tắt nhanh các luồng dễ đụng hàng với App đã cài sẵn")
                        }
                    }
                }

                // DANH SÁCH CẤU HÌNH TỪNG LUỒNG DỊCH VỤ (CÓ CÔNG TẮC BẬT/TẮT RIÊNG)
                ServiceRoute.entries.forEachIndexed { index, route ->
                    val isEnabled = routeEnabledMap[route] ?: true
                    val currentPkg = routePackageMap[route] ?: route.defaultPackage
                    val isInstalled = checkPackageInstalled(context, currentPkg)

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
                                        text = if (isEnabled) {
                                            "Đang kích hoạt đón bắt liên kết"
                                        } else {
                                            "Đã tắt (Không can thiệp, nhường quyền cho App đã đặt)"
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
                                    onCheckedChange = { enabled ->
                                        routeEnabledMap[route] = enabled
                                        setRouteComponentEnabled(context, prefs, route, enabled)
                                    }
                                )
                            }

                            if (isEnabled) {
                                Text(
                                    text = "Chọn nhanh bản Mod, App Mặc định hoặc nhập Package bất kỳ:",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )

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
                                    },
                                    label = { Text("Package Name đích (Tự nhập app bất kỳ)") },
                                    singleLine = true,
                                    modifier = Modifier.fillMaxWidth()
                                )

                                Text(
                                    text = if (isInstalled) {
                                        "Đã tìm thấy gói \"$currentPkg\" trên máy"
                                    } else {
                                        "Chưa phát hiện \"$currentPkg\" (Sẽ tự chuyển sang App mặc định hoặc bật hộp chọn)"
                                    },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (isInstalled) {
                                        MaterialTheme.colorScheme.primary
                                    } else {
                                        MaterialTheme.colorScheme.error
                                    }
                                )
                            }
                        }
                    }
                }

                // CARD CẤP QUYỀN MỞ THEO MẶC ĐỊNH
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
                            text = "Cài đặt 'Mở theo mặc định' của Hệ thống",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Mở phần cài đặt liên kết mặc định của Android để tích chọn các tên miền bạn muốn ứng dụng tự động xử lý.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Button(
                            onClick = { openSystemDefaultLinksSettings(context) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Mở màn hình 'Mở theo mặc định' (Open by default)")
                        }
                    }
                }

                // CARD KIỂM TRA NHANH INTENT ĐA NỀN TẢNG
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
                            text = "Kiểm tra nhanh Chuyển tiếp Đa nền tảng",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )

                        OutlinedTextField(
                            value = testUrl,
                            onValueChange = { testUrl = it },
                            label = { Text("Nhập link YouTube, YT Music, Spotify, Facebook, TikTok...") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        FlowRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { testUrl = "https://music.youtube.com/watch?v=dQw4w9WgXcQ" }
                            ) {
                                Text("Mẫu YT Music")
                            }
                            OutlinedButton(
                                onClick = { testUrl = "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT" }
                            ) {
                                Text("Mẫu Spotify")
                            }
                            OutlinedButton(
                                onClick = { testUrl = "https://fb.watch/v123456789/" }
                            ) {
                                Text("Mẫu Facebook")
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

/**
 * Bật hoặc tắt hẳn <activity-alias> ở cấp Hệ điều hành Android để khi người dùng tắt
 * một luồng (ví dụ Spotify hoặc Facebook), ứng dụng sẽ không còn xuất hiện hay tranh
 * quyền mở mặc định với app đã có sẵn trên máy.
 */
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
        // Bỏ qua nếu alias không tồn tại
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
