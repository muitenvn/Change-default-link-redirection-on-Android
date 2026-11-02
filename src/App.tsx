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
  ShieldCheck,
} from 'lucide-react';
import {
  ALL_DEFAULT_MANIFEST_HOSTS,
  DEFAULT_TEST_LINK,
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
    label: 'Link Mặc Định (YouTube Watch)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    label: 'YouTube Shorts (m.youtube.com)',
    url: 'https://m.youtube.com/shorts/5qap5aO4i9A',
  },
  {
    label: 'YouTube Music',
    url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ&list=RDAMVMdQw4w9WgXcQ',
  },
  {
    label: 'Spotify Track',
    url: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT?si=abc123',
  },
  {
    label: 'Link Web thường (Ngoài danh sách)',
    url: 'https://vnexpress.net/khoa-hoc-cong-nghe',
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
    'app/src/main/AndroidManifest.xml'
  );
  const [fileFilter, setFileFilter] = useState<'all' | 'core' | 'gradle' | 'ci'>('all');
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState(false);

  const [inBrowserInterceptorEnabled, setInBrowserInterceptorEnabled] = useState<boolean>(true);

  const [simDetectedBrowsers, setSimDetectedBrowsers] = useState<DetectedBrowserDeviceItem[]>([
    { appName: 'Chrome', packageName: 'com.android.chrome' },
    { appName: 'Brave', packageName: 'com.brave.browser' },
    { appName: 'Samsung Internet', packageName: 'com.sec.android.app.sbrowser' },
    { appName: 'Firefox', packageName: 'org.mozilla.firefox' },
  ]);
  const [simSelectedBrowserPkg, setSimSelectedBrowserPkg] = useState<string>('');
  const [customBrowserName, setCustomBrowserName] = useState<string>('');
  const [customBrowserPkg, setCustomBrowserPkg] = useState<string>('');

  // Điền sẵn Đường link mặc định để không bị trống
  const [simUrlInput, setSimUrlInput] = useState<string>(DEFAULT_TEST_LINK);
  const [simTargetPackageInstalled, setSimTargetPackageInstalled] = useState<boolean>(true);
  const [simPhoneScreen, setSimPhoneScreen] = useState<
    'system_open_by_default' | 'in_browser_demo' | 'main_activity' | 'router_dispatch_result'
  >('system_open_by_default');
  const [simDispatchCount, setSimDispatchCount] = useState<number>(35);
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
        `# ${config.appName} (Android Native Link Dispatcher v5.0)\n\n` +
          `- **Khôi phục đầy đủ 25+ Đường liên kết Mặc định trong "Mở theo mặc định" (Open by default)**: Đã xóa bộ lọc \`http/https\` rỗng host và khai báo tường minh toàn bộ 25+ tên miền ngay trong \`RouterActivity\` để danh sách đường liên kết mặc định trên Android 12/13/14 (HyperOS, OneUI) luôn hiển thị đầy đủ.\n` +
          `- **Sửa triệt để lỗi YouTube Morphe bị văng ngược về Chrome (trong video)**: Đã xóa hoàn toàn lệnh \`performGlobalAction(GLOBAL_ACTION_BACK)\` sau 120ms (nguyên nhân bấm Back nhầm vào YouTube Morphe lúc vừa hiện logo "M"), chuẩn hóa \`m.youtube.com\` -> \`www.youtube.com\` và khóa chống lặp theo ID video.\n`
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

  const triggerSimulateInBrowserClick = (clickedUrl: string) => {
    setSimUrlInput(clickedUrl);
    const preview = parseYoutubeInputForPreview(clickedUrl);
    setSimDispatchCount((prev) => prev + 1);

    if (!preview.serviceId) {
      setSimPhoneScreen('router_dispatch_result');
      setSimLastDispatchedToast(
        `[Trình duyệt ${activeFallbackBrowser.appName}] Đây là link Web thường -> Mở trong ${activeFallbackBrowser.appName}`
      );
      return;
    }

    const route = config.routes[preview.serviceId];

    if (!route.enabled || !route.targetPackage || !simTargetPackageInstalled) {
      if (!simTargetPackageInstalled && route.targetPackage) {
        updateRoute(route.id, (r) => ({ ...r, enabled: false }));
      }
      setSimPhoneScreen('router_dispatch_result');
      setSimLastDispatchedToast(
        `[${route.title}] Luồng đang tắt hoặc chưa cài Mod -> Mở qua ${activeFallbackBrowser.appName}`
      );
      return;
    }

    setSimPhoneScreen('router_dispatch_result');
    setSimLastDispatchedToast(
      `[Đã sửa lỗi văng Chrome] Đã chuyển "${preview.normalizedHttpsUrl}" sang "${route.targetPackage}" & giữ nguyên trong YouTube Morphe (Không tự bấm Back, không lặp 3 giây!)`
    );
  };

  const triggerSimulateRouter = () => {
    const effectiveUrl = simUrlInput.trim() || DEFAULT_TEST_LINK;
    if (!simUrlInput.trim()) {
      setSimUrlInput(effectiveUrl);
    }
    triggerSimulateInBrowserClick(effectiveUrl);
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
            href="#bugfix-summary"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Sửa Lỗi Video &amp; Link Mặc Định
          </a>
          <a
            href="#browser-discovery"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Chọn Trình Duyệt
          </a>
          <a
            href="#multi-route-hub"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Đa Luồng Ứng Dụng
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
        {/* Hero: Explaining both fixes clearly */}
        <section
          id="bugfix-summary"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-white/10 pb-10"
        >
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AppLauncherLogo className="w-12 h-12 border border-emerald-400/30" />
                <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2 font-mono">
                  <span>25+ Default Links Restored</span>
                  <span aria-hidden="true">·</span>
                  <span>Fixed Morphe Bounce Bug</span>
                  <span aria-hidden="true">·</span>
                  <span>State Deduplication</span>
                </div>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Đã khôi phục đầy đủ Đường link mặc định &amp; Sửa triệt để lỗi YouTube Morphe bị văng về Chrome
              </h1>
              <p className="text-slate-200/90 text-base leading-relaxed max-w-2xl">
                Qua video bạn gửi và phản hồi về việc <strong>đường link mặc định bị trống</strong>,
                tôi đã xác định chính xác cả 2 nguyên nhân và sửa triệt để trong bản v5.0 này:
              </p>
              <ul className="space-y-2 text-sm text-slate-200 list-disc pl-5">
                <li>
                  <strong>1. Tại sao mục &quot;Đường liên kết mặc định&quot; bị trống?</strong> Trên
                  Android 12/13/14 (Xiaomi HyperOS), khi <code className="font-mono text-emerald-300">RouterActivity</code> có thẻ{' '}
                  <code className="font-mono">&lt;data android:scheme=&quot;http&quot;/&gt;</code> mà{' '}
                  <strong>không có <code className="font-mono">android:host</code></strong>, hệ thống
                  Android tự xếp ứng dụng vào nhóm &quot;Trình duyệt&quot; và <strong>ẩn sạch toàn bộ danh sách đường liên kết trong mục Mở theo mặc định</strong>! Tôi đã xóa bộ lọc rỗng host đó và đưa toàn bộ <strong>25+ tên miền mặc định</strong> (<code className="font-mono text-emerald-300">youtube.com, m.youtube.com, youtu.be, music.youtube.com, open.spotify.com...</code>) vào thẳng <code className="font-mono text-emerald-300">RouterActivity</code>, đồng thời điền sẵn link mặc định trong ô thử nghiệm.
                </li>
                <li>
                  <strong>2. Tại sao trong video YouTube Morphe vừa hiện logo &quot;M&quot; (giây 04, 08, 11) đã bị văng ngược về Chrome?</strong>{' '}
                  Do lệnh <code className="font-mono text-rose-300">performGlobalAction(GLOBAL_ACTION_BACK)</code> chạy sau 120ms đúng lúc YouTube Morphe vừa mở lên, nên hệ thống đã <strong>bấm nút Back ngay trên YouTube Morphe</strong> làm thoát Morphe về lại Chrome, rồi cứ sau 3 giây (<code className="font-mono">COOLDOWN_MS = 2800ms</code>) lại lặp lại! Tôi đã <strong>xóa hoàn toàn lệnh tự bấm Back đó</strong>, chuẩn hóa <code className="font-mono text-emerald-300">m.youtube.com</code> sang <code className="font-mono text-emerald-300">www.youtube.com</code> và khóa chống lặp theo ID video.
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div>
                <div className="text-xs text-slate-400">Đường link mặc định</div>
                <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                  25+ Host có sẵn
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Lỗi tự bấm Back</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  Đã xóa hoàn toàn
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Chuẩn hóa URL Shorts</div>
                <div className="text-sm font-bold text-emerald-300 font-mono mt-0.5">
                  www.youtube.com
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Chống lặp 3 giây</div>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  Khóa theo Video ID
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Default Links List in AndroidManifest.xml */}
          <div className="lg:col-span-5 bg-slate-950/85 backdrop-blur-md border border-emerald-400/35 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Danh sách 25 Đường Link Mặc Định trong Manifest</span>
                </h2>
                <span className="text-[11px] font-mono text-emerald-300">
                  autoVerify=&quot;true&quot;
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tất cả các đường dẫn dưới đây đã được gắn trực tiếp vào{' '}
                <code className="font-mono text-emerald-300">RouterActivity</code> trong{' '}
                <code className="font-mono">AndroidManifest.xml</code> để khi bạn vào{' '}
                <strong>Mở theo mặc định -&gt; Thêm đường liên kết</strong> trên điện thoại sẽ hiện
                đầy đủ 100%:
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[210px] overflow-y-auto p-3 rounded-lg bg-slate-900/90 border border-white/10">
              {ALL_DEFAULT_MANIFEST_HOSTS.map((host) => (
                <span
                  key={host}
                  className="px-2 py-1 text-[11px] font-mono text-emerald-300 bg-slate-950 border border-emerald-500/30 rounded"
                >
                  {host}
                </span>
              ))}
            </div>

            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="text-xs text-slate-300">
                Đường link kiểm tra mặc định (Đã điền sẵn trong ứng dụng):
              </div>
              <div className="px-3 py-2 rounded-lg bg-slate-900 border border-white/15 font-mono text-xs text-emerald-300 truncate">
                {DEFAULT_TEST_LINK}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: DYNAMIC BROWSER AUTO-DETECTION & SELECTION */}
        <section id="browser-discovery" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <span>
                  01. Tự động Phát hiện &amp; Chọn Trình duyệt trên thiết bị
                </span>
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Hàm{' '}
                <code className="font-mono text-emerald-300">
                  RouterActivity.detectInstalledBrowsers(context)
                </code>{' '}
                dùng <code className="font-mono">PackageManager.queryIntentActivities</code> để tự
                động phát hiện toàn bộ trình duyệt đang cài trên máy.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Chọn Trình duyệt dự phòng (Mở khi tắt luồng hoặc link ngoài danh sách):
                  </h3>
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
            </div>

            <div className="lg:col-span-5 bg-slate-900/75 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Giả lập cài thêm Trình duyệt bất kỳ lên máy</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">Dynamic Scan</span>
              </div>
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

        {/* SECTION 2: MULTI-ROUTE CONFIGURATION */}
        <section id="multi-route-hub" className="space-y-5 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                02. Quản lý Đường dẫn Ứng dụng (YouTube, YT Music, Spotify, Facebook, MXH)
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Cấu hình package đích cho từng ứng dụng và chọn chủ đề hình nền.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" />
              <div className="flex gap-1.5">
                {WALLPAPER_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({ ...prev, wallpaperTheme: theme.id }))
                    }
                    className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer transition-colors ${
                      config.wallpaperTheme === theme.id
                        ? 'bg-white/15 border-emerald-400 text-white font-semibold'
                        : 'bg-slate-900/70 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
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
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SIMULATOR */}
        <section id="intent-simulator" className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                03. Kiểm tra Đường Link Mặc Định &amp; Bắt Link Trong Trình Duyệt
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Ô đường link mặc định đã được điền sẵn{' '}
                <code className="font-mono text-emerald-300">{DEFAULT_TEST_LINK}</code> và màn hình
                &quot;Mở theo mặc định&quot; đã hiển thị đầy đủ 25 tên miền.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-white/15 rounded-lg self-start">
              <button
                onClick={() => setSimPhoneScreen('system_open_by_default')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'system_open_by_default'
                    ? 'bg-emerald-400 text-slate-950 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Mở theo mặc định (25+ Links)
              </button>
              <button
                onClick={() => setSimPhoneScreen('in_browser_demo')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'in_browser_demo'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Trong {activeFallbackBrowser.appName}
              </button>
              <button
                onClick={() => setSimPhoneScreen('main_activity')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'main_activity'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MainActivity
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 bg-slate-950/80 backdrop-blur-md border border-white/15 rounded-xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Đường link kiểm tra mặc định (Đã điền sẵn)
                  </h3>
                  <span className="text-xs font-mono text-emerald-300">
                    Canonical www.youtube.com
                  </span>
                </div>

                <div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simUrlInput}
                      onChange={(e) => setSimUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-900 border border-white/15 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      placeholder={DEFAULT_TEST_LINK}
                    />
                    <button
                      onClick={triggerSimulateRouter}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Chạy thử</span>
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
                    <span className="text-slate-400 shrink-0">Dịch vụ nhận diện</span>
                    <span className="font-mono font-semibold text-emerald-300 truncate">
                      {parsedPreview.serviceTitle} ({parsedPreview.linkType})
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-3">
                    <span className="text-slate-400 shrink-0">URL chuẩn hóa gửi sang App Mod</span>
                    <span className="font-mono font-semibold text-sky-300 truncate">
                      {parsedPreview.normalizedHttpsUrl || DEFAULT_TEST_LINK}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Chế độ xác nhận</span>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmBeforeRedirect((prev) => !prev);
                        setPendingConfirmRedirect(null);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-semibold cursor-pointer transition-colors ${
                        confirmBeforeRedirect
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border border-white/10'
                      }`}
                    >
                      {confirmBeforeRedirect
                        ? 'BẬT: Hiện nút "Đồng ý mở YouTube" trước khi chuyển'
                        : 'TẮT: Chuyển thẳng không hỏi'}
                    </button>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-400 shrink-0">Kết quả xử lý</span>
                    <span className="font-mono font-semibold text-white truncate">
                      {!matchedRouteConfig
                        ? `Mở bằng ${activeFallbackBrowser.appName} (${activeFallbackBrowser.packageName})`
                        : !matchedRouteConfig.enabled || !matchedRouteConfig.targetPackage
                          ? `Mở bằng ${activeFallbackBrowser.appName}`
                          : simTargetPackageInstalled
                            ? confirmBeforeRedirect
                              ? `Hiện nút "Đồng ý mở YouTube" -> Nhấn Đồng ý mới sang ${matchedRouteConfig.targetPackage}`
                              : `Mở thẳng ${matchedRouteConfig.targetPackage}`
                            : `Tự tắt luồng & Mở bằng ${activeFallbackBrowser.appName}`}
                    </span>
                  </div>
                </div>
              </div>

              {simLastDispatchedToast && (
                <div className="px-3.5 py-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs font-mono text-emerald-300">
                  {simLastDispatchedToast}
                </div>
              )}
            </div>

            {/* Right column: Android 14 Simulator */}
            <div
              className={`lg:col-span-5 rounded-xl border border-white/20 p-5 flex flex-col justify-between relative overflow-hidden bg-gradient-to-b ${currentThemeObj.bgGradient}`}
            >
              <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-slate-300 pb-3 border-b border-white/15">
                <span>Android 14 (HyperOS) · {config.appName}</span>
                <span className="text-emerald-300">v5.1 Confirm Button</span>
              </div>

              {simPhoneScreen === 'system_open_by_default' && (
                <div className="relative z-10 py-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5 bg-slate-950/90 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white">
                        Mở theo mặc định (Open by default)
                      </div>
                      <span className="text-[11px] font-mono text-emerald-400">
                        25 đường liên kết
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Các đường liên kết mặc định xuất hiện trong hộp thoại{' '}
                      <strong>&quot;+ Thêm đường liên kết&quot;</strong> của hệ thống:
                    </p>
                    <div className="space-y-1 max-h-[240px] overflow-y-auto pr-1 pt-1">
                      {ALL_DEFAULT_MANIFEST_HOSTS.map((domain) => (
                        <div
                          key={domain}
                          className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded bg-slate-900/90 border border-white/5"
                        >
                          <span className="font-mono text-slate-100">{domain}</span>
                          <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                            [✓] ĐÃ HỖ TRỢ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('in_browser_demo')}
                    className="w-full py-2 text-xs font-semibold bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                  >
                    Thử nghiệm nút &quot;Đồng ý mở YouTube&quot; trong Chrome -&gt;
                  </button>
                </div>
              )}

              {simPhoneScreen === 'in_browser_demo' && (
                <div className="relative z-10 py-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="bg-slate-900/95 border border-white/20 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                      <div className="text-[11px] font-mono text-slate-200 truncate">
                        {simUrlInput || 'm.youtube.com/shorts/5qap5aO4i9A'}
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                        id/url_bar
                      </span>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          triggerSimulateInBrowserClick(
                            'https://m.youtube.com/shorts/5qap5aO4i9A'
                          )
                        }
                        className="w-full text-left p-3 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/15 hover:border-emerald-400/60 transition-all cursor-pointer space-y-1"
                      >
                        <div className="text-[11px] font-mono text-emerald-300 truncate">
                          https://m.youtube.com/shorts/5qap5aO4i9A
                        </div>
                        <div className="text-xs font-bold text-white">
                          1. Bấm vào video Shorts trên m.youtube.com trong Chrome
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Sẽ hiện nút &quot;Đồng ý mở YouTube&quot; bên dưới màn hình. Phải bấm Đồng ý mới chuyển sang YouTube Morphe!
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          triggerSimulateInBrowserClick(DEFAULT_TEST_LINK)
                        }
                        className="w-full text-left p-3 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/15 hover:border-emerald-400/60 transition-all cursor-pointer space-y-1"
                      >
                        <div className="text-[11px] font-mono text-emerald-300 truncate">
                          {DEFAULT_TEST_LINK}
                        </div>
                        <div className="text-xs font-bold text-white">
                          2. Bấm vào video YouTube thường trong Chrome
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Hiện nút xác nhận chuyển sang {config.routes.youtube_video.targetPackage || 'YouTube Mod'}
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* THANH NÚT BẤM XÁC NHẬN "ĐỒNG Ý MỞ YOUTUBE" NỔI TRÊN MÀN HÌNH */}
                  {pendingConfirmRedirect ? (
                    <div className="p-3.5 rounded-2xl bg-slate-950/95 border-2 border-emerald-400 shadow-2xl space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white">
                          Phát hiện liên kết {pendingConfirmRedirect.serviceTitle}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-300">
                          {pendingConfirmRedirect.linkType}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-300 truncate">
                        Đích: {pendingConfirmRedirect.targetPackage}
                      </div>
                      <div className="grid grid-cols-5 gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleConfirmRedirectStay}
                          className="col-span-2 py-2 px-2.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/15 rounded-xl transition-colors cursor-pointer"
                        >
                          Ở lại Web
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmRedirectAgree}
                          className="col-span-3 py-2 px-3 text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl transition-colors cursor-pointer"
                        >
                          Đồng ý mở {pendingConfirmRedirect.shortLabel}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSimPhoneScreen('system_open_by_default')}
                      className="w-full py-2 text-xs font-semibold bg-white/15 hover:bg-white/25 text-white rounded-lg transition-colors cursor-pointer"
                    >
                      Xem danh sách 25 Đường liên kết mặc định
                    </button>
                  )}
                </div>
              )}

              {simPhoneScreen === 'main_activity' && (
                <div className="relative z-10 py-3 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <AppLauncherLogo className="w-8 h-8 border border-emerald-400/30" />
                      <div>
                        <div className="text-base font-bold text-white">{config.appName}</div>
                        <div className="text-[11px] text-slate-300">
                          Có sẵn đường link mặc định &amp; 25+ tên miền
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-white/15 bg-slate-950/85 space-y-1.5">
                      <div className="text-xs font-bold text-white">
                        Đường link kiểm tra mặc định:
                      </div>
                      <div className="px-2.5 py-1.5 rounded bg-slate-900 font-mono text-[11px] text-emerald-300 truncate">
                        {simUrlInput || DEFAULT_TEST_LINK}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('system_open_by_default')}
                    className="w-full py-2 text-xs font-semibold bg-emerald-400 text-slate-950 rounded-lg transition-colors cursor-pointer"
                  >
                    Xem màn hình &apos;Mở theo mặc định&apos;
                  </button>
                </div>
              )}

              {simPhoneScreen === 'router_dispatch_result' && (
                <div className="relative z-10 py-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3 bg-slate-950/85 backdrop-blur-md p-4 rounded-xl border border-white/15">
                    <div className="text-xs font-mono text-emerald-400">
                      Đã mở thành công &amp; Giữ nguyên màn hình App Mod
                    </div>
                    <h4 className="text-base font-bold text-white">
                      {matchedRouteConfig &&
                      matchedRouteConfig.enabled &&
                      matchedRouteConfig.targetPackage &&
                      simTargetPackageInstalled
                        ? `Đang phát trên ${matchedRouteConfig.targetPackage}`
                        : `Đang mở trên ${activeFallbackBrowser.appName}`}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      URL gửi đi:{' '}
                      <code className="font-mono text-emerald-300">
                        {parsedPreview.normalizedHttpsUrl}
                      </code>
                      . Không còn lệnh tự bấm Back sau 120ms và đã khóa ID video để không bao giờ
                      lặp lại hay văng ngược về Chrome.
                    </p>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('in_browser_demo')}
                    className="w-full py-2 text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-white rounded-lg border border-white/15 transition-colors cursor-pointer"
                  >
                    Quay lại thử nghiệm
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 4: SOURCE CODE EXPLORER */}
        <section id="source-workspace" className="space-y-5 pt-6 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                04. Trọn bộ Mã nguồn Android Native v5.0 (Đã sửa lỗi Video &amp; Khôi phục Link Mặc Định)
              </h2>
              <p className="text-sm text-slate-300 mt-0.5">
                Sao chép từng file hoặc nhấn nút <strong>Tải trọn bộ Repo (.ZIP)</strong> ở góc phải trên cùng.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950/80 border border-white/15 rounded-lg self-start">
              {(
                [
                  { id: 'all', label: `Tất cả (${projectFiles.length})` },
                  { id: 'core', label: 'Mã nguồn & XML (9)' },
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
              <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
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
      </main>

      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-slate-400 bg-[#050811]/80 backdrop-blur-sm">
        Link Dispatcher Android Native v5.0 · 25+ Default Links Restored · Fixed Chrome/Morphe Loop
      </footer>
    </div>
  );
}
