import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  Check,
  Copy,
  Download,
  FileCode,
  Play,
  AlertTriangle,
  ShieldCheck,
  Palette,
  Power,
  Sliders,
} from 'lucide-react';
import {
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

        {/* Architectural fiber-optic routing curves */}
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

export default function App() {
  const [config, setConfig] = useState<ProjectConfig>({
    appName: 'Link Dispatcher',
    applicationId: 'com.example.linkdispatcher',
    compileSdk: 34,
    minSdk: 26,
    targetSdk: 34,
    preferNativeSchemeDefault: false,
    autoFallbackOfficial: true,
    intentPriority: 999,
    wallpaperTheme: 'aurora_emerald',
    routes: INITIAL_ROUTES,
  });

  const [activeRouteTab, setActiveRouteTab] = useState<ServiceRouteId>('youtube_music');
  const [selectedFilePath, setSelectedFilePath] = useState<string>(
    'app/src/main/AndroidManifest.xml'
  );
  const [fileFilter, setFileFilter] = useState<'all' | 'core' | 'gradle' | 'ci'>('all');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  // Simulator states
  const [simUrlInput, setSimUrlInput] = useState<string>(SAMPLE_LINKS[0].url);
  const [simTargetPackageInstalled, setSimTargetPackageInstalled] = useState<boolean>(true);
  const [simPhoneScreen, setSimPhoneScreen] = useState<
    'main_activity' | 'router_success' | 'router_fallback' | 'system_open_by_default'
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
  const matchedRouteConfig = config.routes[parsedPreview.serviceId];

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

  const handleDisableConflictingNonYoutubeRoutes = () => {
    setConfig((prev) => ({
      ...prev,
      routes: {
        ...prev.routes,
        spotify: { ...prev.routes.spotify, enabled: false },
        facebook: { ...prev.routes.facebook, enabled: false },
        social_media: { ...prev.routes.social_media, enabled: false },
      },
    }));
    setSimLastDispatchedToast(
      'Đã tắt tự động các luồng Spotify, Facebook, MXH để không đụng hàng với app có sẵn trên máy!'
    );
  };

  const handleEnableAllRoutes = () => {
    setConfig((prev) => ({
      ...prev,
      routes: {
        youtube_video: { ...prev.routes.youtube_video, enabled: true },
        youtube_music: { ...prev.routes.youtube_music, enabled: true },
        spotify: { ...prev.routes.spotify, enabled: true },
        facebook: { ...prev.routes.facebook, enabled: true },
        social_media: { ...prev.routes.social_media, enabled: true },
      },
    }));
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
      zip.file(
        'app/proguard-rules.pro',
        `-keep class ${config.applicationId}.** { *; }\n`
      );
      zip.file(
        'README.md',
        `# ${config.appName} (Multi-Platform Android Native Link Dispatcher)\n\n` +
          `Ứng dụng trung gian điều hướng thông minh cho **YouTube Video**, **YouTube Music**, **Spotify**, **Facebook** và **Mạng xã hội (TikTok, Instagram, Threads, X, Reddit)**.\n\n` +
          `## Điểm nổi bật\n` +
          `- **Tách biệt YouTube Music (` +
          `music.youtube.com` +
          `)**: Mở thẳng vào ứng dụng YouTube Music (Mod hoặc Mặc định) thay vì bị nhảy nhầm vào YouTube thường.\n` +
          `- **Hỗ trợ cả App Mod, App Mặc định (Official) và Package tự nhập bất kỳ**.\n` +
          `- **Chống đụng hàng thông minh**: Mỗi dịch vụ sử dụng một \`<activity-alias>\` độc lập. Người dùng muốn tắt luồng nào (ví dụ đã có sẵn app Spotify/Facebook mặc định), chỉ cần gạt nút tắt trong app là Android gỡ bỏ hoàn toàn bộ lọc của dịch vụ đó.\n`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LinkDispatcher-MultiPlatform-Android-Repo.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExportingZip(false);
    }
  };

  const triggerSimulateRouter = () => {
    setSimDispatchCount((prev) => prev + 1);
    const route = config.routes[parsedPreview.serviceId];

    if (!route.enabled) {
      setSimPhoneScreen('router_success');
      setSimLastDispatchedToast(
        `Luồng [${route.title}] đang TẮT (Chống đụng hàng) -> Hệ điều hành mở thẳng bằng App mặc định sẵn có trên máy!`
      );
      return;
    }

    if (simTargetPackageInstalled) {
      setSimPhoneScreen('router_success');
      const targetUri =
        config.preferNativeSchemeDefault && parsedPreview.nativeSchemeUri
          ? parsedPreview.nativeSchemeUri
          : parsedPreview.normalizedHttpsUrl || simUrlInput;
      setSimLastDispatchedToast(
        `[${route.title}] Đã dịch & chuyển tiếp sang "${route.targetPackage}" (${targetUri}) · finish() trong 4ms`
      );
    } else if (config.autoFallbackOfficial) {
      setSimPhoneScreen('router_success');
      setSimLastDispatchedToast(
        `Chưa cài "${route.targetPackage}" -> Tự động chuyển về App Mặc định chính thức "${route.officialPackage}"!`
      );
    } else {
      setSimPhoneScreen('router_fallback');
      setSimLastDispatchedToast(
        `Chưa cài "${route.targetPackage}" -> Hiển thị Compose FallbackBottomSheet`
      );
    }
  };

  const activeRoute = config.routes[activeRouteTab];
  const currentThemeObj =
    WALLPAPER_THEMES.find((t) => t.id === config.wallpaperTheme) || WALLPAPER_THEMES[0];

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative">
      {/* Custom Atmospheric Multi-Layer Background */}
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
            href="#multi-route-hub"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Cấu hình Đa luồng &amp; Chống đụng hàng
          </a>
          <a
            href="#intent-simulator"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Mô phỏng Dịch Link &amp; Hình nền App
          </a>
          <a
            href="#source-workspace"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Mã nguồn Kotlin &amp; Manifest
          </a>
          <a
            href="#architecture-guide"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            GitHub Actions APK
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

      {/* Main Content Container */}
      <main id="top" className="max-w-[1400px] w-full mx-auto px-6 py-8 space-y-12 flex-1">
        {/* Hero & Wallpaper + Global Settings */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-white/10 pb-10">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2 font-mono">
                <span>YouTube Video</span>
                <span aria-hidden="true">·</span>
                <span>YouTube Music</span>
                <span aria-hidden="true">·</span>
                <span>Spotify</span>
                <span aria-hidden="true">·</span>
                <span>Facebook &amp; MXH</span>
                <span aria-hidden="true">·</span>
                <span>Chống đụng hàng Activity-Alias</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Ứng dụng trung gian Điều hướng Đa nền tảng &amp; Tự động dịch Liên kết tới Đích
              </h1>
              <p className="text-slate-200/90 text-base leading-relaxed max-w-2xl">
                Tự động phân biệt và dịch liên kết{' '}
                <code className="text-emerald-300 font-mono text-sm">music.youtube.com</code> thẳng
                tới ứng dụng <strong>YouTube Music</strong> (Mod hoặc Mặc định), liên kết{' '}
                <code className="text-emerald-300 font-mono text-sm">youtube.com / youtu.be</code>{' '}
                tới <strong>YouTube Video</strong>, cùng các đường dẫn <strong>Spotify</strong>,{' '}
                <strong>Facebook</strong>, <strong>TikTok</strong>, <strong>Instagram</strong>. Hỗ
                trợ chọn <strong>App Mod</strong>, <strong>App Mặc định chính thức</strong> hoặc{' '}
                <strong>tự nhập bất kỳ Package nào</strong>, kèm công tắc <strong>Bật / Tắt</strong>{' '}
                từng luồng nếu máy đã có sẵn ứng dụng để không bao giờ bị đụng hàng.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-xs text-slate-400">Luồng đang kích hoạt</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                  {Object.values(config.routes).filter((r) => r.enabled).length} / 5 dịch vụ
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Đích YouTube Music</div>
                <div className="text-xs font-bold text-emerald-300 font-mono truncate mt-1">
                  {config.routes.youtube_music.targetPackage}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Cơ chế chống đụng hàng</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  Activity-Alias OS
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Chủ đề Hình nền App</div>
                <div className={`text-sm font-bold mt-0.5 ${currentThemeObj.accentText}`}>
                  {currentThemeObj.label}
                </div>
              </div>
            </div>
          </div>

          {/* Wallpaper & Conflict Guard Control Panel */}
          <div className="lg:col-span-5 bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  <span>Hình nền Ứng dụng &amp; Chế độ Chống đụng hàng</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Áp dụng đồng thời cho cả giao diện Web Studio và Canvas nền trong{' '}
                  <code className="font-mono text-slate-200">MainActivity.kt</code>.
                </p>
              </div>
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

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="pr-3">
                  <div className="text-xs font-medium text-white">
                    Tự động lùi về App Mặc định (Official) nếu chưa cài Mod
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Ví dụ: chưa cài RVX Music thì tự mở YouTube Music mặc định (`com.google.android.apps.youtube.music`)
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      autoFallbackOfficial: !prev.autoFallbackOfficial,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    config.autoFallbackOfficial
                      ? 'bg-emerald-400 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {config.autoFallbackOfficial ? 'Đang BẬT' : 'Đang TẮT'}
                </button>
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDisableConflictingNonYoutubeRoutes}
                  className="flex-1 px-3 py-2 text-xs font-medium bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  Tắt nhanh Spotify/MXH (Tránh đụng hàng)
                </button>
                <button
                  type="button"
                  onClick={handleEnableAllRoutes}
                  className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Bật tất cả 5 luồng
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: MULTI-ROUTE CONFIGURATION & CONFLICT AVOIDANCE */}
        <section id="multi-route-hub" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                01. Quản lý Đường dẫn Đa Dịch vụ (YouTube, YT Music, Spotify, Facebook, MXH)
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Tùy chỉnh từng đường dẫn: Chọn <strong>App Mod</strong>,{' '}
                <strong>App Mặc định</strong>, hoặc <strong>tự gõ tên Package bất kỳ</strong>. Nếu
                dịch vụ nào đã có app chuẩn trên máy và bạn không muốn bị đụng hàng, hãy gạt nút{' '}
                <strong>Tắt luồng</strong>.
              </p>
            </div>
          </div>

          {/* 5 Service Cards Grid */}
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
                      {route.enabled ? route.targetPackage : 'Nhường App hệ thống'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Editor for Selected Route */}
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
                <span>
                  {activeRoute.enabled
                    ? 'Đang BẬT luồng này (Nhấn để Tắt nếu bị đụng hàng)'
                    : 'Đang TẮT luồng này (Nhấn để Bật lại)'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
                <label className="block text-xs font-medium text-slate-200">
                  Chọn nhanh Ứng dụng Mod hoặc Ứng dụng Mặc định (Official) cho {activeRoute.title}:
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeRoute.presets.map((preset) => {
                    const isCurrent = activeRoute.targetPackage === preset.pkg;
                    return (
                      <button
                        key={preset.pkg}
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
                            : preset.isOfficial
                              ? 'bg-sky-500/10 border-sky-400/30 text-sky-200 hover:bg-sky-500/20'
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
                  Hoặc tự nhập Package Name của bất kỳ ứng dụng nào khác:
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
                  placeholder="Nhập package bất kỳ (VD: org.videolan.vlc, com.brave.browser...)"
                  className="w-full px-3.5 py-2 text-xs font-mono bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
                <div className="text-[11px] text-slate-400 font-mono">
                  Giao thức dịch tự động: {activeRoute.nativeSchemeExample} · App mặc định:{' '}
                  {activeRoute.officialPackage}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE MULTI-PLATFORM TRANSLATOR & ANDROID WALLPAPER SIMULATOR */}
        <section id="intent-simulator" className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                02. Bàn thử nghiệm Tự động Dịch Link &amp; Mô phỏng Giao diện Hình nền Android
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Thử nghiệm trực tiếp đường dẫn <strong>YouTube Music</strong>,{' '}
                <strong>YouTube Video</strong>, <strong>Spotify</strong>, <strong>Facebook</strong>{' '}
                và xem trước giao diện Compose có hình nền đồ họa đa lớp.
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
                MainActivity (Có Hình nền)
              </button>
              <button
                onClick={() => setSimPhoneScreen('router_fallback')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'router_fallback'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Router Fallback Sheet
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
            {/* Left column: Multi-Platform Link Translator Inspector */}
            <div className="lg:col-span-7 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Bộ dịch tự động URL -&gt; Ứng dụng đích (YouTube Music, Spotify, FB, MXH)
                  </h3>
                  <span className="text-xs font-mono text-emerald-300">
                    Auto-Translate Engine
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Dán đường dẫn bất kỳ hoặc chọn mẫu bên dưới để kiểm tra:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simUrlInput}
                      onChange={(e) => setSimUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      placeholder="https://music.youtube.com/watch?v=..."
                    />
                    <button
                      onClick={triggerSimulateRouter}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Dịch &amp; Mở App Đích</span>
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

                {/* Translation Result Table */}
                <div className="bg-slate-900/90 border border-white/10 rounded-lg divide-y divide-white/10 text-xs">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Dịch vụ nhận diện tự động</span>
                    <span className="font-mono font-semibold text-emerald-300">
                      {parsedPreview.serviceTitle} ({parsedPreview.linkType})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Trạng thái luồng (Chống đụng hàng)</span>
                    <span
                      className={`font-mono font-semibold ${
                        matchedRouteConfig.enabled ? 'text-emerald-400' : 'text-amber-300'
                      }`}
                    >
                      {matchedRouteConfig.enabled
                        ? `ĐANG BẬT (${matchedRouteConfig.aliasName})`
                        : 'ĐÃ TẮT (Nhường quyền cho App sẵn có)'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Package Đích sẽ mở</span>
                    <span className="font-mono font-semibold text-white truncate">
                      {matchedRouteConfig.enabled
                        ? matchedRouteConfig.targetPackage
                        : `${matchedRouteConfig.officialPackage} (Hệ thống)`}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-400 shrink-0">
                      Native Deep-Link URI đã dịch
                    </span>
                    <span className="font-mono text-emerald-300 truncate">
                      {parsedPreview.nativeSchemeUri || parsedPreview.normalizedHttpsUrl || 'N/A'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">App Mặc định dự phòng (Fallback)</span>
                    <span className="font-mono text-sky-300">
                      {matchedRouteConfig.officialPackage}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Giả lập trạng thái cài đặt gói đích trên điện thoại
                    </div>
                    <div className="text-xs text-slate-400">
                      Kiểm tra cách ứng dụng tự lùi về App Mặc định hoặc mở hộp chọn khi chưa cài Mod.
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
                      ? `Đã cài ${matchedRouteConfig.targetPackage}`
                      : `Chưa cài ${matchedRouteConfig.targetPackage}`}
                  </button>
                </div>

                {simLastDispatchedToast && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-slate-900 border border-white/10 text-xs font-mono text-emerald-300 flex items-center justify-between gap-2">
                    <span className="truncate">{simLastDispatchedToast}</span>
                    <span className="text-slate-500 shrink-0">Intent Log</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Android 14 Compose Simulator WITH Atmospheric Wallpaper */}
            <div
              className={`lg:col-span-5 rounded-xl border border-white/20 p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b ${currentThemeObj.bgGradient}`}
            >
              {/* Simulated Phone Canvas Waveform Overlay */}
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
                <path
                  d="M0 250 C 140 180, 260 320, 400 230"
                  stroke={currentThemeObj.waveStroke}
                  strokeWidth="1.5"
                />
              </svg>

              {/* Status Bar */}
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300 pb-3 border-b border-white/15">
                <span>Android 14 · {currentThemeObj.label}</span>
                <span>{simPhoneScreen === 'main_activity' ? 'MainActivity.kt' : 'RouterActivity.kt'}</span>
              </div>

              {/* Screen 1: MainActivity with Wallpaper & Multi-Route Cards */}
              {simPhoneScreen === 'main_activity' && (
                <div className="relative z-10 py-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-base font-bold text-white">{config.appName}</div>
                        <div className="text-[11px] text-slate-300">
                          Điều hướng YouTube, YT Music, Spotify &amp; MXH
                        </div>
                      </div>
                      <button
                        onClick={handleDisableConflictingNonYoutubeRoutes}
                        className="px-2 py-1 text-[10px] font-medium bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded cursor-pointer whitespace-nowrap shrink-0"
                      >
                        Chống đụng hàng
                      </button>
                    </div>

                    {/* Route List inside Phone Preview */}
                    <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                      {(Object.values(config.routes) as RouteRuleConfig[]).map((route, idx) => (
                        <div
                          key={route.id}
                          className={`p-3 rounded-lg border backdrop-blur-md transition-all ${
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

                          {route.enabled && (
                            <div className="mt-2 space-y-1.5">
                              <div className="flex flex-wrap gap-1">
                                {route.presets.slice(0, 3).map((p) => (
                                  <button
                                    key={p.pkg}
                                    type="button"
                                    onClick={() =>
                                      updateRoute(route.id, (r) => ({
                                        ...r,
                                        targetPackage: p.pkg,
                                      }))
                                    }
                                    className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer whitespace-nowrap shrink-0 ${
                                      route.targetPackage === p.pkg
                                        ? 'bg-emerald-400/25 text-emerald-200 border border-emerald-400/40'
                                        : 'bg-slate-900/90 text-slate-400'
                                    }`}
                                  >
                                    {p.label}
                                  </button>
                                ))}
                              </div>
                              <div className="px-2 py-1 rounded bg-slate-900/90 border border-white/10 font-mono text-[11px] text-emerald-300 truncate">
                                Đích: {route.targetPackage}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/15">
                    <button
                      onClick={() => setSimPhoneScreen('system_open_by_default')}
                      className="w-full py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Mở cài đặt &apos;Mở theo mặc định&apos; (Open by default)
                    </button>
                  </div>
                </div>
              )}

              {/* Screen 2: RouterActivity Instant Dispatch Success */}
              {simPhoneScreen === 'router_success' && (
                <div className="relative z-10 py-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 bg-slate-950/80 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="text-xs font-mono text-emerald-400">
                      RouterActivity -&gt; {parsedPreview.serviceTitle}
                    </div>
                    <h4 className="text-base font-bold text-white">
                      {matchedRouteConfig.enabled
                        ? `Đã tự động dịch & mở ${matchedRouteConfig.targetPackage}`
                        : `Luồng đã tắt -> Mở thẳng bằng ${matchedRouteConfig.officialPackage}`}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Liên kết <code className="font-mono text-emerald-300">{parsedPreview.host}</code>{' '}
                      được nhận diện thuộc nhóm <strong>{parsedPreview.serviceTitle}</strong> và
                      chuyển hướng thẳng tới ứng dụng đích trong vài mili-giây.
                    </p>
                    <div className="p-3 rounded-lg bg-slate-900 border border-white/10 font-mono text-[11px] space-y-1">
                      <div className="text-emerald-300 truncate">
                        URI: {parsedPreview.nativeSchemeUri || parsedPreview.normalizedHttpsUrl}
                      </div>
                      <div className="text-slate-200">
                        Target Package: {matchedRouteConfig.targetPackage}
                      </div>
                      <div className="text-slate-400">
                        Fallback Official: {matchedRouteConfig.officialPackage}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('main_activity')}
                    className="w-full py-2 text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-white/15 transition-colors cursor-pointer"
                  >
                    Quay lại màn hình chính
                  </button>
                </div>
              )}

              {/* Screen 3: RouterActivity Fallback ModalBottomSheet */}
              {simPhoneScreen === 'router_fallback' && (
                <div className="relative z-10 py-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="text-xs text-slate-300">
                    Khi chưa cài gói đích và tắt tự động chuyển sang App mặc định:
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/95 border border-white/20 space-y-3">
                    <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto" />
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Chọn ứng dụng mở ({parsedPreview.serviceTitle})</span>
                    </div>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => setSimPhoneScreen('router_success')}
                        className="w-full py-2 text-xs font-semibold bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                      >
                        Mở bằng App Mặc định ({matchedRouteConfig.officialPackage})
                      </button>
                      <button
                        onClick={() => setSimPhoneScreen('router_success')}
                        className="w-full py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Mở qua Trình duyệt web
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => {
                          updateRoute(parsedPreview.serviceId, (r) => ({ ...r, enabled: false }));
                          setSimPhoneScreen('main_activity');
                        }}
                        className="text-amber-300 hover:underline cursor-pointer"
                      >
                        Tắt luôn luồng này (Tránh đụng hàng)
                      </button>
                      <button
                        onClick={() => setSimPhoneScreen('main_activity')}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Screen 4: System Open By Default */}
              {simPhoneScreen === 'system_open_by_default' && (
                <div className="relative z-10 py-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="text-sm font-bold text-white">
                      Mở theo mặc định (Chỉ hiện các luồng đang BẬT)
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Nhờ sử dụng <code className="font-mono">&lt;activity-alias&gt;</code>, những
                      dịch vụ bạn đã TẮT sẽ tự động biến mất khỏi danh sách tranh chấp tên miền của
                      Android:
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
                              r.enabled ? 'text-emerald-400' : 'text-slate-500 line-through'
                            }`}
                          >
                            {r.enabled ? 'Đang nhận link' : 'Đã gỡ bộ lọc'}
                          </span>
                        </div>
                      ))}
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
                03. Trọn bộ Mã nguồn Android Native (Đã cập nhật Đa nền tảng &amp; Hình nền)
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Mọi thay đổi về Hình nền, Package đích (Mod / Mặc định / Tùy chỉnh) và trạng thái
                Bật/Tắt từng luồng ở trên đều được cập nhật trực tiếp vào mã nguồn bên dưới.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-white/15 rounded-lg self-start">
              {(
                [
                  { id: 'all', label: `Tất cả (${projectFiles.length})` },
                  { id: 'core', label: 'Mã nguồn cốt lõi (3)' },
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
            <div className="text-xs font-mono text-emerald-400">01. Tách riêng YouTube Music</div>
            <h3 className="text-base font-bold text-white">
              Điều hướng chuẩn xác music.youtube.com
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Thay vì gộp chung vào YouTube thường khiến link nhạc bị mở nhầm bằng app video,{' '}
              <code className="font-mono">RouteYoutubeMusicAlias</code> và{' '}
              <code className="font-mono">RouterActivity.kt</code> tách riêng tên miền{' '}
              <code className="font-mono">music.youtube.com</code> để bắn thẳng sang{' '}
              <strong>YouTube Music Mod</strong> (<code className="font-mono">app.rvx.android.apps.youtube.music</code>)
              hoặc <strong>YouTube Music Mặc định</strong> (<code className="font-mono">com.google.android.apps.youtube.music</code>).
            </p>
          </div>

          <div className="bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-emerald-400">02. Chống đụng hàng tuyệt đối</div>
            <h3 className="text-base font-bold text-white">
              Bật / Tắt từng dịch vụ bằng Activity-Alias
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Mỗi nền tảng (YouTube, YT Music, Spotify, Facebook, MXH) nằm trong một{' '}
              <code className="font-mono">&lt;activity-alias&gt;</code> riêng. Khi bạn tắt một dịch
              vụ trong ứng dụng vì máy đã có sẵn app chuẩn, lệnh{' '}
              <code className="font-mono">setComponentEnabledSetting(..., DISABLED)</code> sẽ gỡ
              hẳn bộ lọc đó khỏi Android để không bao giờ bị đụng hàng.
            </p>
          </div>

          <div className="bg-slate-950/75 backdrop-blur-md border border-white/15 rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-emerald-400">03. Tự động dịch Deep-Link</div>
            <h3 className="text-base font-bold text-white">
              Hỗ trợ cả App Mod, App Mặc định &amp; App Tùy ý
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bất kể bạn chọn bản Mod, bản Mặc định chính thức hay tự gõ Package Name của một ứng
              dụng bất kỳ, <code className="font-mono">RouterActivity</code> đều tự động dịch link
              web sang giao thức tương ứng (<code className="font-mono">vnd.youtube</code>,{' '}
              <code className="font-mono">spotify:track:</code>,{' '}
              <code className="font-mono">fb://facewebmodal</code>) và đi thẳng tới đích.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-slate-400 bg-[#050811]/80 backdrop-blur-sm">
        Link Dispatcher Multi-Platform Android Native · Kotlin 2.0 + Jetpack Compose Material 3
      </footer>
    </div>
  );
}
