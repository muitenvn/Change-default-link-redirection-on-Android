import React, { useMemo, useState } from 'react';
import JSZip from 'jszip';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode,
  FolderGit2,
  Play,
  Settings,
  Smartphone,
  Terminal,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  generateAndroidProjectFiles,
  parseYoutubeInputForPreview,
  ProjectConfig,
} from './data/androidProjectTemplate';

const PRESET_PACKAGES = [
  { label: 'YouTube Morphe', pkg: 'app.morphe.android.youtube' },
  { label: 'YouTube ReVanced', pkg: 'app.revanced.android.youtube' },
  { label: 'RVX YouTube', pkg: 'app.rvx.android.youtube' },
  { label: 'RVX Music', pkg: 'app.rvx.android.apps.youtube.music' },
];

const SAMPLE_LINKS = [
  {
    label: 'Watch + Playlist',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLFgquLnL59alCl_2TQvOiD5Vgm1hCaGSI&t=42',
  },
  {
    label: 'Shortlink youtu.be',
    url: 'https://youtu.be/dQw4w9WgXcQ?t=85',
  },
  {
    label: 'YouTube Shorts',
    url: 'https://m.youtube.com/shorts/5qap5aO4i9A',
  },
  {
    label: 'YouTube Live',
    url: 'https://www.youtube.com/live/jfKfPfyJRdk',
  },
  {
    label: 'Tin nhắn Share từ Zalo',
    url: 'Xem video này nhé: https://youtu.be/9bZkp7q19f0?t=15 cực hay!',
  },
];

export default function App() {
  const [config, setConfig] = useState<ProjectConfig>({
    appName: 'Link Dispatcher',
    applicationId: 'com.example.linkdispatcher',
    defaultTargetPackage: 'app.morphe.android.youtube',
    compileSdk: 34,
    minSdk: 26,
    targetSdk: 34,
    preferVndSchemeDefault: false,
    intentPriority: 999,
  });

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
  const [simDispatchCount, setSimDispatchCount] = useState<number>(14);
  const [simLastDispatchedToast, setSimLastDispatchedToast] = useState<string | null>(null);
  const [verifiedDomains, setVerifiedDomains] = useState<Record<string, boolean>>({
    'youtube.com': true,
    'm.youtube.com': true,
    'youtu.be': true,
    'www.youtube.com': true,
    'music.youtube.com': true,
  });

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

  const handleCopyCode = async (content: string, pathKey: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPath(pathKey);
      setTimeout(() => setCopiedPath(null), 1800);
    } catch {
      // Ignore clipboard failures in restricted environments
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
        `# ${config.appName} (Android Native Kotlin + Jetpack Compose)\n\n` +
          `Ứng dụng trung gian (Link Dispatcher / Router) đón bắt toàn bộ liên kết YouTube và chuyển tiếp sang \`${config.defaultTargetPackage}\`.\n\n` +
          `## Cách build APK tự động trên GitHub\n` +
          `1. Tạo một Repository mới trên GitHub và đẩy toàn bộ các file trong thư mục này lên nhánh \`main\`.\n` +
          `2. Vào tab **Actions** trên GitHub -> Workflow **Build & Release Android APK** sẽ tự động chạy.\n` +
          `3. Sau khoảng 2 phút, tải file \`app-debug.apk\` trong mục **Releases** hoặc **Artifacts** về điện thoại.\n`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'LinkDispatcher-Android-Native-Repo.zip';
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
    if (simTargetPackageInstalled) {
      setSimPhoneScreen('router_success');
      const targetUri =
        config.preferVndSchemeDefault && parsedPreview.vndYoutubeUri
          ? parsedPreview.vndYoutubeUri
          : parsedPreview.normalizedHttpsUrl || simUrlInput;
      setSimLastDispatchedToast(
        `startActivity(ACTION_VIEW, "${targetUri}") -> ${config.defaultTargetPackage} · finish() trong 4ms`
      );
    } else {
      setSimPhoneScreen('router_fallback');
      setSimLastDispatchedToast(
        `ActivityNotFoundException(${config.defaultTargetPackage}) -> Hiển thị Compose FallbackBottomSheet`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/90 bg-[#090d16]/95 sticky top-0 z-30">
        <a
          href="#top"
          className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          Link Dispatcher Studio
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <a
            href="#source-workspace"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Mã nguồn &amp; Cấu hình
          </a>
          <a
            href="#intent-simulator"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Mô phỏng Router &amp; Compose UI
          </a>
          <a
            href="#architecture-guide"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Cơ chế Hoạt động
          </a>
          <a
            href="#github-ci"
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
        {/* Hero & Quick Customizer Bar */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-b border-slate-800/80 pb-10">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                <span>Kotlin 2.0.20</span>
                <span aria-hidden="true">·</span>
                <span>Jetpack Compose Material 3</span>
                <span aria-hidden="true">·</span>
                <span>CompileSDK {config.compileSdk}</span>
                <span aria-hidden="true">·</span>
                <span>GitHub Actions CI/CD</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Mã nguồn hoàn chỉnh ứng dụng trung gian Link Dispatcher cho Android Native
              </h1>
              <p className="text-slate-300 text-base leading-relaxed max-w-2xl">
                Đón bắt toàn bộ liên kết{' '}
                <code className="text-emerald-300 font-mono text-sm">youtube.com</code>,{' '}
                <code className="text-emerald-300 font-mono text-sm">m.youtube.com</code>,{' '}
                <code className="text-emerald-300 font-mono text-sm">youtu.be</code>,{' '}
                <code className="text-emerald-300 font-mono text-sm">music.youtube.com</code> với{' '}
                <code className="text-emerald-300 font-mono text-sm">
                  android:autoVerify=&quot;true&quot;
                </code>{' '}
                và{' '}
                <code className="text-emerald-300 font-mono text-sm">
                  android:priority=&quot;999&quot;
                </code>
                . Tự động bóc tách Video ID / Playlist ID, chuyển tiếp tức thì trong vài mili-giây
                sang bản YouTube Mod (<code className="text-emerald-300 font-mono text-sm">{config.defaultTargetPackage}</code>)
                và gọi <code className="text-emerald-300 font-mono text-sm">finish()</code> không để
                lại vết trên ngăn xếp tác vụ.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <div className="text-xs text-slate-400">Độ trễ RouterActivity</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                  &lt; 5 ms
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Priority Intent Filter</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                  {config.intentPriority}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Hỗ trợ Custom Scheme</div>
                <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums mt-0.5">
                  vnd.youtube:&lt;id&gt;
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Tổng số file cấu hình</div>
                <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
                  {projectFiles.length} files
                </div>
              </div>
            </div>
          </div>

          {/* Live Project Parameter Customizer */}
          <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Tùy biến thông số dự án (Cập nhật trực tiếp vào mã nguồn)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Thay đổi Package đích mặc định hoặc Application ID trước khi sao chép hoặc tải file
                ZIP.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">
                  Package Name ứng dụng Mod đích mặc định (DEFAULT_TARGET_PACKAGE)
                </label>
                <input
                  type="text"
                  value={config.defaultTargetPackage}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, defaultTargetPackage: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {PRESET_PACKAGES.map((item) => (
                    <button
                      key={item.pkg}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, defaultTargetPackage: item.pkg }))
                      }
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        config.defaultTargetPackage === item.pkg
                          ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40 font-medium'
                          : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">
                    Application ID (Namespace)
                  </label>
                  <input
                    type="text"
                    value={config.applicationId}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        applicationId: e.target.value.trim() || 'com.example.linkdispatcher',
                      }))
                    }
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">Tên hiển thị ứng dụng</label>
                  <input
                    type="text"
                    value={config.appName}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        appName: e.target.value || 'Link Dispatcher',
                      }))
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div>
                  <div className="text-xs font-medium text-slate-200">
                    Mặc định bật scheme <code className="font-mono">vnd.youtube:&lt;id&gt;</code>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Có thể bật/tắt lại bất kỳ lúc nào ngay trong MainActivity
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      preferVndSchemeDefault: !prev.preferVndSchemeDefault,
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    config.preferVndSchemeDefault
                      ? 'bg-emerald-400 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {config.preferVndSchemeDefault ? 'Đang BẬT (true)' : 'Đang TẮT (false)'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: SOURCE CODE EXPLORER */}
        <section id="source-workspace" className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                01. Trọn bộ Mã nguồn &amp; Cấu hình Dự án Android Native
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Chọn từng file bên trái để xem chi tiết, sao chép nhanh hoặc tải xuống từng file.
              </p>
            </div>

            {/* Interactive Segmented Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start">
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
            {/* File Tree Sidebar */}
            <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Cây thư mục Repository</span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {filteredFiles.length} files
                </span>
              </div>
              <div className="divide-y divide-slate-800/60">
                {filteredFiles.map((file) => {
                  const isSelected = activeFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFilePath(file.path)}
                      className={`w-full text-left px-4 py-3 transition-colors flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500/10 text-white'
                          : 'hover:bg-slate-800/50 text-slate-300'
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

            {/* Active Code Viewer */}
            <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/50">
                <div className="min-w-0">
                  <div className="text-xs font-mono font-semibold text-emerald-300 truncate">
                    {activeFile.path}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{activeFile.description}</p>
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

              <div className="p-5 overflow-x-auto max-h-[640px] overflow-y-auto bg-[#070a12]">
                <pre className="text-xs font-mono leading-relaxed text-slate-200 select-all">
                  <code>{activeFile.content}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE INTENT PARSER & COMPOSE MATERIAL 3 SIMULATOR */}
        <section id="intent-simulator" className="space-y-6 pt-6 border-t border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                02. Bàn thử nghiệm Bóc tách URL &amp; Mô phỏng Giao diện Compose Material 3
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Kiểm tra trực tiếp thuật toán phân tích URL của{' '}
                <code className="font-mono text-slate-200">RouterActivity.kt</code> và tương tác
                với màn hình <code className="font-mono text-slate-200">MainActivity.kt</code> cũng
                như <code className="font-mono text-slate-200">FallbackBottomSheet</code>.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start">
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
                onClick={() => setSimPhoneScreen('router_fallback')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  simPhoneScreen === 'router_fallback'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Router Fallback BottomSheet
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
            {/* Left column: URL Extractor & Intent Inspector */}
            <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">
                    Bộ kiểm tra Intent đầu vào (Zalo, Messenger, Trình duyệt)
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    ACTION_VIEW &amp; ACTION_SEND
                  </span>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1.5">
                    Nhập URL YouTube hoặc đoạn văn bản chia sẻ có chứa link:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={simUrlInput}
                      onChange={(e) => setSimUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-emerald-400"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <button
                      onClick={triggerSimulateRouter}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Bắn thử Intent</span>
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
                            ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sample.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parsed Output Table */}
                <div className="bg-slate-950/90 border border-slate-800/90 rounded-lg divide-y divide-slate-800/70 text-xs">
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Phân loại đường dẫn (linkType)</span>
                    <span className="font-mono font-semibold text-emerald-300">
                      {parsedPreview.linkType} · Host: {parsedPreview.host || 'N/A'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between gap-4">
                    <span className="text-slate-400 shrink-0">URL HTTPS chuẩn hóa</span>
                    <span className="font-mono text-slate-200 truncate">
                      {parsedPreview.normalizedHttpsUrl || 'Không hợp lệ'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Video ID bóc tách (?v= / shorts / youtu.be)</span>
                    <span className="font-mono font-semibold text-white">
                      {parsedPreview.videoId || 'null'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Playlist ID (?list=...)</span>
                    <span className="font-mono text-slate-200">
                      {parsedPreview.playlistId || 'null'}
                    </span>
                  </div>
                  <div className="px-4 py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Custom Scheme URI (vnd.youtube)</span>
                    <span className="font-mono text-emerald-300">
                      {parsedPreview.vndYoutubeUri || 'null (Dùng URL https)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated Device Condition Switch */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-white">
                      Giả lập trạng thái cài đặt của gói đích trên máy Android
                    </div>
                    <div className="text-xs text-slate-400">
                      Thử tắt đi để xem cơ chế Fallback ModalBottomSheet của RouterActivity hoạt động.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !simTargetPackageInstalled;
                      setSimTargetPackageInstalled(next);
                      setSimPhoneScreen(next ? 'main_activity' : 'router_fallback');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      simTargetPackageInstalled
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {simTargetPackageInstalled
                      ? `Đã cài đặt ${config.defaultTargetPackage}`
                      : `Chưa cài ${config.defaultTargetPackage} (Test Fallback)`}
                  </button>
                </div>

                {simLastDispatchedToast && (
                  <div className="px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 flex items-center justify-between gap-2">
                    <span className="truncate">{simLastDispatchedToast}</span>
                    <span className="text-slate-500 shrink-0">Logcat</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Interactive Android 14 Compose Material 3 Preview */}
            <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              {/* Android Status Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-3 border-b border-slate-800">
                <span>Android 14 · API 34</span>
                <span>
                  {simPhoneScreen === 'main_activity' && 'MainActivity.kt'}
                  {simPhoneScreen === 'router_success' && 'RouterActivity -> Target Mod App'}
                  {simPhoneScreen === 'router_fallback' && 'RouterActivity (FallbackBottomSheet)'}
                  {simPhoneScreen === 'system_open_by_default' &&
                    'Settings.ACTION_APP_OPEN_BY_DEFAULT_SETTINGS'}
                </span>
              </div>

              {/* Screen 1: MainActivity Compose Material 3 */}
              {simPhoneScreen === 'main_activity' && (
                <div className="py-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="text-base font-bold text-white">{config.appName}</div>
                      <div className="text-xs text-slate-400">
                        Router trung gian chuyển hướng liên kết YouTube
                      </div>
                    </div>

                    {/* Card 1 */}
                    <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2.5">
                      <div className="text-xs font-semibold text-white">
                        1. Package Name ứng dụng đích
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_PACKAGES.slice(0, 3).map((p) => (
                          <button
                            key={p.pkg}
                            onClick={() =>
                              setConfig((prev) => ({ ...prev, defaultTargetPackage: p.pkg }))
                            }
                            className={`px-2 py-1 text-[11px] rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              config.defaultTargetPackage === p.pkg
                                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/40'
                                : 'bg-slate-900 text-slate-400'
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                      <div className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200">
                        {config.defaultTargetPackage}
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={
                            simTargetPackageInstalled ? 'text-emerald-400' : 'text-rose-400'
                          }
                        >
                          {simTargetPackageInstalled
                            ? 'Trạng thái: Đã cài đặt trên thiết bị'
                            : 'Chưa phát hiện package này'}
                        </span>
                        <span className="font-mono text-slate-400">
                          vnd.youtube: {config.preferVndSchemeDefault ? 'ON' : 'OFF'}
                        </span>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-white">
                        2. Cấp quyền &apos;Mở theo mặc định&apos;
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Mở trực tiếp Settings.ACTION_APP_OPEN_BY_DEFAULT_SETTINGS để bật xác thực
                        tên miền YouTube.
                      </p>
                      <button
                        onClick={() => setSimPhoneScreen('system_open_by_default')}
                        className="w-full py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Mở màn hình &apos;Mở theo mặc định&apos; của hệ thống
                      </button>
                    </div>

                    {/* Card 3 */}
                    <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-white">
                        3. Kiểm tra nhanh Intent chuyển hướng
                      </div>
                      <div className="text-[11px] font-mono text-slate-300 truncate bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800">
                        {simUrlInput}
                      </div>
                      <button
                        onClick={triggerSimulateRouter}
                        className="w-full py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-lg transition-colors cursor-pointer"
                      >
                        Bắn thử Intent qua RouterActivity
                      </button>
                      <div className="text-[11px] font-mono text-slate-400 pt-1">
                        Đã xử lý: {simDispatchCount} liên kết · Video ID:{' '}
                        {parsedPreview.videoId || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Screen 2: RouterActivity Instant Millisecond Success */}
              {simPhoneScreen === 'router_success' && (
                <div className="py-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-emerald-400">
                      RouterActivity (Theme.Translucent.NoTitleBar) -&gt; finish()
                    </div>
                    <h4 className="text-base font-bold text-white">
                      Đã chuyển hướng tức thì sang {config.defaultTargetPackage}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Vì gói đích đã được cài đặt trên máy,{' '}
                      <code className="font-mono text-emerald-300">RouterActivity</code> hoàn tất
                      chuyển tiếp trong vài mili-giây và tự hủy ngay bằng{' '}
                      <code className="font-mono text-emerald-300">finish()</code>. Người dùng được
                      đưa thẳng vào màn hình phát video của bản YouTube Mod.
                    </p>

                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-xs">
                      <div className="text-slate-400">Intent Action: android.intent.action.VIEW</div>
                      <div className="text-emerald-300 truncate">
                        Data:{' '}
                        {config.preferVndSchemeDefault && parsedPreview.vndYoutubeUri
                          ? parsedPreview.vndYoutubeUri
                          : parsedPreview.normalizedHttpsUrl}
                      </div>
                      <div className="text-slate-200">
                        Package: {config.defaultTargetPackage}
                      </div>
                      <div className="text-slate-400">
                        Flags: FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TOP
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('main_activity')}
                    className="w-full py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Quay lại màn hình MainActivity
                  </button>
                </div>
              )}

              {/* Screen 3: RouterActivity Fallback ModalBottomSheet */}
              {simPhoneScreen === 'router_fallback' && (
                <div className="py-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="text-xs text-slate-400">
                    Nền trong suốt (Theme.Translucent.NoTitleBar) · Hiển thị ModalBottomSheet:
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto" />
                    <div className="text-sm font-bold text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Không tìm thấy ứng dụng đích</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Gói cấu hình <code className="font-mono text-slate-200">&quot;{config.defaultTargetPackage}&quot;</code> hiện chưa được cài đặt trên thiết bị.
                    </p>

                    <div className="p-2.5 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
                      <div className="text-slate-300 truncate">
                        URL: {parsedPreview.normalizedHttpsUrl || simUrlInput}
                      </div>
                      {parsedPreview.videoId && (
                        <div className="text-emerald-300">
                          Video ID: {parsedPreview.videoId} · vnd.youtube:{parsedPreview.videoId}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="text-[11px] text-slate-400">
                        Ứng dụng tương thích phát hiện trên máy:
                      </div>
                      <button
                        onClick={() => {
                          setSimTargetPackageInstalled(true);
                          setSimPhoneScreen('router_success');
                        }}
                        className="w-full py-2 text-xs font-semibold bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Mở bằng app.revanced.android.youtube
                      </button>
                      {parsedPreview.videoId && (
                        <button
                          onClick={() => setSimPhoneScreen('router_success')}
                          className="w-full py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Mở qua giao thức vnd.youtube:{parsedPreview.videoId}
                        </button>
                      )}
                      <button
                        onClick={() => setSimPhoneScreen('router_success')}
                        className="w-full py-1.5 text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Mở qua Trình duyệt hoặc Bộ chọn hệ thống
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <button
                        onClick={() => setSimPhoneScreen('main_activity')}
                        className="text-indigo-300 hover:underline cursor-pointer"
                      >
                        Đổi Package đích
                      </button>
                      <button
                        onClick={() => setSimPhoneScreen('main_activity')}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        Đóng (finish)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Screen 4: System Open By Default Settings */}
              {simPhoneScreen === 'system_open_by_default' && (
                <div className="py-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-bold text-white">
                        Mở theo mặc định (Open by default)
                      </div>
                      <div className="text-xs text-slate-400">
                        {config.appName} · {config.applicationId}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-200">
                        Mở đường liên kết được hỗ trợ
                      </span>
                      <span className="text-xs font-mono text-emerald-400">ĐANG BẬT</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                      <div className="text-xs font-medium text-slate-300">
                        Các đường liên kết cần tích chọn (5 miền trong AndroidManifest.xml):
                      </div>
                      {Object.entries(verifiedDomains).map(([domain, checked]) => (
                        <label
                          key={domain}
                          className="flex items-center justify-between text-xs py-1 cursor-pointer"
                        >
                          <span className="font-mono text-slate-200">{domain}</span>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setVerifiedDomains((prev) => ({
                                ...prev,
                                [domain]: !prev[domain],
                              }))
                            }
                            className="accent-emerald-400"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSimPhoneScreen('main_activity')}
                    className="w-full py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Hoàn tất &amp; Quay lại {config.appName}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 3: ARCHITECTURAL BREAKDOWN & GITHUB ACTIONS GUIDE */}
        <section
          id="architecture-guide"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80"
        >
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="text-xs font-mono text-emerald-400">01. AndroidManifest.xml</div>
            <h3 className="text-base font-bold text-white">
              Tại sao dùng Theme.Translucent.NoTitleBar kết hợp finish()?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nếu dùng <code className="font-mono">Theme.NoDisplay</code>, Android sẽ ném ngoại lệ{' '}
              <code className="font-mono">IllegalStateException</code> khi ứng dụng cần hiển thị{' '}
              <code className="font-mono">ModalBottomSheet</code> hoặc <code className="font-mono">Dialog</code>{' '}
              lúc chưa cài app Mod. Với{' '}
              <code className="font-mono">Theme.Translucent.NoTitleBar</code>, khi tìm thấy app Mod,{' '}
              <code className="font-mono">RouterActivity</code> bắn Intent và gọi{' '}
              <code className="font-mono">finish()</code> ngay trong <code className="font-mono">onCreate</code>{' '}
              (tức thì, hoàn toàn vô hình); khi lỗi mới vẽ Compose BottomSheet.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="text-xs font-mono text-emerald-400">02. Package Visibility API 30+</div>
            <h3 className="text-base font-bold text-white">
              Tuân thủ thẻ &lt;queries&gt; từ Android 11 trở lên
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Từ Android 11 (API 30), hàm{' '}
              <code className="font-mono">packageManager.getPackageInfo()</code> sẽ luôn báo không
              tìm thấy gói ứng dụng khác trừ khi khai báo tường minh trong thẻ{' '}
              <code className="font-mono">&lt;queries&gt;</code>. File{' '}
              <code className="font-mono">AndroidManifest.xml</code> đã khai báo sẵn các gói{' '}
              <code className="font-mono">app.morphe.android.youtube</code>,{' '}
              <code className="font-mono">app.revanced.android.youtube</code> cùng intent{' '}
              <code className="font-mono">https</code> và <code className="font-mono">vnd.youtube</code>.
            </p>
          </div>

          <div id="github-ci" className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 space-y-2.5">
            <div className="text-xs font-mono text-emerald-400">03. GitHub Actions CI/CD</div>
            <h3 className="text-base font-bold text-white">
              Tự động khởi tạo Gradle Wrapper &amp; Xuất APK Release
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Workflow <code className="font-mono">.github/workflows/build-apk.yml</code> tự động
              kiểm tra nếu bạn chỉ tải các file văn bản lên qua giao diện web GitHub (thiếu file nhị
              phân <code className="font-mono">gradle-wrapper.jar</code>), máy chủ Ubuntu sẽ tự
              chạy <code className="font-mono">gradle wrapper --gradle-version 8.7</code> trước khi
              gọi <code className="font-mono">./gradlew assembleDebug</code> và đính kèm{' '}
              <code className="font-mono">app-debug.apk</code> vào mục Releases.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        Link Dispatcher Android Native Project · Kotlin 2.0 + Jetpack Compose Material 3 · Sẵn sàng
        để tải lên GitHub &amp; Build APK
      </footer>
    </div>
  );
}
