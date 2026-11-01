package com.example.linkdispatcher

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
        mutableStateOf(prefs.getBoolean(RouterActivity.KEY_USE_VND_SCHEME, false))
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
                            text = "Link Dispatcher",
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
                        text = "Chọn nhanh hoặc nhập Package Name của bản YouTube Mod (mặc định: app.morphe.android.youtube):",
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
                        placeholder = { Text("app.morphe.android.youtube") },
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
