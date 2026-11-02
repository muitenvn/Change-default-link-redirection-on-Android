import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  Check,
  Copy,
  Download,
  FileCode,
  Globe,
  Play,
  Palette,
  Power,
  RefreshCw,
} from 'lucide-react';
import {
  DetectedBrowserDeviceItem,
  generateAndroidProjectFiles,
  INITIAL_ROUTES,
  parseYoutubeInputForPreview,
  ProjectConfig,
  RouteRuleConfig,
  ServiceRouteId,
  WallpaperThemeId,
} from './data/androidProjectTemplate';

const WALLPAPER_THEMES: Array<{
  id: WallpaperThemeId;
  label: string;
  bgGradient: string;
  orbPrimary: string;
  orbSecondary: string;
  waveStroke: string;
  accentText: string;
}> = [
  {
    id: 'aurora_emerald',
    label: 'Aurora Ngọc Lục Bảo',
    bgGradient: 'from-[#050d1a] via-[#092223] to-[#070b14]',
    orbPrimary: 'rgba(16, 185, 129, 0.22)',
    orbSecondary: 'rgba(56, 189, 248, 0.14)',
    waveStroke: 'rgba(16, 185, 129, 0.18)',
    accentText: 'text-emerald-300',
  },
  {
    id: 'crimson_stage',
    label: 'Đỏ Sân Khấu (YouTube)',
    bgGradient: 'from-[#180710] via-[#270d1a] to-[#080b14]',
    orbPrimary: 'rgba(244, 63, 94, 0.22)',
    orbSecondary: 'rgba(251, 146, 60, 0.12)',
    waveStroke: 'rgba(244, 63, 94, 0.18)',
    accentText: 'text-rose-300',
  },
  {
    id: 'cyber_indigo',
    label: 'Tím Không Gian (Indigo)',
    bgGradient: 'from-[#090c22] via-[#191236] to-[#080b14]',
    orbPrimary: 'rgba(129, 140, 248, 0.24)',
    orbSecondary: 'rgba(192, 132, 252, 0.15)',
    waveStroke: 'rgba(129, 140, 248, 0.19)',
    accentText: 'text-indigo-300',
  },
  {
    id: 'ocean_slate',
    label: 'Xanh Đại Dương Sâu',
    bgGradient: 'from-[#071326] via-[#0e213d] to-[#080b14]',
    orbPrimary: 'rgba(56, 189, 248, 0.22)',
    orbSecondary: 'rgba(45, 212, 191, 0.14)',
    waveStroke: 'rgba(56, 189, 248, 0.18)',
    accentText: 'text-sky-300',
  },
];

const SAMPLE_LINKS = [
  {
    label: 'Link Web bất kỳ (Ngoài danh sách)',
    url: 'https://vnexpress.net/khoa-hoc-cong-nghe',
  },
  {
    label: 'YouTube Music',
    url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=RDAMVMdQw4w9WgXcQ',
  },
  {
    label: 'YouTube Video / Shorts',
    url: 'https://m.youtube.com/shorts/5qap5aO4i9A',
  },
  {
    label: 'Spotify Track',
    url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc123',
  },
  {
    label: 'Facebook Watch',
    url: 'https://fb.watch/v987654321/',
  },
  {
    label: 'TikTok / Instagram',
    url: 'https://www.instagram.com/reel/C8abc123xyz/',
  },
];

function AtmosphericSvgBackdrop({ themeId }: { themeId: WallpaperThemeId }) {
  const theme = WALLPAPER_THEMES.find((t) => t.id === themeId) || WALLPAPER_THEMES[0];
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 bg-gradient-to-br ${theme.bgGradient} transition-colors duration-500 overflow-hidden`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-full opacity-90"
        viewBox="0 0 1440 900"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="orb1" cx="82%" cy="16%" r="55%">
            <stop offset="0%" stopColor={theme.orbPrimary} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <radialGradient id="orb2" cx="16%" cy="80%" r="50%">
            <stop offset="0%" stopColor={theme.orbSecondary} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
          <pattern id="subtleGrid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path
              d="M 64 0 L 0 0 0 64"
              fill="none"
              stroke="rgba(255,255,255,0.025)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="1440" height="900" fill="url(#subtleGrid)" />
        <circle cx="1180" cy="140" r="620" fill="url(#orb1)" />
        <circle cx="240" cy="720" r="560" fill="url(#orb2)" />

        <path
          d="M-100 260 C 360 120, 820 420, 1540 210"
          stroke={theme.waveStroke}
          strokeWidth="2"
        />
        <path
          d="M-100 340 C 420 200, 860 500, 1540 290"
          stroke={theme.waveStroke}
          strokeWidth="1.5"
          strokeDasharray="8 8"
        />
        <path
          d="M-100 580 C 480 420, 920 710, 1540 520"
          stroke={theme.waveStroke}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function AppLauncherLogo({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <svg
      className={`${className} rounded-xl shrink-0`}
      viewBox="0 0 108 108"
      fill="none"
      aria-label="Link Dispatcher App Logo"
    >
      <defs>
        <linearGradient
          id="logoBgGrad"
          x1="0"
          y1="0"
          x2="108"
          y2="108"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#07111E" />
          <stop offset="55%" stopColor="#0C262B" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>
      </defs>
      <rect width="108" height="108" rx="24" fill="url(#logoBgGrad)" />
      <circle cx="54" cy="54" r="38" fill="rgba(16, 185, 129, 0.12)" />
      <polygon points="54,22 80,37 80,71 54,86 28,71 28,37" fill="#10B981" />
      <polygon points="54,27 75.5,39.5 75.5,68.5 54,81 32.5,68.5 32.5,39.5" fill="#09131F" />
      <polygon points="43,41 64,54 43,67" fill="#34D399" />
      <path
        d="M58 42 L70 42 L70 54"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M56 56 L70 42"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function App() {
  const [config, setConfig] = useState<ProjectConfig>({
    appName: 'Link Dispatcher',
    applicationId: 'com.example.linkdispatcher',
    compileSdk: 34,
    minSdk: 26,
    targetSdk: 34,
    preferNativeSchemeDefault: false,
    intentPriority: 999,
    wallpaperTheme: 'aurora_emerald',
    routes: INITIAL_ROUTES,
  });

  const [activeRouteTab, setActiveRouteTab] = useState<ServiceRouteId>('youtube_video');
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    'app/src/main/java/com/example/linkdispatcher/RouterActivity.kt'
  );
  const [fileFilter, setFileFilter] = useState<'all' | 'core' | 'gradle' | 'ci'>('all');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Mô phỏng danh sách trình duyệt được PackageManager.queryIntentActivities tự động phát hiện trên máy
  const [simDetectedBrowsers, setSimDetectedBrowsers] = useState<DetectedBrowserDeviceItem[]>([
    { appName: 'Chrome', packageName: 'com.android.chrome' },
    { appName: 'Brave', packageName: 'com.brave.browser' },
    { appName: 'Samsung Internet', packageName: 'com.sec.android.app.sbrowser' },
    { appName: 'Firefox', packageName: 'org.mozilla.firefox' },
  ]);
  const [simSelectedBrowserPkg, setSimSelectedBrowserPkg] = useState<string>('');
  const [customBrowserName, setCustomBrowserName] = useState<string>('');
  const [customBrowserPkg, setCustomBrowserPkg] = useState<string>('');

  // Simulator states (Phần Web URL để trống mặc định)
  const [simUrlInput, setSimUrlInput] = useState<string>('');
  const [simTargetPackageInstalled, setSimTargetPackageInstalled] = useState<boolean>(true);
  const [simPhoneScreen, setSimPhoneScreen] = useState<
    'main_activity' | 'router_dispatch_result' | 'system_open_by_default'
  >('main_activity');
  const [simDispatchCount, setSimDispatchCount] = useState<number>(28);
  const [simLastDispatchedToast, setSimLastDispatchedToast] = useState<string | null>(null);

  const projectFiles = useMemo(() => generateAndroidProjectFiles(config), [config]);

  const filteredFiles = useMemo(() => {
    if (fileFilter === 'all') return projectFiles;
    return projectFiles.filter((f) => f.category === fileFilter);
  }, [projectFiles, fileFilter]);

  const activeFile = useMemo(() => {
    return (
      projectFiles.find((f) => f.path === selectedFilePath) ||
      filteredFiles[0] ||
      projectFiles[0]
    );
  }, [projectFiles, filteredFiles, selectedFilePath]);

  const parsedPreview = useMemo(() => parseYoutubeInputForPreview(simUrlInput), [simUrlInput]);
  const matchedRouteConfig = parsedPreview.serviceId
    ? config.routes[parsedPreview.serviceId]
    : null;

  const activeFallbackBrowser = useMemo(() => {
    if (simSelectedBrowserPkg) {
      const found = simDetectedBrowsers.find((b) => b.packageName === simSelectedBrowserPkg);
      if (found) return found;
    }
    return (
      simDetectedBrowsers[0] || {
        appName: 'Trình duyệt hệ thống',
        packageName: 'android.intent.category.BROWSABLE',
      }
    );
  }, [simDetectedBrowsers, simSelectedBrowserPkg]);

  const updateRoute = (
    routeId: ServiceRouteId,
    updater: (prevRoute: RouteRuleConfig) => RouteRuleConfig
  ) => {
    setConfig((prev) => ({
      ...prev,
      routes: {
        ...prev.routes,
        [routeId]: updater(prev.routes[routeId]),
      },
    }));
  };

  const handleAddSimulatedDeviceBrowser = () => {
    const cleanName = customBrowserName.trim();
    const cleanPkg = customBrowserPkg.trim();
    if (!cleanName || !cleanPkg) return;
    if (cleanPkg === config.applicationId) return;
    setSimDetectedBrowsers((prev) => {
      if (prev.some((b) => b.packageName === cleanPkg)) return prev;
      return [...prev, { appName: cleanName, packageName: cleanPkg }];
    });
    setSimSelectedBrowserPkg(cleanPkg);
    setCustomBrowserName('');
    setCustomBrowserPkg('');
  };

  const handleCopyCode = async (content: string, pathKey: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPath(pathKey);
      setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadSingleFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.split('/').pop() || filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullRepoZip = async () => {
    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      projectFiles.forEach((file) => {
        zip.file(file.path, file.content);
      });
      const launcherFile = projectFiles.find(
        (f) => f.path === 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml'
      );
      if (launcherFile) {
        zip.file(
          'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
          launcherFile.content
        );
      }
      zip.file(
        'app/proguard-rules.pro',
        `-keep class ${config.applicationId}.** { *; }\n`
      );
      zip.file(
        'README.md',
        `# ${config.appName} (Android Native Link Dispatcher)\n\n` +
          `- **Tự động phát hiện Trình duyệt trên thiết bị**: Dùng \`PackageManager.queryIntentActivities\` với \`CATEGORY_BROWSABLE\` (không định sẵn danh sách trình duyệt cứng) để phát hiện toàn bộ trình duyệt đang cài trên máy và cho phép người dùng chọn trình duyệt mở các liên kết Web còn lại.\n` +
          `- **RouterActivity dùng \`Theme.NoDisplay\` & kế thừa \`android.app.Activity\`** kèm bộ lọc Default Browser (\`http\`/\`https\` \`BROWSABLE\`) để bắt liên kết mặc định mượt như phiên bản đầu.\n` +
          `- **Không hiện bảng báo lỗi & Không tự mở app mặc định**: Nếu chưa cài đặt bản Mod, ứng dụng sẽ tự động tắt luồng / vô hiệu hóa \`ComponentName\` của luồng đó và mở thẳng qua trình duyệt đã chọn.\n`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LinkDispatcher-Android-Repo.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingZip(false);
    }
  };

  const triggerSimulateRouter = () => {
    const effectiveUrl = simUrlInput.trim() || SAMPLE_LINKS[0].url;
    if (!simUrlInput.trim()) {
      setSimUrlInput(effectiveUrl);
    }
    const preview = parseYoutubeInputForPreview(effectiveUrl);
    setSimDispatchCount((prev) => prev + 1);

    // Trường hợp 0: Liên kết Web ngoài danh sách 5 ứng dụng (ví dụ vnexpress.net, google.com)
    if (!preview.serviceId) {
      setSimPhoneScreen('router_dispatch_result');
      setSimLastDispatchedToast(
        `[Link ngoài danh sách App] Đã tự động chuyển thẳng sang trình duyệt "${activeFallbackBrowser.appName}" (${activeFallbackBrowser.packageName})`
      );
      return;
    }

    const route = config.routes[preview.serviceId];

    // Trường hợp 1: Luồng đã tắt hoặc để trống Package (Mở bằng Trình duyệt đã chọn)
    if (!route.enabled || !route.targetPackage) {
      setSimPhoneScreen('router_dispatch_result');
      setSimLastDispatchedToast(
        `[${route.title}] Đã chuyển thẳng sang trình duyệt "${activeFallbackBrowser.appName}" (${activeFallbackBrowser.packageName})`
      );
      return;
    }

    // Trường hợp 2: Chưa cài bản Mod (ví dụ app.morphe.android.youtube)
    if (!simTargetPackageInstalled) {
      updateRoute(route.id, (r) => ({ ...r, enabled: false }));
      setSimPhoneScreen('router_dispatch_result');
      setSimLastDispatchedToast(
        `Chưa cài "${route.targetPackage}" -> Đã tự động tắt ComponentName(${route.aliasName}) & mở qua "${activeFallbackBrowser.appName}" (${activeFallbackBrowser.packageName})`
      );
      return;
    }

    // Trường hợp 3: Đã cài bản Mod -> Mở tức thì với Theme.NoDisplay
    setSimPhoneScreen('router_dispatch_result');
    const targetUri =
      config.preferNativeSchemeDefault && preview.nativeSchemeUri
        ? preview.nativeSchemeUri
        : preview.normalizedHttpsUrl || effectiveUrl;
    setSimLastDispatchedToast(
      `[Theme.NoDisplay] Đã bắn Intent sang "${route.targetPackage}" (${targetUri}) & finish() trong 2ms`
    );
  };

  const activeRoute = config.routes[activeRouteTab];
  const currentThemeObj =
    WALLPAPER_THEMES.find((t) => t.id === config.wallpaperTheme) || WALLPAPER_THEMES[0];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative">
      <AtmosphericSvgBackdrop themeId={config.wallpaperTheme} />

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-white/10 bg-[#060911]/85 backdrop-blur-md sticky top-0 z-30">
        <a
          href="#top"
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Link Dispatcher Studio
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#browser-discovery"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Tự động Phát hiện Trình duyệt
          </a>
          <a
            href="#multi-route-hub"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Cấu hình Đa luồng
          </a>
          <a
            href="#intent-simulator"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Mô phỏng Mở Link
          </a>
          <a
            href="#source-workspace"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Mã nguồn Kotlin &amp; Manifest
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDownloadFullRepoZip}
            disabled={isExportingZip}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingZip ? 'Đang đóng gói ZIP...' : 'Tải trọn bộ Repo (.ZIP)'}</span>
          </button>
        </div>
      </header>

      <main id="top" className="max-w-[1400px] w-full mx-auto px-6 py-8 space-y-12 flex-1">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-white/10 pb-10">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AppLauncherLogo className="w-12 h-12 border border-emerald-400/30" />
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2 font-mono">
                  <span>Auto-Detect Installed Browsers</span>
                  <span aria-hidden="true">·</span>
                  <span>Theme.NoDisplay</span>
                  <span aria-hidden="true">·</span>
                  <span>Default Link Opener</span>
                </div>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Link Dispatcher — Mở đường dẫn tự động &amp; Tự động phát hiện Trình duyệt trên máy
              </h1>
              <p className="text-slate-200/90 text-base leading-relaxed max-w-2xl">
                Khi đặt ứng dụng làm trình mở đường dẫn mặc định, mọi liên kết thuộc{' '}
                <strong>YouTube, YouTube Music, Spotify, Facebook, MXH</strong> sẽ đi thẳng vào bản
                Mod tương ứng. Nếu đường dẫn <strong>không nằm trong các ứng dụng trên</strong>, hệ
                thống sẽ <strong>tự động chuyển sang Trình duyệt Web bạn chọn</strong> — được quét
                trực tiếp từ thiết bị qua{' '}
                <code className="text-emerald-300 font-mono text-sm">
                  PackageManager.queryIntentActivities()
                </code>{' '}
                mà không hề định sẵn danh sách trình duyệt cứng.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-xs text-slate-400">Quét Trình duyệt</div>
                <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                  queryIntentActivities
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Link ngoài danh sách</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  Qua Trình duyệt đã chọn
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Chống lặp vô tận</div>
                <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                  Loại trừ chính App
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Trình duyệt đang chọn</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5 truncate">
                  {activeFallbackBrowser.appName}
                </div>
              </div>
            </div>
          </div>

          {/* Wallpaper & Project Settings */}
          <div className="lg:col-span-5 bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                <span>Hình nền Ứng dụng &amp; Thông số Build</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Tùy chỉnh hình nền Canvas trong <code className="font-mono text-slate-200">MainActivity.kt</code> và Application ID của dự án.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">
                  Chọn Chủ đề Hình nền (Atmospheric Canvas Wallpaper):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WALLPAPER_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, wallpaperTheme: theme.id }))
                      }
                      className={`px-3 py-2 text-xs rounded-lg border text-left transition-all cursor-pointer whitespace-nowrap truncate ${
                        config.wallpaperTheme === theme.id
                          ? 'bg-white/15 border-emerald-400 text-white font-semibold'
                          : 'bg-slate-900/70 border-white/10 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Application ID</label>
                  <input
                    type="text"
                    value={config.applicationId}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        applicationId: e.target.value.trim() || 'com.example.linkdispatcher',
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Tên ứng dụng</label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        appName: e.target.value || 'Link Dispatcher',
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 0: DYNAMIC BROWSER AUTO-DETECTION & SELECTION */}
        <section id="browser-discovery" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>
                  01. Tự động Phát hiện &amp; Chọn Trình duyệt mở các liên kết Web còn lại
                </span>
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Trên điện thoại thật, hàm{' '}
                <code className="font-mono text-emerald-300">
                  RouterActivity.detectInstalledBrowsers(context)
                </code>{' '}
                truy vấn trực tiếp <code className="font-mono">PackageManager</code> với{' '}
                <code className="font-mono">ACTION_VIEW + CATEGORY_BROWSABLE</code> để tự động lấy
                toàn bộ trình duyệt đang cài trên máy (không bao giờ định sẵn danh sách trình duyệt
                cứng).
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Chọn Trình duyệt nhận các liên kết ngoài YouTube / YT Music / Spotify / FB / MXH:
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                     Bấm chọn trình duyệt bất kỳ được hệ thống phát hiện hoặc để chế độ Tự động.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-300 shrink-0 tabular-nums">
                  {simDetectedBrowsers.length} trình duyệt phát hiện
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSimSelectedBrowserPkg('')}
                  className={`px-3.5 py-2 rounded-lg text-xs border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    simSelectedBrowserPkg === ''
                      ? 'bg-emerald-400/20 border-emerald-400 text-emerald-200 font-semibold'
                      : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                  }`}
                >
                  Tự động ({simDetectedBrowsers[0]?.appName || 'Mặc định'})
                </button>

                {simDetectedBrowsers.map((browser) => {
                  const isSelected = simSelectedBrowserPkg === browser.packageName;
                  return (
                    <button
                      key={browser.packageName}
                      type="button"
                      onClick={() => setSimSelectedBrowserPkg(browser.packageName)}
                      className={`px-3.5 py-2 rounded-lg text-xs border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        isSelected
                          ? 'bg-emerald-400/20 border-emerald-400 text-emerald-200 font-semibold'
                          : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {browser.appName}{' '}
                      <span className="font-mono text-[11px] opacity-80">
                        ({browser.packageName})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-4 py-3 rounded-lg bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-300">
                  Trình duyệt sẽ mở mọi liên kết Web thông thường:
                </span>
                <span className="font-mono font-semibold text-emerald-300">
                  {activeFallbackBrowser.appName} ({activeFallbackBrowser.packageName})
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-900/75 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Giả lập cài thêm Trình duyệt bất kỳ lên máy</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Dynamic Scan</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Vì ứng dụng dùng <code className="font-mono text-slate-200">queryIntentActivities</code>{' '}
                để tự phát hiện trình duyệt, bất kỳ trình duyệt nào bạn cài trên điện thoại (như Via,
                Vivaldi, Cốc Cốc, DuckDuckGo, Kiwi...) đều tự động xuất hiện để bạn chọn:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={customBrowserName}
                  onChange={(e) => setCustomBrowserName(e.target.value)}
                  placeholder="Tên (VD: Via Browser)"
                  className="px-3 py-1.5 text-xs bg-slate-950 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
                <input
                  type="text"
                  value={customBrowserPkg}
                  onChange={(e) => setCustomBrowserPkg(e.target.value)}
                  placeholder="Package (VD: mark.via.gp)"
                  className="px-3 py-1.5 text-xs font-mono bg-slate-950 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="button"
                onClick={handleAddSimulatedDeviceBrowser}
                className="w-full py-2 text-xs font-semibold bg-white/10 hover:bg-white/15 text-emerald-300 border border-emerald-400/30 rounded-lg transition-colors cursor-pointer"
              >
                + Giả lập hệ thống phát hiện thêm Trình duyệt này
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: MULTI-ROUTE CONFIGURATION */}
        <section id="multi-route-hub" className="space-y-5 pt-4 border-t border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">
              02. Quản lý Đường dẫn Ứng dụng (YouTube, YT Music, Spotify, Facebook, MXH)
            </h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Chọn gói đích cho từng luồng hoặc gạt nút Bật/Tắt. Nếu luồng đang tắt hoặc gói Mod chưa
              cài đặt trên máy, liên kết sẽ tự động chuyển sang trình duyệt{' '}
              <strong className="text-emerald-300">{activeFallbackBrowser.appName}</strong> bạn đã
              chọn ở mục trên.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {(Object.values(config.routes) as RouteRuleConfig[]).map((route) => {
              const isSelected = activeRouteTab === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => setActiveRouteTab(route.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-900/95 border-emerald-400/80'
                      : route.enabled
                        ? 'bg-slate-950/70 border-white/10 hover:border-white/25'
                        : 'bg-slate-950/40 border-white/5 opacity-65'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-white truncate">{route.title}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateRoute(route.id, (r) => ({ ...r, enabled: !r.enabled }));
                        }}
                        className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          route.enabled
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {route.enabled ? 'BẬT' : 'TẮT'}
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">
                      {route.domains.join(', ')}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <div className="text-[10px] text-slate-400">Đích hiện tại:</div>
                    <div className="text-xs font-mono text-emerald-300 truncate mt-0.5">
                      {!route.enabled
                        ? `Đã tắt (Qua ${activeFallbackBrowser.appName})`
                        : route.targetPackage || `Để trống (Qua ${activeFallbackBrowser.appName})`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{activeRoute.title}</h3>
                  <span className="text-xs font-mono text-slate-400">
                    · {activeRoute.aliasName}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{activeRoute.subtitle}</p>
              </div>

              <button
                type="button"
                onClick={() =>
                  updateRoute(activeRoute.id, (r) => ({ ...r, enabled: !r.enabled }))
                }
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeRoute.enabled
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{activeRoute.enabled ? 'Đang BẬT (Nhấn để Tắt)' : 'Đang TẮT (Nhấn để Bật)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
                <label className="block text-xs font-medium text-slate-200">
                  Chọn nhanh Package đích cho {activeRoute.title}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeRoute.presets.map((preset) => {
                    const isCurrent = activeRoute.targetPackage === preset.pkg;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          updateRoute(activeRoute.id, (r) => ({
                            ...r,
                            enabled: true,
                            targetPackage: preset.pkg,
                          }))
                        }
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-400/20 border-emerald-400 text-emerald-200 font-semibold'
                            : 'bg-slate-900 border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-2">
                <label className="block text-xs font-medium text-slate-200">
                  Nhập Package Name đích (Hoặc để trống nếu muốn mở bằng Trình duyệt đã chọn):
                </label>
                <input
                  type="text"
                  value={activeRoute.targetPackage}
                  onChange={(e) =>
                    updateRoute(activeRoute.id, (r) => ({
                      ...r,
                      targetPackage: e.target.value.trim(),
                    }))
                  }
                  placeholder={`Đang để trống (Sẽ mở qua ${activeFallbackBrowser.appName})`}
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
                <div className="text-[11px] text-slate-400 font-mono">
                  {activeRoute.targetPackage
                    ? `Nếu chưa cài ${activeRoute.targetPackage}: Tự tắt luồng & mở qua ${activeFallbackBrowser.appName}`
                    : `Đang để trống Package -> Mở thẳng qua ${activeFallbackBrowser.appName}`}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SIMULATOR */}
        <section id="intent-simulator" className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                03. Bàn thử nghiệm Mở Đường Dẫn Tự Động (App Mod &amp; Trình duyệt đã phát hiện)
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Thử nghiệm mở một đường link bất kỳ ngoài danh sách (như{' '}
                <code className="font-mono text-emerald-300">vnexpress.net</code>) hoặc link YouTube /
                Spotify để xem cách <code className="font-mono">RouterActivity</code> điều hướng tức
                thì.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-white/15 rounded-lg self-start">
              <button
                onClick={() => setSimPhoneScreen('main_activity')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'main_activity'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MainActivity (Cài đặt)
              </button>
              <button
                onClick={() => setSimPhoneScreen('router_dispatch_result')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'router_dispatch_result'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Kết quả RouterActivity
              </button>
              <button
                onClick={() => setSimPhoneScreen('system_open_by_default')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'system_open_by_default'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Android &quot;Mở theo mặc định&quot;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Kiểm tra liên kết đầu vào (Để trống mặc định)
                  </h3>
                  <span className="text-xs font-mono text-emerald-300">
                    Theme.NoDisplay · Auto Browser
                  </span>
                </div>

                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simUrlInput}
                      onChange={(e) => setSimUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      placeholder="Để trống mặc định — Nhập link bất kỳ hoặc bấm nút mẫu bên dưới..."
                    />
                    <button
                      onClick={triggerSimulateRouter}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Chạy thử Router</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {SAMPLE_LINKS.map((sample) => (
                      <button
                        key={sample.label}
                        type="button"
                        onClick={() => setSimUrlInput(sample.url)}
                        className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          simUrlInput === sample.url
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40 font-medium'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-white/5'
                        }`}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-white/10 rounded-lg divide-y divide-white/10 text-xs">
                  <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Phân loại đường dẫn</span>
                    <span className="font-mono font-semibold text-emerald-300 truncate">
                      {parsedPreview.serviceTitle} ({parsedPreview.linkType})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-slate-400 shrink-0">Trình duyệt dự phòng đã chọn</span>
                    <span className="font-mono font-semibold text-sky-300 truncate">
                      {activeFallbackBrowser.appName} ({activeFallbackBrowser.packageName})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Hành động của RouterActivity</span>
                    <span className="font-mono font-semibold text-white truncate">
                      {!matchedRouteConfig
                        ? `Mở thẳng bằng ${activeFallbackBrowser.appName} (${activeFallbackBrowser.packageName})`
                        : !matchedRouteConfig.enabled || !matchedRouteConfig.targetPackage
                          ? `Mở thẳng bằng ${activeFallbackBrowser.appName}`
                          : simTargetPackageInstalled
                            ? `Mở ứng dụng ${matchedRouteConfig.targetPackage}`
                            : `Tự tắt luồng & Mở bằng ${activeFallbackBrowser.appName}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Giả lập trạng thái cài đặt bản Mod trên máy
                    </div>
                    <div className="text-xs text-slate-400">
                      Khi chưa cài bản Mod hoặc khi mở link ngoài danh sách, liên kết sẽ chuyển sang{' '}
                      <strong className="text-slate-200">{activeFallbackBrowser.appName}</strong>.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSimTargetPackageInstalled((prev) => !prev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      simTargetPackageInstalled
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {simTargetPackageInstalled
                      ? `Đã cài ${matchedRouteConfig?.targetPackage || 'App Mod'}`
                      : `Chưa cài ${matchedRouteConfig?.targetPackage || 'App Mod'}`}
                  </button>
                </div>

                {simLastDispatchedToast && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-emerald-300 flex items-center justify-between gap-2">
                    <span className="truncate">{simLastDispatchedToast}</span>
                    <span className="text-slate-500 shrink-0">NoDisplay</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Android 14 Simulator */}
            <div
              className={`lg:col-span-5 rounded-xl border border-white/20 p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b ${currentThemeObj.bgGradient}`}
            >
              <svg
                className="pointer-events-none absolute inset-0 w-full h-full opacity-75"
                viewBox="0 0 400 700"
                fill="none"
                preserveAspectRatio="none"
              >
                <circle cx="340" cy="90" r="180" fill={currentThemeObj.orbPrimary} />
                <circle cx="60" cy="560" r="160" fill={currentThemeObj.orbSecondary} />
                <path
                  d="M0 190 C 130 120, 270 260, 400 170"
                  stroke={currentThemeObj.waveStroke}
                  strokeWidth="2"
                />
              </svg>

              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300 pb-3 border-b border-white/15">
                <span>Android 14 · {currentThemeObj.label}</span>
                <span>
                  {simPhoneScreen === 'main_activity' ? 'MainActivity.kt' : 'Theme.NoDisplay'}
                </span>
              </div>

              {simPhoneScreen === 'main_activity' && (
                <div className="relative z-10 py-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <AppLauncherLogo className="w-8 h-8 border border-emerald-400/30" />
                      <div>
                        <div className="text-base font-bold text-white">{config.appName}</div>
                        <div className="text-[11px] text-slate-300">
                          Điều hướng siêu mượt (Theme.NoDisplay &amp; Auto Browser)
                        </div>
                      </div>
                    </div>

                    {/* Card Chọn Trình duyệt tự động phát hiện ngay trên màn hình điện thoại */}
                    <div className="p-3 rounded-lg border border-emerald-400/30 bg-slate-950/80 backdrop-blur-md space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">
                          Trình duyệt mở các link Web còn lại
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300">
                          Auto-Detected ({simDetectedBrowsers.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSimSelectedBrowserPkg('')}
                          className={`px-2 py-1 text-[10px] rounded border cursor-pointer ${
                            simSelectedBrowserPkg === ''
                              ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-300'
                              : 'bg-slate-900 text-slate-300 border-white/10'
                          }`}
                        >
                          Tự động ({simDetectedBrowsers[0]?.appName})
                        </button>
                        {simDetectedBrowsers.map((b) => (
                          <button
                            key={b.packageName}
                            type="button"
                            onClick={() => setSimSelectedBrowserPkg(b.packageName)}
                            className={`px-2 py-1 text-[10px] rounded border cursor-pointer ${
                              simSelectedBrowserPkg === b.packageName
                                ? 'bg-emerald-400 text-slate-950 font-bold border-emerald-300'
                                : 'bg-slate-900 text-slate-300 border-white/10'
                            }`}
                          >
                            {b.appName}
                          </button>
                        ))}
                      </div>
                      <div className="text-[10px] font-mono text-emerald-300 truncate">
                        Đang chọn: {activeFallbackBrowser.appName} (
                        {activeFallbackBrowser.packageName})
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                      {(Object.values(config.routes) as RouteRuleConfig[]).map((route, idx) => (
                        <div
                          key={route.id}
                          className={`p-2.5 rounded-lg border backdrop-blur-md transition-all ${
                            route.enabled
                              ? 'bg-slate-950/75 border-white/15'
                              : 'bg-slate-950/40 border-white/5 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-white">
                              {idx + 1}. {route.title}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateRoute(route.id, (r) => ({ ...r, enabled: !r.enabled }))
                              }
                              className={`px-2 py-0.5 text-[10px] font-mono rounded cursor-pointer whitespace-nowrap shrink-0 ${
                                route.enabled
                                  ? 'bg-emerald-400 text-slate-950 font-bold'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {route.enabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                            </button>
                          </div>

                          <div className="mt-1.5">
                            <div className="px-2 py-1 rounded bg-slate-900/90 border border-white/10 font-mono text-[11px] text-emerald-300 truncate">
                              Đích:{' '}
                              {route.targetPackage ||
                                `Mở qua ${activeFallbackBrowser.appName}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/15">
                    <button
                      onClick={() => setSimPhoneScreen('system_open_by_default')}
                      className="w-full py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Đặt làm &apos;Ứng dụng mở đường dẫn mặc định&apos;
                    </button>
                  </div>
                </div>
              )}

              {simPhoneScreen === 'router_dispatch_result' && (
                <div className="relative z-10 py-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="text-xs font-mono text-emerald-400">
                      RouterActivity (Theme.NoDisplay) -&gt; finish()
                    </div>
                    <h4 className="text-base font-bold text-white">
                      {matchedRouteConfig &&
                      matchedRouteConfig.enabled &&
                      matchedRouteConfig.targetPackage &&
                      simTargetPackageInstalled
                        ? `Đã mở tức thì ứng dụng ${matchedRouteConfig.targetPackage}`
                        : `Đã chuyển thẳng sang trình duyệt ${activeFallbackBrowser.appName} (${activeFallbackBrowser.packageName})`}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Mọi đường dẫn không nằm trong các ứng dụng đã bật sẽ tự động đi thẳng qua trình
                      duyệt <strong className="text-emerald-300">{activeFallbackBrowser.appName}</strong>{' '}
                      được phát hiện trên máy mà không hiện bất kỳ bảng báo lỗi nào.
                    </p>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('main_activity')}
                    className="w-full py-2 text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-white/15 transition-colors cursor-pointer"
                  >
                    Quay lại màn hình chính
                  </button>
                </div>
              )}

              {simPhoneScreen === 'system_open_by_default' && (
                <div className="relative z-10 py-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="text-sm font-bold text-white">
                      Ứng dụng mở đường dẫn mặc định (Default Browser)
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Khi chọn {config.appName} làm ứng dụng mở đường dẫn mặc định:
                    </p>
                    <div className="space-y-1.5 pt-1">
                      {(Object.values(config.routes) as RouteRuleConfig[]).map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between text-xs py-1 border-b border-white/5"
                        >
                          <span className="font-mono text-slate-200">{r.domains[0]}</span>
                          <span
                            className={`font-mono text-[11px] ${
                              r.enabled ? 'text-emerald-400' : 'text-slate-400'
                            }`}
                          >
                            {r.enabled
                              ? `-> ${r.targetPackage || activeFallbackBrowser.appName}`
                              : `-> ${activeFallbackBrowser.appName}`}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between text-xs py-1.5">
                        <span className="font-mono text-sky-300">Các trang Web khác (*.*)</span>
                        <span className="font-mono text-[11px] text-sky-300 font-semibold">
                          -&gt; {activeFallbackBrowser.appName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('main_activity')}
                    className="w-full py-2 text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-white/15 transition-colors cursor-pointer"
                  >
                    Quay lại {config.appName}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: SOURCE CODE EXPLORER */}
        <section id="source-workspace" className="space-y-5 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                04. Trọn bộ Mã nguồn Android Native (Tự động phát hiện Trình duyệt &amp; Chuyển tiếp)
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Sao chép từng file hoặc nhấn nút <strong>Tải trọn bộ Repo (.ZIP)</strong> để lấy toàn bộ dự án mới nhất.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-white/15 rounded-lg self-start">
              {(
                [
                  { id: 'all', label: `Tất cả (${projectFiles.length})` },
                  { id: 'core', label: 'Mã nguồn & Logo (6)' },
                  { id: 'gradle', label: 'Cấu hình Gradle (5)' },
                  { id: 'ci', label: 'GitHub Actions (1)' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFileFilter(tab.id);
                    const firstMatch =
                      tab.id === 'all'
                        ? projectFiles[0]
                        : projectFiles.find((f) => f.category === tab.id);
                    if (firstMatch) setSelectedFilePath(firstMatch.path);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    fileFilter === tab.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-4 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">Cây thư mục Repository</span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {filteredFiles.length} files
                </span>
              </div>
              <div className="divide-y divide-white/10">
                {filteredFiles.map((file) => {
                  const isSelected = activeFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFilePath(file.path)}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/15 text-white'
                          : 'hover:bg-white/5 text-slate-300'
                      }`}
                    >
                      <FileCode
                        className={`w-4 h-4 mt-0.5 shrink-0 ${
                          isSelected ? 'text-emerald-400' : 'text-slate-400'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs font-mono truncate ${
                            isSelected ? 'font-semibold text-emerald-300' : 'text-slate-200'
                          }`}
                        >
                          {file.path}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {file.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-8 bg-slate-950/90 backdrop-blur-md border border-white/15 rounded-xl overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
                <div className="min-w-0">
                  <div className="text-xs font-mono font-semibold text-emerald-300 truncate">
                    {activeFile.path}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">{activeFile.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopyCode(activeFile.content, activeFile.path)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {copiedPath === activeFile.path ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép file</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownloadSingleFile(activeFile.path, activeFile.content)}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải lẻ</span>
                  </button>
                </div>
              </div>

              <div className="p-5 overflow-x-auto max-h-[600px] overflow-y-auto bg-[#050811]">
                <pre className="text-xs font-mono leading-relaxed text-slate-200 select-all">
                  <code>{activeFile.content}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: ARCHITECTURAL EXPLANATION */}
        <section
          id="architecture-guide"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10"
        >
          <div className="bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-emerald-400">
              01. Tự động Phát hiện Trình duyệt
            </div>
            <h3 className="text-base font-bold text-white">
              Không định sẵn cứng bất kỳ trình duyệt nào
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nhờ khai báo thẻ <code className="font-mono">&lt;intent&gt;</code> với{' '}
              <code className="font-mono">CATEGORY_BROWSABLE</code> trong{' '}
              <code className="font-mono">AndroidManifest.xml</code>, hàm{' '}
              <code className="font-mono">detectInstalledBrowsers()</code> dùng{' '}
              <code className="font-mono">PackageManager.queryIntentActivities()</code> để tự động
              phát hiện mọi trình duyệt thật đang có trên máy.
            </p>
          </div>

          <div className="bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-emerald-400">
              02. Chọn Trình duyệt Mở Link Còn Lại
            </div>
            <h3 className="text-base font-bold text-white">
              Tự động chuyển mọi link ngoài danh sách sang Trình duyệt đã chọn
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Khi đặt ứng dụng làm trình mở đường dẫn mặc định, mọi liên kết không thuộc YouTube,
              YouTube Music, Spotify, Facebook, MXH sẽ tự động mở thẳng bằng trình duyệt bạn đã chọn
              trong <code className="font-mono">MainActivity.kt</code> (lưu tại{' '}
              <code className="font-mono">KEY_FALLBACK_BROWSER_PACKAGE</code>).
            </p>
          </div>

          <div className="bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-emerald-400">
              03. Chống Lặp Vô Tận &amp; 0ms UI
            </div>
            <h3 className="text-base font-bold text-white">
              Loại trừ chính Package của App khi quét trình duyệt
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Khi chính ứng dụng đang là Default Browser, bộ quét tự động lọc bỏ{' '}
              <code className="font-mono">pkg == context.packageName</code> để không bao giờ tự gọi
              lại chính nó, đồng thời giữ nguyên <code className="font-mono">Theme.NoDisplay</code>{' '}
              chuyển tiếp tức thì.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-slate-400 bg-[#050811]/80 backdrop-blur-sm">
        Link Dispatcher Android Native · Auto Browser Discovery · Kotlin 2.0 + Jetpack Compose Material 3
      </footer>
    </div>
  );
}
