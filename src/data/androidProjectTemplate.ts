export type ServiceRouteId =
  | 'youtube_video'
  | 'youtube_music'
  | 'spotify'
  | 'facebook'
  | 'social_media';

export type WallpaperThemeId =
  | 'aurora_emerald'
  | 'crimson_stage'
  | 'cyber_indigo'
  | 'ocean_slate';

export interface RouteRuleConfig {
  id: ServiceRouteId;
  title: string;
  subtitle: string;
  aliasName: string;
  enabled: boolean;
  targetPackage: string;
  domains: string[];
  nativeSchemeExample: string;
  presets: Array<{ label: string; pkg: string }>;
}

export interface DetectedBrowserDeviceItem {
  appName: string;
  packageName: string;
}

export interface ProjectConfig {
  appName: string;
  applicationId: string;
  compileSdk: number;
  minSdk: number;
  targetSdk: number;
  preferNativeSchemeDefault: boolean;
  intentPriority: number;
  wallpaperTheme: WallpaperThemeId;
  routes: Record<ServiceRouteId, RouteRuleConfig>;
}

export interface GeneratedFile {
  path: string;
  title: string;
  language: 'xml' | 'kotlin' | 'gradle' | 'yaml' | 'properties';
  category: 'core' | 'gradle' | 'ci';
  description: string;
  content: string;
}

export interface ParsedMultiPlatformPreview {
  originalInput: string;
  extractedUrl: string | null;
  normalizedHttpsUrl: string | null;
  serviceId: ServiceRouteId | null;
  serviceTitle: string;
  extractedId: string | null;
  playlistId: string | null;
  timestampSeconds: string | null;
  nativeSchemeUri: string | null;
  linkType: string;
  host: string | null;
}

export const DEFAULT_TEST_LINK = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

export const ALL_DEFAULT_MANIFEST_HOSTS: string[] = [
  'youtube.com',
  'm.youtube.com',
  'www.youtube.com',
  'youtu.be',
  'music.youtube.com',
  'open.spotify.com',
  'spotify.link',
  'spoti.fi',
  'facebook.com',
  'www.facebook.com',
  'm.facebook.com',
  'fb.watch',
  'fb.com',
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'instagram.com',
  'www.instagram.com',
  'threads.net',
  'www.threads.net',
  'x.com',
  'twitter.com',
  'reddit.com',
  'www.reddit.com',
];

export const INITIAL_ROUTES: Record<ServiceRouteId, RouteRuleConfig> = {
  youtube_video: {
    id: 'youtube_video',
    title: 'YouTube Video',
    subtitle: 'Đón bắt youtube.com, m.youtube.com, www.youtube.com, youtu.be',
    aliasName: '.RouteYoutubeVideoAlias',
    enabled: true,
    targetPackage: 'app.morphe.android.youtube',
    domains: ['youtube.com', 'm.youtube.com', 'www.youtube.com', 'youtu.be'],
    nativeSchemeExample: 'vnd.youtube:<videoId>',
    presets: [
      { label: 'YouTube Morphe (Mod)', pkg: 'app.morphe.android.youtube' },
      { label: 'YouTube ReVanced (Mod)', pkg: 'app.revanced.android.youtube' },
      { label: 'RVX YouTube (Mod)', pkg: 'app.rvx.android.youtube' },
      { label: 'YouTube Thường', pkg: 'com.google.android.youtube' },
      { label: 'NewPipe', pkg: 'org.schabi.newpipe' },
      { label: 'Mở bằng Trình duyệt đã chọn (Để trống)', pkg: '' },
    ],
  },
  youtube_music: {
    id: 'youtube_music',
    title: 'YouTube Music',
    subtitle: 'Tách riêng music.youtube.com để mở thẳng vào app YouTube Music',
    aliasName: '.RouteYoutubeMusicAlias',
    enabled: true,
    targetPackage: 'app.rvx.android.apps.youtube.music',
    domains: ['music.youtube.com'],
    nativeSchemeExample: 'vnd.youtube.music:<videoId>',
    presets: [
      { label: 'RVX Music (Mod)', pkg: 'app.rvx.android.apps.youtube.music' },
      { label: 'ReVanced Music (Mod)', pkg: 'app.revanced.android.apps.youtube.music' },
      { label: 'Morphe Music (Mod)', pkg: 'app.morphe.android.apps.youtube.music' },
      { label: 'YouTube Music Thường', pkg: 'com.google.android.apps.youtube.music' },
      { label: 'Mở bằng Trình duyệt đã chọn (Để trống)', pkg: '' },
    ],
  },
  spotify: {
    id: 'spotify',
    title: 'Spotify Music & Podcast',
    subtitle: 'Dịch open.spotify.com, spotify.link sang giao thức spotify:track:<id>',
    aliasName: '.RouteSpotifyAlias',
    enabled: true,
    targetPackage: 'com.spotify.music',
    domains: ['open.spotify.com', 'spotify.link', 'spoti.fi'],
    nativeSchemeExample: 'spotify:track:<id>',
    presets: [
      { label: 'Spotify / xManager', pkg: 'com.spotify.music' },
      { label: 'Spotify Lite', pkg: 'com.spotify.lite' },
      { label: 'Spotube', pkg: 'oss.krtirtho.spotube' },
      { label: 'Mở bằng Trình duyệt đã chọn (Để trống)', pkg: '' },
    ],
  },
  facebook: {
    id: 'facebook',
    title: 'Facebook & Watch Video',
    subtitle: 'Dịch facebook.com, m.facebook.com, fb.watch sang fb://facewebmodal',
    aliasName: '.RouteFacebookAlias',
    enabled: true,
    targetPackage: 'com.facebook.katana',
    domains: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.watch', 'fb.com'],
    nativeSchemeExample: 'fb://facewebmodal/f?href=...',
    presets: [
      { label: 'Facebook', pkg: 'com.facebook.katana' },
      { label: 'Facebook Lite', pkg: 'com.facebook.lite' },
      { label: 'SlimSocial', pkg: 'it.rignanese.leo.slimfacebook' },
      { label: 'Mở bằng Trình duyệt đã chọn (Để trống)', pkg: '' },
    ],
  },
  social_media: {
    id: 'social_media',
    title: 'Mạng xã hội (TikTok, IG, Threads, X, Reddit)',
    subtitle: 'Tự động nhận diện tiktok.com, instagram.com, threads.net, x.com, reddit.com',
    aliasName: '.RouteSocialAlias',
    enabled: true,
    targetPackage: 'com.ss.android.ugc.trill',
    domains: [
      'tiktok.com',
      'vm.tiktok.com',
      'instagram.com',
      'threads.net',
      'x.com',
      'twitter.com',
      'reddit.com',
    ],
    nativeSchemeExample: 'https:// (Direct App Package Intent)',
    presets: [
      { label: 'TikTok (Châu Á)', pkg: 'com.ss.android.ugc.trill' },
      { label: 'TikTok Quốc tế / Mod', pkg: 'com.zhiliaoapp.musically' },
      { label: 'Instagram', pkg: 'com.instagram.android' },
      { label: 'Instander (IG Mod)', pkg: 'com.instander.android' },
      { label: 'X / Twitter', pkg: 'com.twitter.android' },
      { label: 'Reddit', pkg: 'com.reddit.frontpage' },
      { label: 'Mở bằng Trình duyệt đã chọn (Để trống)', pkg: '' },
    ],
  },
};

export function parseYoutubeInputForPreview(input: string): ParsedMultiPlatformPreview {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      originalInput: '',
      extractedUrl: null,
      normalizedHttpsUrl: null,
      serviceId: null,
      serviceTitle: 'Chưa nhập link',
      extractedId: null,
      playlistId: null,
      timestampSeconds: null,
      nativeSchemeUri: null,
      linkType: 'EMPTY',
      host: null,
    };
  }

  const urlMatch = trimmed.match(/(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)/i);
  const candidate = urlMatch ? urlMatch[1] : trimmed;

  try {
    const urlObj = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
    let workingUrl = urlObj;

    if (workingUrl.hostname.toLowerCase().includes('google.') && workingUrl.pathname === '/url') {
      const redirected = workingUrl.searchParams.get('q') || workingUrl.searchParams.get('url');
      if (redirected && redirected.startsWith('http')) {
        workingUrl = new URL(redirected);
      }
    }

    if (workingUrl.pathname === '/attribution_link') {
      const innerU = workingUrl.searchParams.get('u');
      if (innerU) {
        workingUrl = new URL(`https://www.youtube.com${innerU}`);
      }
    }

    const host = workingUrl.hostname.toLowerCase();
    const segments = workingUrl.pathname.split('/').filter(Boolean);
    const firstSegment = segments[0]?.toLowerCase() ?? '';
    workingUrl.protocol = 'https:';
    const normalizedHttpsUrl = workingUrl.toString();

    // 1. YouTube Music
    if (host === 'music.youtube.com') {
      const videoId = workingUrl.searchParams.get('v');
      const playlistId = workingUrl.searchParams.get('list');
      const nativeSchemeUri = videoId ? `vnd.youtube.music:${videoId}` : null;
      return {
        originalInput: input,
        extractedUrl: candidate,
        normalizedHttpsUrl,
        serviceId: 'youtube_music',
        serviceTitle: 'YouTube Music',
        extractedId: videoId || playlistId,
        playlistId,
        timestampSeconds: workingUrl.searchParams.get('t'),
        nativeSchemeUri,
        linkType: playlistId && !videoId ? 'YT_MUSIC_PLAYLIST' : 'YT_MUSIC_TRACK',
        host,
      };
    }

    // 2. YouTube Video (Chuẩn hóa m.youtube.com -> www.youtube.com)
    if (
      host === 'youtube.com' ||
      host === 'www.youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'youtu.be'
    ) {
      let videoId: string | null = null;
      let linkType = 'WATCH';

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

      const canonicalUrl =
        linkType === 'SHORTS' && videoId
          ? `https://www.youtube.com/shorts/${videoId}`
          : videoId
            ? `https://www.youtube.com/watch?v=${videoId}${playlistId ? `&list=${playlistId}` : ''}${timestampSeconds ? `&t=${timestampSeconds}` : ''}`
            : normalizedHttpsUrl.replace('://m.youtube.com', '://www.youtube.com');

      const nativeSchemeUri = videoId
        ? timestampSeconds
          ? `vnd.youtube:${videoId}?t=${timestampSeconds}`
          : `vnd.youtube:${videoId}`
        : null;

      return {
        originalInput: input,
        extractedUrl: candidate,
        normalizedHttpsUrl: canonicalUrl,
        serviceId: 'youtube_video',
        serviceTitle: 'YouTube Video',
        extractedId: videoId,
        playlistId,
        timestampSeconds,
        nativeSchemeUri,
        linkType,
        host,
      };
    }

    // 3. Spotify
    if (host.includes('spotify.com') || host === 'spotify.link' || host === 'spoti.fi') {
      const validTypes = ['track', 'album', 'playlist', 'artist', 'episode', 'show'];
      const resourceType = validTypes.includes(firstSegment) ? firstSegment : null;
      const resourceId = segments[1] || segments[0] || null;
      const nativeSchemeUri =
        resourceType && resourceId ? `spotify:${resourceType}:${resourceId}` : null;

      return {
        originalInput: input,
        extractedUrl: candidate,
        normalizedHttpsUrl,
        serviceId: 'spotify',
        serviceTitle: 'Spotify',
        extractedId: resourceId,
        playlistId: resourceType === 'playlist' ? resourceId : null,
        timestampSeconds: null,
        nativeSchemeUri,
        linkType: resourceType ? `SPOTIFY_${resourceType.toUpperCase()}` : 'SPOTIFY_LINK',
        host,
      };
    }

    // 4. Facebook
    if (host.includes('facebook.com') || host === 'fb.watch' || host === 'fb.com') {
      const encoded = encodeURIComponent(normalizedHttpsUrl);
      const videoId = workingUrl.searchParams.get('v') || segments[segments.length - 1] || null;
      return {
        originalInput: input,
        extractedUrl: candidate,
        normalizedHttpsUrl,
        serviceId: 'facebook',
        serviceTitle: 'Facebook & Watch',
        extractedId: videoId,
        playlistId: null,
        timestampSeconds: null,
        nativeSchemeUri: `fb://facewebmodal/f?href=${encoded}`,
        linkType: host === 'fb.watch' || firstSegment === 'watch' ? 'FB_WATCH' : 'FB_POST',
        host,
      };
    }

    // 5. Social Media (TikTok, Instagram, Threads, X, Reddit)
    if (
      host.includes('tiktok.com') ||
      host.includes('instagram.com') ||
      host.includes('threads.net') ||
      host === 'x.com' ||
      host.includes('twitter.com') ||
      host.includes('reddit.com')
    ) {
      const subType = host.includes('tiktok.com')
        ? 'TIKTOK_VIDEO'
        : host.includes('instagram.com')
          ? 'INSTAGRAM_REEL_POST'
          : host.includes('threads.net')
            ? 'THREADS_POST'
            : host.includes('reddit.com')
              ? 'REDDIT_THREAD'
              : 'X_STATUS';

      return {
        originalInput: input,
        extractedUrl: candidate,
        normalizedHttpsUrl,
        serviceId: 'social_media',
        serviceTitle: 'Mạng xã hội (TikTok / IG / X / Reddit)',
        extractedId: segments[segments.length - 1] || null,
        playlistId: null,
        timestampSeconds: null,
        nativeSchemeUri: normalizedHttpsUrl,
        linkType: subType,
        host,
      };
    }

    // 6. Các liên kết Web còn lại
    return {
      originalInput: input,
      extractedUrl: candidate,
      normalizedHttpsUrl,
      serviceId: null,
      serviceTitle: 'Liên kết Web ngoài danh sách (Chuyển qua Trình duyệt đã chọn)',
      extractedId: null,
      playlistId: null,
      timestampSeconds: null,
      nativeSchemeUri: null,
      linkType: 'GENERIC_WEB',
      host,
    };
  } catch {
    return {
      originalInput: input,
      extractedUrl: null,
      normalizedHttpsUrl: null,
      serviceId: null,
      serviceTitle: 'Không hợp lệ',
      extractedId: null,
      playlistId: null,
      timestampSeconds: null,
      nativeSchemeUri: null,
      linkType: 'INVALID',
      host: null,
    };
  }
}

export function generateAndroidProjectFiles(config: ProjectConfig): GeneratedFile[] {
  const pkgPath = config.applicationId.replace(/\./g, '/');
  const ytVideo = config.routes.youtube_video;
  const ytMusic = config.routes.youtube_music;
  const spotify = config.routes.spotify;
  const facebook = config.routes.facebook;
  const social = config.routes.social_media;

  const extraPackages = [
    ytVideo.targetPackage,
    ytMusic.targetPackage,
    spotify.targetPackage,
    facebook.targetPackage,
    social.targetPackage,
  ].filter(Boolean);

  const uniquePackages = Array.from(
    new Set([
      ...extraPackages,
      'app.morphe.android.youtube',
      'app.revanced.android.youtube',
      'app.rvx.android.youtube',
      'com.google.android.youtube',
      'org.schabi.newpipe',
      'app.rvx.android.apps.youtube.music',
      'app.revanced.android.apps.youtube.music',
      'app.morphe.android.apps.youtube.music',
      'com.google.android.apps.youtube.music',
      'com.spotify.music',
      'com.spotify.lite',
      'oss.krtirtho.spotube',
      'com.facebook.katana',
      'com.facebook.lite',
      'it.rignanese.leo.slimfacebook',
      'com.ss.android.ugc.trill',
      'com.zhiliaoapp.musically',
      'com.instagram.android',
      'com.instander.android',
      'com.instagram.barcelona',
      'com.twitter.android',
      'com.reddit.frontpage',
    ])
  );

  const queriesPackagesXml = uniquePackages
    .map((pkg) => `        <package android:name="${pkg}" />`)
    .join('\n');

  const manifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!--
      Chính sách Package Visibility của Android 11+ (API 30+):
      Khai báo các package đích và truy vấn trình duyệt (http/https BROWSABLE)
      để tự động phát hiện mọi trình duyệt cài trên máy và kiểm tra bản Mod.
    -->
    <queries>
${queriesPackagesXml}

        <!-- Tự động phát hiện mọi Trình duyệt Web cài trên thiết bị -->
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="http" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:scheme="https" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="vnd.youtube" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="spotify" />
        </intent>
        <intent>
            <action android:name="android.intent.action.VIEW" />
            <data android:scheme="fb" />
        </intent>
    </queries>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar"
        tools:targetApi="${config.targetSdk}">

        <!-- 1. MainActivity: Giao diện cài đặt Compose Material 3 -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!--
          2. RouterActivity (Theme.Translucent.NoTitleBar):
          - Hỗ trợ hiển thị hộp thoại nút bấm "Đồng ý mở YouTube" nổi trên màn hình
            (hoặc chuyển hướng ngầm tức thì nếu người dùng tắt chế độ hỏi xác nhận).
          - Khai báo tường minh toàn bộ 25+ tên miền mặc định với autoVerify="true"
            để danh sách đường liên kết trong "Mở theo mặc định" luôn hiển thị đầy đủ.
        -->
        <activity
            android:name=".RouterActivity"
            android:exported="true"
            android:excludeFromRecents="true"
            android:noHistory="true"
            android:theme="@android:style/Theme.Translucent.NoTitleBar">

            <!-- Danh sách Đường liên kết Mặc định hiển thị trong "Mở theo mặc định" (Open by default) -->
            <intent-filter
                android:autoVerify="true"
                android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <data android:scheme="http" />
                <data android:scheme="https" />

                <!-- YouTube & YouTube Music -->
                <data android:host="youtube.com" />
                <data android:host="m.youtube.com" />
                <data android:host="www.youtube.com" />
                <data android:host="youtu.be" />
                <data android:host="music.youtube.com" />

                <!-- Spotify -->
                <data android:host="open.spotify.com" />
                <data android:host="spotify.link" />
                <data android:host="spoti.fi" />

                <!-- Facebook & Watch -->
                <data android:host="facebook.com" />
                <data android:host="www.facebook.com" />
                <data android:host="m.facebook.com" />
                <data android:host="fb.watch" />
                <data android:host="fb.com" />

                <!-- Mạng xã hội (TikTok, Instagram, Threads, X, Reddit) -->
                <data android:host="tiktok.com" />
                <data android:host="www.tiktok.com" />
                <data android:host="vm.tiktok.com" />
                <data android:host="vt.tiktok.com" />
                <data android:host="instagram.com" />
                <data android:host="www.instagram.com" />
                <data android:host="threads.net" />
                <data android:host="www.threads.net" />
                <data android:host="x.com" />
                <data android:host="twitter.com" />
                <data android:host="reddit.com" />
                <data android:host="www.reddit.com" />

                <data android:pathPrefix="/" />
                <data android:pathPrefix="/watch" />
                <data android:pathPrefix="/shorts" />
                <data android:pathPrefix="/live" />
                <data android:pathPrefix="/playlist" />
            </intent-filter>

            <!-- Đón bắt Custom Schemes khi trang web gọi lệnh mở App -->
            <intent-filter android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="vnd.youtube" />
                <data android:scheme="youtube" />
                <data android:scheme="vnd.youtube.music" />
                <data android:scheme="spotify" />
                <data android:scheme="fb" />
            </intent-filter>

            <!-- Đón bắt thao tác Share link (ACTION_SEND) -->
            <intent-filter android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>

            <!-- Nút "Mở bằng Link Dispatcher" khi bôi đen văn bản/link trong trình duyệt -->
            <intent-filter android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.PROCESS_TEXT" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>
        </activity>

        <!--
          3. BrowserUrlInterceptorService:
          Dịch vụ bắt link NGAY BÊN TRONG TRÌNH DUYỆT (Chrome, Brave, Firefox, Samsung Internet...).
          Hiển thị nút xác nhận "Đồng ý mở YouTube" trước khi chuyển hướng.
        -->
        <service
            android:name=".BrowserUrlInterceptorService"
            android:exported="true"
            android:label="@string/accessibility_service_label"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_browser_interceptor" />
        </service>

        <!-- CÁC ACTIVITY-ALIAS CHO TỪNG LUỒNG DỊCH VỤ -->
        <activity-alias
            android:name=".RouteYoutubeVideoAlias"
            android:enabled="${ytVideo.enabled}"
            android:exported="true"
            android:targetActivity=".RouterActivity">
            <intent-filter
                android:autoVerify="true"
                android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <data android:scheme="http" />
                <data android:scheme="https" />
                <data android:host="youtube.com" />
                <data android:host="m.youtube.com" />
                <data android:host="www.youtube.com" />
                <data android:host="youtu.be" />
                <data android:pathPrefix="/" />
                <data android:pathPrefix="/watch" />
                <data android:pathPrefix="/shorts" />
                <data android:pathPrefix="/live" />
            </intent-filter>
        </activity-alias>

        <activity-alias
            android:name=".RouteYoutubeMusicAlias"
            android:enabled="${ytMusic.enabled}"
            android:exported="true"
            android:targetActivity=".RouterActivity">
            <intent-filter
                android:autoVerify="true"
                android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <data android:scheme="http" />
                <data android:scheme="https" />
                <data android:host="music.youtube.com" />
                <data android:pathPrefix="/" />
                <data android:pathPrefix="/watch" />
                <data android:pathPrefix="/playlist" />
            </intent-filter>
        </activity-alias>

        <activity-alias
            android:name=".RouteSpotifyAlias"
            android:enabled="${spotify.enabled}"
            android:exported="true"
            android:targetActivity=".RouterActivity">
            <intent-filter
                android:autoVerify="true"
                android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <data android:scheme="http" />
                <data android:scheme="https" />
                <data android:host="open.spotify.com" />
                <data android:host="spotify.link" />
                <data android:host="spoti.fi" />
                <data android:pathPrefix="/" />
            </intent-filter>
        </activity-alias>

        <activity-alias
            android:name=".RouteFacebookAlias"
            android:enabled="${facebook.enabled}"
            android:exported="true"
            android:targetActivity=".RouterActivity">
            <intent-filter
                android:autoVerify="true"
                android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <data android:scheme="http" />
                <data android:scheme="https" />
                <data android:host="facebook.com" />
                <data android:host="www.facebook.com" />
                <data android:host="m.facebook.com" />
                <data android:host="fb.watch" />
                <data android:host="fb.com" />
                <data android:pathPrefix="/" />
            </intent-filter>
        </activity-alias>

        <activity-alias
            android:name=".RouteSocialAlias"
            android:enabled="${social.enabled}"
            android:exported="true"
            android:targetActivity=".RouterActivity">
            <intent-filter
                android:autoVerify="true"
                android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />

                <data android:scheme="http" />
                <data android:scheme="https" />
                <data android:host="tiktok.com" />
                <data android:host="www.tiktok.com" />
                <data android:host="vm.tiktok.com" />
                <data android:host="vt.tiktok.com" />
                <data android:host="instagram.com" />
                <data android:host="www.instagram.com" />
                <data android:host="threads.net" />
                <data android:host="www.threads.net" />
                <data android:host="x.com" />
                <data android:host="twitter.com" />
                <data android:host="reddit.com" />
                <data android:host="www.reddit.com" />
                <data android:pathPrefix="/" />
            </intent-filter>
        </activity-alias>

    </application>

</manifest>`;

  const browserUrlInterceptorServiceKt = `package ${config.applicationId}

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.text.TextUtils
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

/**
 * BrowserUrlInterceptorService:
 * Bắt link YouTube / YouTube Music / Spotify NGAY BÊN TRONG TRÌNH DUYỆT (Chrome, Brave, Firefox, Samsung Internet...).
 *
 * CƠ CHẾ HIỆN NÚT XÁC NHẬN "ĐỒNG Ý MỞ YOUTUBE":
 * 1. Khi phát hiện người dùng mở một video YouTube / Shorts / Nhạc hợp lệ trong trình duyệt:
 *    - Hiển thị một thanh nút bấm nổi ngay phía dưới màn hình trình duyệt (TYPE_ACCESSIBILITY_OVERLAY):
 *      [ Đồng ý mở YouTube ]  |  [ Ở lại Web ]
 *    - Chỉ khi người dùng chủ động nhấn vào nút "Đồng ý mở YouTube", ứng dụng mới thực hiện
 *      chuyển hướng sang YouTube Mod (VD: YouTube Morphe / ReVanced).
 * 2. Người dùng có thể bật/tắt chế độ "Hiện nút Đồng ý trước khi chuyển hướng" trong MainActivity.
 */
class BrowserUrlInterceptorService : AccessibilityService() {

    private var lastInterceptedKey: String = ""
    private var activeOverlayMediaKey: String = ""
    private var lastInterceptedTimeMs: Long = 0L
    private var cachedBrowserPackages: Set<String> = emptySet()
    private var lastBrowserCacheTimeMs: Long = 0L

    private val mainHandler = Handler(Looper.getMainLooper())
    private var confirmationOverlayView: View? = null
    private val autoDismissRunnable = Runnable {
        dismissConfirmationOverlay()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val pkgName = event.packageName?.toString() ?: return
        if (pkgName == packageName) return
        if (pkgName == "com.android.systemui") return

        val prefs = getSharedPreferences(RouterActivity.PREFS_NAME, Context.MODE_PRIVATE)
        val interceptorEnabled = prefs.getBoolean(
            RouterActivity.KEY_IN_BROWSER_INTERCEPT_ENABLED,
            true
        )
        if (!interceptorEnabled) {
            dismissConfirmationOverlay()
            return
        }

        if (!isDetectedBrowserPackage(pkgName)) {
            dismissConfirmationOverlay()
            return
        }

        val rootNode = rootInActiveWindow ?: return
        val rawUrlBarText = extractBrowserAddressBarText(rootNode, pkgName) ?: return

        val normalizedUrl = normalizeBrowserBarUrl(rawUrlBarText) ?: return
        val uri = try {
            Uri.parse(normalizedUrl)
        } catch (_: Exception) {
            return
        }

        val mediaKey = extractActionableMediaKey(uri)

        if (mediaKey == null) {
            if (isDefinitelyNonVideoPage(uri)) {
                lastInterceptedKey = ""
                dismissConfirmationOverlay()
            }
            return
        }

        if (mediaKey == lastInterceptedKey) {
            return
        }

        val now = System.currentTimeMillis()
        if (now - lastInterceptedTimeMs < MIN_TRANSITION_GAP_MS) {
            return
        }

        val readyTarget = RouterActivity.prepareBrowserServiceTarget(this, normalizedUrl)
        if (readyTarget == null) {
            return
        }

        val confirmBeforeRedirect = prefs.getBoolean(
            RouterActivity.KEY_CONFIRM_BEFORE_REDIRECT,
            true
        )

        lastInterceptedKey = mediaKey
        lastInterceptedTimeMs = now

        if (confirmBeforeRedirect) {
            showConfirmationBannerOverlay(
                mediaKey = mediaKey,
                readyTarget = readyTarget,
                normalizedUrl = normalizedUrl
            )
        } else {
            val dispatched = RouterActivity.dispatchUrlFromBrowserService(
                context = this,
                httpsUrl = normalizedUrl
            )
            if (!dispatched) {
                lastInterceptedKey = ""
            }
        }
    }

    override fun onInterrupt() {
        dismissConfirmationOverlay()
    }

    override fun onDestroy() {
        dismissConfirmationOverlay()
        super.onDestroy()
    }

    private fun showConfirmationBannerOverlay(
        mediaKey: String,
        readyTarget: ReadyDispatchTarget,
        normalizedUrl: String
    ) {
        mainHandler.post {
            dismissConfirmationOverlayInternal()
            activeOverlayMediaKey = mediaKey

            val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
            if (wm == null) {
                launchFallbackConfirmationActivity(normalizedUrl)
                return@post
            }

            try {
                val bannerView = buildConfirmationBannerView(
                    readyTarget = readyTarget,
                    onAgreeClick = {
                        dismissConfirmationOverlayInternal()
                        RouterActivity.dispatchUrlFromBrowserService(
                            context = this@BrowserUrlInterceptorService,
                            httpsUrl = normalizedUrl
                        )
                    },
                    onStayClick = {
                        dismissConfirmationOverlayInternal()
                    }
                )

                val layoutParams = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.WRAP_CONTENT,
                    WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                        WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or
                        WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                    y = dpToPx(20)
                }

                wm.addView(bannerView, layoutParams)
                confirmationOverlayView = bannerView

                mainHandler.removeCallbacks(autoDismissRunnable)
                mainHandler.postDelayed(autoDismissRunnable, OVERLAY_TIMEOUT_MS)
            } catch (_: Exception) {
                launchFallbackConfirmationActivity(normalizedUrl)
            }
        }
    }

    private fun launchFallbackConfirmationActivity(normalizedUrl: String) {
        try {
            val confirmIntent = Intent(this, RouterActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = Uri.parse(normalizedUrl)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(confirmIntent)
        } catch (_: Exception) {
            // Bỏ qua
        }
    }

    private fun buildConfirmationBannerView(
        readyTarget: ReadyDispatchTarget,
        onAgreeClick: () -> Unit,
        onStayClick: () -> Unit
    ): View {
        val outerWrapper = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dpToPx(14), dpToPx(8), dpToPx(14), dpToPx(8))
        }

        val cardBackground = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(18).toFloat()
            setColor(Color.parseColor("#F20F172A"))
            setStroke(dpToPx(1), Color.parseColor("#4D10B981"))
        }

        val cardContainer = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            background = cardBackground
            setPadding(dpToPx(16), dpToPx(14), dpToPx(16), dpToPx(14))
            elevation = dpToPx(10).toFloat()
        }

        val titleView = TextView(this).apply {
            text = "Phát hiện liên kết \${readyTarget.service.title}"
            setTextColor(Color.WHITE)
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
            setTypeface(typeface, Typeface.BOLD)
            maxLines = 1
            ellipsize = TextUtils.TruncateAt.END
        }

        val subtitleView = TextView(this).apply {
            text = "Đích: \${readyTarget.targetPackage} · Nhấn Đồng ý để chuyển sang ứng dụng"
            setTextColor(Color.parseColor("#94A3B8"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
            maxLines = 1
            ellipsize = TextUtils.TruncateAt.END
            setPadding(0, dpToPx(2), 0, dpToPx(10))
        }

        val buttonRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }

        val stayBtnBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(12).toFloat()
            setColor(Color.parseColor("#1E293B"))
            setStroke(dpToPx(1), Color.parseColor("#334155"))
        }

        val stayButton = Button(this).apply {
            text = "Ở lại Web"
            isAllCaps = false
            setTextColor(Color.parseColor("#CBD5E1"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            background = stayBtnBg
            setPadding(dpToPx(14), dpToPx(8), dpToPx(14), dpToPx(8))
            setOnClickListener { onStayClick() }
        }

        val stayParams = LinearLayout.LayoutParams(
            0,
            dpToPx(42),
            1f
        ).apply {
            marginEnd = dpToPx(10)
        }

        val agreeBtnBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = dpToPx(12).toFloat()
            setColor(Color.parseColor("#10B981"))
        }

        val agreeButton = Button(this).apply {
            text = "Đồng ý mở \${readyTarget.service.shortActionLabel}"
            isAllCaps = false
            setTextColor(Color.parseColor("#04130E"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            setTypeface(typeface, Typeface.BOLD)
            background = agreeBtnBg
            setPadding(dpToPx(16), dpToPx(8), dpToPx(16), dpToPx(8))
            setOnClickListener { onAgreeClick() }
        }

        val agreeParams = LinearLayout.LayoutParams(
            0,
            dpToPx(42),
            1.65f
        )

        buttonRow.addView(stayButton, stayParams)
        buttonRow.addView(agreeButton, agreeParams)

        cardContainer.addView(titleView)
        cardContainer.addView(subtitleView)
        cardContainer.addView(buttonRow)
        outerWrapper.addView(cardContainer)

        return outerWrapper
    }

    private fun dismissConfirmationOverlay() {
        mainHandler.post {
            dismissConfirmationOverlayInternal()
        }
    }

    private fun dismissConfirmationOverlayInternal() {
        mainHandler.removeCallbacks(autoDismissRunnable)
        val view = confirmationOverlayView ?: return
        confirmationOverlayView = null
        activeOverlayMediaKey = ""
        try {
            val wm = getSystemService(Context.WINDOW_SERVICE) as? WindowManager
            wm?.removeViewImmediate(view)
        } catch (_: Exception) {
            // Bỏ qua
        }
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            resources.displayMetrics
        ).toInt()
    }

    private fun isDetectedBrowserPackage(pkgName: String): Boolean {
        val now = System.currentTimeMillis()
        if (cachedBrowserPackages.isEmpty() || (now - lastBrowserCacheTimeMs) > 15_000L) {
            cachedBrowserPackages = RouterActivity.detectInstalledBrowsers(this)
                .map { it.packageName }
                .toSet()
            lastBrowserCacheTimeMs = now
        }
        return pkgName in cachedBrowserPackages
    }

    private fun extractBrowserAddressBarText(
        rootNode: AccessibilityNodeInfo,
        browserPkg: String
    ): String? {
        for (idSuffix in KNOWN_URL_BAR_ID_SUFFIXES) {
            val fullViewId = "$browserPkg:id/$idSuffix"
            val matchedNodes = try {
                rootNode.findAccessibilityNodeInfosByViewId(fullViewId)
            } catch (_: Exception) {
                null
            }
            if (!matchedNodes.isNullOrEmpty()) {
                for (node in matchedNodes) {
                    if (node.isFocused) return null
                    val text = node.text?.toString()?.trim()
                    if (!text.isNullOrBlank()) {
                        return text
                    }
                }
                return null
            }
        }

        return scanTopToolbarForUrl(rootNode, depth = 0, maxDepth = 5)
    }

    private fun scanTopToolbarForUrl(
        node: AccessibilityNodeInfo?,
        depth: Int,
        maxDepth: Int
    ): String? {
        if (node == null || depth > maxDepth) return null
        if (!node.isFocused) {
            val text = node.text?.toString()?.trim()
            if (!text.isNullOrBlank() && text.length < 260 && !text.contains(" ") && looksLikeUrlText(text)) {
                return text
            }
        }

        val count = node.childCount.coerceAtMost(8)
        for (i in 0 until count) {
            val child = try {
                node.getChild(i)
            } catch (_: Exception) {
                null
            } ?: continue
            val found = scanTopToolbarForUrl(child, depth + 1, maxDepth)
            if (found != null) return found
        }
        return null
    }

    private fun looksLikeUrlText(rawText: String): Boolean {
        val cleaned = rawText.lowercase()
            .removePrefix("https://")
            .removePrefix("http://")
        return TARGET_DOMAIN_PREFIXES.any { domain ->
            cleaned == domain ||
                cleaned == "www.$domain" ||
                cleaned.startsWith("$domain/") ||
                cleaned.startsWith("www.$domain/")
        }
    }

    private fun normalizeBrowserBarUrl(rawText: String): String? {
        val trimmed = rawText.trim()
        if (trimmed.isEmpty() || trimmed.contains(" ")) return null
        return when {
            trimmed.startsWith("https://", ignoreCase = true) -> trimmed
            trimmed.startsWith("http://", ignoreCase = true) ->
                "https://" + trimmed.substring(7)
            trimmed.contains(".") -> "https://$trimmed"
            else -> null
        }
    }

    private fun isDefinitelyNonVideoPage(uri: Uri): Boolean {
        val host = uri.host?.lowercase() ?: return false
        val segments = uri.pathSegments
        val firstSeg = segments.firstOrNull()?.lowercase() ?: ""

        if (host.contains("youtube.com")) {
            if (segments.isEmpty()) return true
            if (firstSeg in setOf("feed", "results", "channel", "c", "user", "gaming", "account", "reporthistory")) {
                return true
            }
        }
        if (!host.contains("youtube.com") && host != "youtu.be" && !host.contains("spotify.com") && !host.contains("facebook.com") && host != "fb.watch") {
            return true
        }
        return false
    }

    private fun extractActionableMediaKey(uri: Uri): String? {
        val host = uri.host?.lowercase() ?: return null
        val segments = uri.pathSegments
        val firstSeg = segments.firstOrNull()?.lowercase() ?: ""

        if (host.contains("youtube.com") || host == "youtu.be") {
            if (host == "youtu.be") {
                val id = firstSeg.takeIf { it.length >= 6 } ?: return null
                return "yt_shortlink:$id"
            }

            if (firstSeg == "watch") {
                val videoId = uri.getQueryParameter("v")?.takeIf { it.length >= 6 }
                val listId = uri.getQueryParameter("list")?.takeIf { it.length >= 6 }
                val keyId = videoId ?: listId ?: return null
                return "yt_watch:$host:$keyId"
            }

            if (firstSeg == "shorts" || firstSeg == "live" || firstSeg == "embed" || firstSeg == "v") {
                val videoId = segments.getOrNull(1)?.takeIf { it.length >= 6 } ?: return null
                return "yt_$firstSeg:$videoId"
            }

            if (firstSeg == "playlist") {
                val listId = uri.getQueryParameter("list")?.takeIf { it.length >= 6 } ?: return null
                return "yt_playlist:$listId"
            }

            return null
        }

        if (host.contains("spotify.com") || host == "spotify.link" || host == "spoti.fi") {
            if (host == "spotify.link" || host == "spoti.fi") {
                val code = firstSeg.takeIf { it.length >= 4 } ?: return null
                return "spotify_short:$code"
            }
            if (firstSeg in setOf("track", "album", "playlist", "artist", "episode", "show")) {
                val id = segments.getOrNull(1)?.takeIf { it.length >= 6 } ?: return null
                return "spotify_$firstSeg:$id"
            }
            return null
        }

        if (host.contains("facebook.com") || host == "fb.watch") {
            if (host == "fb.watch") {
                val id = firstSeg.takeIf { it.length >= 4 } ?: return null
                return "fb_watch:$id"
            }
            if (firstSeg == "watch" || firstSeg == "reel" || segments.contains("videos")) {
                val id = uri.getQueryParameter("v") ?: segments.lastOrNull()?.takeIf { it.length >= 5 } ?: return null
                return "fb_video:$id"
            }
            return null
        }

        if (
            host.contains("tiktok.com") ||
            host.contains("instagram.com") ||
            host.contains("threads.net") ||
            host == "x.com" ||
            host.contains("twitter.com") ||
            host.contains("reddit.com")
        ) {
            if (segments.size >= 2) {
                val lastSeg = segments.lastOrNull()?.takeIf { it.length >= 4 } ?: return null
                return "social:$host:$lastSeg"
            }
        }

        return null
    }

    companion object {
        private const val MIN_TRANSITION_GAP_MS = 900L
        private const val OVERLAY_TIMEOUT_MS = 15_000L

        private val KNOWN_URL_BAR_ID_SUFFIXES = listOf(
            "url_bar",
            "location_bar_edit_text",
            "mozac_browser_toolbar_url_view",
            "url_field",
            "omnibox_text_field",
            "address_bar",
            "search_box_text"
        )

        private val TARGET_DOMAIN_PREFIXES = listOf(
            "youtube.com",
            "m.youtube.com",
            "youtu.be",
            "music.youtube.com",
            "open.spotify.com",
            "spotify.link",
            "fb.watch",
            "facebook.com",
            "m.facebook.com",
            "tiktok.com",
            "vm.tiktok.com",
            "instagram.com",
            "threads.net",
            "x.com",
            "twitter.com",
            "reddit.com"
        )

        fun isServiceEnabled(context: Context): Boolean {
            val expectedComponentName = "\${context.packageName}/\${BrowserUrlInterceptorService::class.java.canonicalName}"
            val enabledServices = Settings.Secure.getString(
                context.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            return enabledServices.split(':').any { it.equals(expectedComponentName, ignoreCase = true) }
        }
    }
}`;

  const routerActivityKt = `package ${config.applicationId}

import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import java.util.regex.Pattern

data class DetectedBrowser(
    val appName: String,
    val packageName: String
)

enum class ServiceRoute(
    val id: String,
    val title: String,
    val shortActionLabel: String,
    val aliasClassName: String,
    val defaultPackage: String,
    val defaultEnabled: Boolean,
    val suggestedPackages: List<Pair<String, String>>
) {
    YOUTUBE_VIDEO(
        id = "youtube_video",
        title = "YouTube Video",
        shortActionLabel = "YouTube",
        aliasClassName = "${config.applicationId}.RouteYoutubeVideoAlias",
        defaultPackage = "${ytVideo.targetPackage}",
        defaultEnabled = ${ytVideo.enabled},
        suggestedPackages = listOf(
            "YouTube Morphe (Mod)" to "app.morphe.android.youtube",
            "YouTube ReVanced (Mod)" to "app.revanced.android.youtube",
            "RVX YouTube (Mod)" to "app.rvx.android.youtube",
            "YouTube Thường" to "com.google.android.youtube",
            "NewPipe" to "org.schabi.newpipe",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    YOUTUBE_MUSIC(
        id = "youtube_music",
        title = "YouTube Music",
        shortActionLabel = "YouTube Music",
        aliasClassName = "${config.applicationId}.RouteYoutubeMusicAlias",
        defaultPackage = "${ytMusic.targetPackage}",
        defaultEnabled = ${ytMusic.enabled},
        suggestedPackages = listOf(
            "RVX Music (Mod)" to "app.rvx.android.apps.youtube.music",
            "ReVanced Music (Mod)" to "app.revanced.android.apps.youtube.music",
            "Morphe Music (Mod)" to "app.morphe.android.apps.youtube.music",
            "YouTube Music Thường" to "com.google.android.apps.youtube.music",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    SPOTIFY(
        id = "spotify",
        title = "Spotify",
        shortActionLabel = "Spotify",
        aliasClassName = "${config.applicationId}.RouteSpotifyAlias",
        defaultPackage = "${spotify.targetPackage}",
        defaultEnabled = ${spotify.enabled},
        suggestedPackages = listOf(
            "Spotify / xManager" to "com.spotify.music",
            "Spotify Lite" to "com.spotify.lite",
            "Spotube" to "oss.krtirtho.spotube",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    FACEBOOK(
        id = "facebook",
        title = "Facebook & Watch",
        shortActionLabel = "Facebook",
        aliasClassName = "${config.applicationId}.RouteFacebookAlias",
        defaultPackage = "${facebook.targetPackage}",
        defaultEnabled = ${facebook.enabled},
        suggestedPackages = listOf(
            "Facebook" to "com.facebook.katana",
            "Facebook Lite" to "com.facebook.lite",
            "SlimSocial" to "it.rignanese.leo.slimfacebook",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    ),
    SOCIAL_MEDIA(
        id = "social_media",
        title = "Mạng xã hội (TikTok / IG / X / Reddit)",
        shortActionLabel = "App Mạng xã hội",
        aliasClassName = "${config.applicationId}.RouteSocialAlias",
        defaultPackage = "${social.targetPackage}",
        defaultEnabled = ${social.enabled},
        suggestedPackages = listOf(
            "TikTok (Châu Á)" to "com.ss.android.ugc.trill",
            "TikTok Quốc tế / Mod" to "com.zhiliaoapp.musically",
            "Instagram" to "com.instagram.android",
            "Instander (IG Mod)" to "com.instander.android",
            "X / Twitter" to "com.twitter.android",
            "Reddit" to "com.reddit.frontpage",
            "Mở bằng Trình duyệt đã chọn (Để trống)" to ""
        )
    )
}

data class TranslatedLinkResult(
    val service: ServiceRoute?,
    val originalUrl: String,
    val normalizedHttpsUrl: String,
    val nativeSchemeUri: Uri?,
    val extractedId: String?,
    val linkSubType: String
)

data class ReadyDispatchTarget(
    val translated: TranslatedLinkResult,
    val service: ServiceRoute,
    val targetPackage: String,
    val useNativeScheme: Boolean
)

class RouterActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window?.setBackgroundDrawable(ColorDrawable(android.graphics.Color.TRANSPARENT))

        val incomingUri = extractIncomingUri(intent)
        if (incomingUri == null) {
            finish()
            return
        }

        val translated = analyzeAndTranslateUri(incomingUri)
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val service = translated.service

        if (service == null) {
            recordDispatchStats(prefs, translated.normalizedHttpsUrl, "WEB_BROWSER")
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            finish()
            return
        }

        val isRouteEnabled = prefs.getBoolean(
            prefKeyRouteEnabled(service),
            service.defaultEnabled
        )

        if (!isRouteEnabled) {
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            finish()
            return
        }

        val targetPackage = resolveTargetPackageForLink(this, prefs, service, translated.linkSubType)
        val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, ${config.preferNativeSchemeDefault})

        if (targetPackage.isBlank()) {
            recordDispatchStats(prefs, translated.normalizedHttpsUrl, translated.extractedId ?: service.title)
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            finish()
            return
        }

        if (!isPackageInstalled(this, targetPackage)) {
            disableRouteAndAliasSilently(this, prefs, service)
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
            finish()
            return
        }

        val confirmBeforeRedirect = prefs.getBoolean(KEY_CONFIRM_BEFORE_REDIRECT, true)
        val bypassConfirm = intent?.getBooleanExtra(EXTRA_BYPASS_CONFIRM, false) == true

        if (confirmBeforeRedirect && !bypassConfirm) {
            setContent {
                MaterialTheme(colorScheme = darkColorScheme()) {
                    ConfirmRedirectOverlayScreen(
                        translated = translated,
                        service = service,
                        targetPackage = targetPackage,
                        onConfirmRedirect = {
                            recordDispatchStats(
                                prefs,
                                translated.normalizedHttpsUrl,
                                translated.extractedId ?: service.title
                            )
                            val launched = tryLaunchTargetPackage(
                                context = this@RouterActivity,
                                translated = translated,
                                targetPackage = targetPackage,
                                preferNativeScheme = useNativeScheme
                            )
                            if (!launched) {
                                disableRouteAndAliasSilently(this@RouterActivity, prefs, service)
                                openInDetectedBrowser(this@RouterActivity, prefs, translated.normalizedHttpsUrl)
                            }
                            finish()
                        },
                        onOpenInBrowserInstead = {
                            openInDetectedBrowser(this@RouterActivity, prefs, translated.normalizedHttpsUrl)
                            finish()
                        },
                        onCancelStay = {
                            finish()
                        }
                    )
                }
            }
            return
        }

        recordDispatchStats(prefs, translated.normalizedHttpsUrl, translated.extractedId ?: service.title)
        val launched = tryLaunchTargetPackage(
            context = this,
            translated = translated,
            targetPackage = targetPackage,
            preferNativeScheme = useNativeScheme
        )

        if (!launched) {
            disableRouteAndAliasSilently(this, prefs, service)
            openInDetectedBrowser(this, prefs, translated.normalizedHttpsUrl)
        }
        finish()
    }

    private fun extractIncomingUri(incomingIntent: Intent?): Uri? {
        if (incomingIntent == null) return null
        return when (incomingIntent.action) {
            Intent.ACTION_VIEW -> incomingIntent.data
            Intent.ACTION_SEND -> {
                val sharedText = incomingIntent.getStringExtra(Intent.EXTRA_TEXT) ?: return null
                extractFirstUrlUri(sharedText)
            }
            Intent.ACTION_PROCESS_TEXT -> {
                val selectedText = incomingIntent.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT)?.toString()
                    ?: return null
                extractFirstUrlUri(selectedText)
            }
            else -> incomingIntent.data
        }
    }

    private fun extractFirstUrlUri(text: String): Uri? {
        val matcher = URL_EXTRACT_PATTERN.matcher(text)
        return if (matcher.find()) {
            matcher.group(1)?.let { Uri.parse(it) }
        } else {
            val trimmed = text.trim()
            if (trimmed.contains(".") && !trimmed.contains(" ")) {
                Uri.parse(if (trimmed.startsWith("http")) trimmed else "https://$trimmed")
            } else null
        }
    }

    companion object {
        const val PREFS_NAME = "link_dispatcher_prefs"
        const val KEY_USE_NATIVE_SCHEME = "use_vnd_scheme"
        const val KEY_WALLPAPER_STYLE = "wallpaper_style"
        const val KEY_FALLBACK_BROWSER_PACKAGE = "fallback_browser_package"
        const val KEY_IN_BROWSER_INTERCEPT_ENABLED = "in_browser_intercept_enabled"
        const val KEY_CONFIRM_BEFORE_REDIRECT = "confirm_before_redirect"
        const val KEY_LAST_DISPATCHED_URL = "last_dispatched_url"
        const val KEY_LAST_VIDEO_ID = "last_video_id"
        const val KEY_DISPATCH_COUNT = "dispatch_count"
        const val EXTRA_BYPASS_CONFIRM = "extra_bypass_confirm"
        const val DEFAULT_SAMPLE_YOUTUBE_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

        fun prefKeyRouteEnabled(route: ServiceRoute): String = "route_enabled_\${route.id}"
        fun prefKeyRoutePackage(route: ServiceRoute): String =
            if (route == ServiceRoute.YOUTUBE_VIDEO) "target_package" else "route_pkg_\${route.id}"

        private val URL_EXTRACT_PATTERN: Pattern =
            Pattern.compile("(https?://[\\\\w\\\\-._~:/?#\\\\[\\\\]@!$&'()*+,;=%]+)")

        private fun recordDispatchStats(
            prefs: android.content.SharedPreferences,
            normalizedUrl: String,
            videoOrServiceId: String
        ) {
            prefs.edit()
                .putString(KEY_LAST_DISPATCHED_URL, normalizedUrl)
                .putString(KEY_LAST_VIDEO_ID, videoOrServiceId)
                .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
                .apply()
        }

        fun prepareBrowserServiceTarget(context: Context, httpsUrl: String): ReadyDispatchTarget? {
            val rawUri = try {
                Uri.parse(httpsUrl)
            } catch (_: Exception) {
                return null
            }

            val translated = analyzeAndTranslateUri(rawUri)
            val service = translated.service ?: return null

            if (translated.extractedId.isNullOrBlank()) {
                return null
            }

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val isRouteEnabled = prefs.getBoolean(prefKeyRouteEnabled(service), service.defaultEnabled)
            if (!isRouteEnabled) return null

            val targetPackage = resolveTargetPackageForLink(
                context,
                prefs,
                service,
                translated.linkSubType
            )
            if (targetPackage.isBlank()) return null

            if (!isPackageInstalled(context, targetPackage)) {
                disableRouteAndAliasSilently(context, prefs, service)
                return null
            }

            val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, ${config.preferNativeSchemeDefault})
            return ReadyDispatchTarget(
                translated = translated,
                service = service,
                targetPackage = targetPackage,
                useNativeScheme = useNativeScheme
            )
        }

        fun dispatchUrlFromBrowserService(context: Context, httpsUrl: String): Boolean {
            val ready = prepareBrowserServiceTarget(context, httpsUrl) ?: return false
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

            val launched = tryLaunchTargetPackage(
                context = context,
                translated = ready.translated,
                targetPackage = ready.targetPackage,
                preferNativeScheme = ready.useNativeScheme
            )

            if (launched) {
                recordDispatchStats(
                    prefs,
                    ready.translated.normalizedHttpsUrl,
                    ready.translated.extractedId ?: ready.service.title
                )
            }
            return launched
        }

        fun analyzeAndTranslateUri(rawUri: Uri): TranslatedLinkResult {
            var workingUri = rawUri
            val initialScheme = workingUri.scheme?.lowercase() ?: ""

            if (initialScheme == "vnd.youtube" || initialScheme == "youtube") {
                val idFromScheme = workingUri.schemeSpecificPart
                    ?.removePrefix("//")
                    ?.substringBefore("?")
                    ?.substringBefore("&")
                    ?.trim()
                if (!idFromScheme.isNullOrBlank()) {
                    workingUri = Uri.parse("https://www.youtube.com/watch?v=$idFromScheme")
                }
            } else if (initialScheme == "vnd.youtube.music") {
                val idFromScheme = workingUri.schemeSpecificPart
                    ?.removePrefix("//")
                    ?.substringBefore("?")
                    ?.trim()
                if (!idFromScheme.isNullOrBlank()) {
                    workingUri = Uri.parse("https://music.youtube.com/watch?v=$idFromScheme")
                }
            }

            val initialHost = workingUri.host?.lowercase() ?: ""
            if (initialHost.contains("google.") && workingUri.path == "/url") {
                val redirectedTarget = workingUri.getQueryParameter("q")
                    ?: workingUri.getQueryParameter("url")
                if (!redirectedTarget.isNullOrBlank() && redirectedTarget.startsWith("http")) {
                    workingUri = Uri.parse(redirectedTarget)
                }
            }

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

            if (host == "music.youtube.com") {
                val videoId = workingUri.getQueryParameter("v")
                val playlistId = workingUri.getQueryParameter("list")
                val nativeUri = if (!videoId.isNullOrBlank()) {
                    Uri.parse("vnd.youtube.music:$videoId")
                } else null

                return TranslatedLinkResult(
                    service = ServiceRoute.YOUTUBE_MUSIC,
                    originalUrl = rawUri.toString(),
                    normalizedHttpsUrl = httpsString,
                    nativeSchemeUri = nativeUri,
                    extractedId = videoId ?: playlistId,
                    linkSubType = if (!playlistId.isNullOrBlank()) "YT_MUSIC_PLAYLIST" else "YT_MUSIC_TRACK"
                )
            }

            if (
                host == "youtube.com" ||
                host == "www.youtube.com" ||
                host == "m.youtube.com" ||
                host == "youtu.be"
            ) {
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
                val playlistId = workingUri.getQueryParameter("list")
                val timestamp = workingUri.getQueryParameter("t") ?: workingUri.getQueryParameter("start")

                val canonicalYoutubeUrl = when {
                    subType == "SHORTS" && !videoId.isNullOrBlank() ->
                        "https://www.youtube.com/shorts/$videoId"
                    !videoId.isNullOrBlank() -> {
                        val base = "https://www.youtube.com/watch?v=$videoId"
                        val withList = if (!playlistId.isNullOrBlank()) "$base&list=$playlistId" else base
                        if (!timestamp.isNullOrBlank()) "$withList&t=$timestamp" else withList
                    }
                    !playlistId.isNullOrBlank() ->
                        "https://www.youtube.com/playlist?list=$playlistId"
                    else -> httpsString.replaceFirst("://m.youtube.com", "://www.youtube.com")
                }

                val vndUri = if (!videoId.isNullOrBlank()) {
                    val base = "vnd.youtube:$videoId"
                    Uri.parse(if (!timestamp.isNullOrBlank()) "$base?t=$timestamp" else base)
                } else null

                return TranslatedLinkResult(
                    service = ServiceRoute.YOUTUBE_VIDEO,
                    originalUrl = rawUri.toString(),
                    normalizedHttpsUrl = canonicalYoutubeUrl,
                    nativeSchemeUri = vndUri,
                    extractedId = videoId ?: playlistId,
                    linkSubType = subType
                )
            }

            if (host.contains("spotify.com") || host == "spotify.link" || host == "spoti.fi") {
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
                    extractedId = resourceId ?: firstSegment.takeIf { it.isNotBlank() },
                    linkSubType = resourceType?.uppercase() ?: "SPOTIFY_LINK"
                )
            }

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

            return TranslatedLinkResult(
                service = null,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = null,
                extractedId = null,
                linkSubType = "GENERIC_WEB"
            )
        }

        private fun resolveTargetPackageForLink(
            context: Context,
            prefs: android.content.SharedPreferences,
            service: ServiceRoute,
            linkSubType: String
        ): String {
            val rawSaved = prefs.getString(prefKeyRoutePackage(service), service.defaultPackage)
            if (rawSaved != null && rawSaved.trim().isEmpty()) {
                return ""
            }
            val configured = rawSaved?.trim() ?: service.defaultPackage

            if (service == ServiceRoute.SOCIAL_MEDIA && configured == ServiceRoute.SOCIAL_MEDIA.defaultPackage) {
                return when (linkSubType) {
                    "INSTAGRAM" -> if (isPackageInstalled(context, "com.instander.android")) "com.instander.android" else "com.instagram.android"
                    "THREADS" -> "com.instagram.barcelona"
                    "X_TWITTER" -> "com.twitter.android"
                    "REDDIT" -> "com.reddit.frontpage"
                    else -> configured
                }
            }
            return configured
        }

        private fun tryLaunchTargetPackage(
            context: Context,
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
                }
                try {
                    context.startActivity(forwardIntent)
                    return true
                } catch (_: ActivityNotFoundException) {
                    // Thử URI kế tiếp
                } catch (_: Exception) {
                    // Tiếp tục
                }
            }
            return false
        }

        private fun disableRouteAndAliasSilently(
            context: Context,
            prefs: android.content.SharedPreferences,
            service: ServiceRoute
        ) {
            prefs.edit().putBoolean(prefKeyRouteEnabled(service), false).apply()
            try {
                val componentName = ComponentName(context.packageName, service.aliasClassName)
                context.packageManager.setComponentEnabledSetting(
                    componentName,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
                )
            } catch (_: Exception) {
                // Bỏ qua
            }
        }

        private fun openInDetectedBrowser(
            context: Context,
            prefs: android.content.SharedPreferences,
            httpsUrl: String
        ) {
            val uri = Uri.parse(httpsUrl)
            val preferredBrowserPkg = prefs.getString(KEY_FALLBACK_BROWSER_PACKAGE, "")?.trim().orEmpty()

            if (preferredBrowserPkg.isNotEmpty() && preferredBrowserPkg != context.packageName && isPackageInstalled(context, preferredBrowserPkg)) {
                if (tryStartBrowserPackage(context, uri, preferredBrowserPkg)) {
                    return
                }
            }

            val detectedBrowsers = detectInstalledBrowsers(context)
            for (browser in detectedBrowsers) {
                if (tryStartBrowserPackage(context, uri, browser.packageName)) {
                    return
                }
            }
        }

        private fun tryStartBrowserPackage(context: Context, uri: Uri, browserPkg: String): Boolean {
            return try {
                val browserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                    setPackage(browserPkg)
                    addCategory(Intent.CATEGORY_BROWSABLE)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(browserIntent)
                true
            } catch (_: Exception) {
                false
            }
        }

        private fun isPackageInstalled(context: Context, targetPkg: String): Boolean {
            if (targetPkg.isBlank()) return false
            return try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    context.packageManager.getPackageInfo(
                        targetPkg,
                        PackageManager.PackageInfoFlags.of(0)
                    )
                } else {
                    @Suppress("DEPRECATION")
                    context.packageManager.getPackageInfo(targetPkg, 0)
                }
                true
            } catch (_: PackageManager.NameNotFoundException) {
                false
            }
        }

        fun detectInstalledBrowsers(context: Context): List<DetectedBrowser> {
            val pm = context.packageManager
            val probeIntent = Intent(Intent.ACTION_VIEW, Uri.parse("http://www.example.com")).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
            }

            val resolveInfos = try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    pm.queryIntentActivities(
                        probeIntent,
                        PackageManager.ResolveInfoFlags.of(PackageManager.MATCH_ALL.toLong())
                    )
                } else {
                    @Suppress("DEPRECATION")
                    pm.queryIntentActivities(probeIntent, PackageManager.MATCH_ALL)
                }
            } catch (_: Exception) {
                emptyList()
            }

            val seenPackages = mutableSetOf<String>()
            val browsers = mutableListOf<DetectedBrowser>()

            for (info in resolveInfos) {
                val pkg = info.activityInfo?.packageName ?: continue
                if (pkg == context.packageName || !seenPackages.add(pkg)) continue
                val label = try {
                    info.loadLabel(pm).toString().takeIf { it.isNotBlank() } ?: pkg
                } catch (_: Exception) {
                    pkg
                }
                browsers.add(DetectedBrowser(appName = label, packageName = pkg))
            }

            return browsers
        }
    }
}

@Composable
fun ConfirmRedirectOverlayScreen(
    translated: TranslatedLinkResult,
    service: ServiceRoute,
    targetPackage: String,
    onConfirmRedirect: () -> Unit,
    onOpenInBrowserInstead: () -> Unit,
    onCancelStay: () -> Unit
) {
    val backdropInteraction = remember { MutableInteractionSource() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0x99050811))
            .clickable(
                interactionSource = backdropInteraction,
                indication = null,
                onClick = onCancelStay
            )
            .padding(16.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = {}
                ),
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(
                containerColor = Color(0xFF0F172A)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 12.dp)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    text = "Xác nhận chuyển hướng sang \${service.shortActionLabel}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = "Phát hiện liên kết \${service.title} (\${translated.linkSubType}). Nhấn nút Đồng ý bên dưới để mở trong ứng dụng đích:",
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF94A3B8)
                )

                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF1E293B), shape = RoundedCornerShape(12.dp))
                        .padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "Ứng dụng đích: $targetPackage",
                        style = MaterialTheme.typography.labelMedium,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFF34D399)
                    )
                    Text(
                        text = translated.normalizedHttpsUrl,
                        style = MaterialTheme.typography.labelSmall,
                        fontFamily = FontFamily.Monospace,
                        color = Color(0xFFCBD5E1),
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.height(2.dp))

                Button(
                    onClick = onConfirmRedirect,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF10B981),
                        contentColor = Color(0xFF04130E)
                    )
                ) {
                    Text(
                        text = "Đồng ý mở \${service.shortActionLabel}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onOpenInBrowserInstead,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "Mở Trình duyệt",
                            style = MaterialTheme.typography.labelMedium
                        )
                    }

                    TextButton(
                        onClick = onCancelStay,
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = "Ở lại / Đóng",
                            style = MaterialTheme.typography.labelMedium,
                            color = Color(0xFF94A3B8)
                        )
                    }
                }
            }
        }
    }
}`;

  const mainActivityKt = `package ${config.applicationId}

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
            prefs.getString(RouterActivity.KEY_WALLPAPER_STYLE, "${config.wallpaperTheme}")
                ?: "${config.wallpaperTheme}"
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

    var confirmBeforeRedirect by remember {
        mutableStateOf(
            prefs.getBoolean(RouterActivity.KEY_CONFIRM_BEFORE_REDIRECT, true)
        )
    }

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
                                    text = "${config.appName}",
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

                // CARD 2: BẮT LINK NGAY BÊN TRÌNH DUYỆT & NÚT XÁC NHẬN ĐỒNG Ý MỞ YOUTUBE
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xBF111827)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "2. Hiện nút 'Đồng ý' trước khi chuyển sang YouTube",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = if (confirmBeforeRedirect) {
                                        "ĐANG BẬT: Khi phát hiện link YouTube / Nhạc, sẽ hiện nút bấm 'Đồng ý mở YouTube' nổi trên màn hình. Bạn nhấn Đồng ý mới chuyển sang ứng dụng."
                                    } else {
                                        "ĐANG TẮT: Tự động chuyển thẳng sang YouTube Mod ngay lập tức không hỏi xác nhận."
                                    },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (confirmBeforeRedirect) {
                                        MaterialTheme.colorScheme.primary
                                    } else {
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                    }
                                )
                            }

                            Switch(
                                checked = confirmBeforeRedirect,
                                onCheckedChange = { enabled ->
                                    confirmBeforeRedirect = enabled
                                    prefs.edit()
                                        .putBoolean(RouterActivity.KEY_CONFIRM_BEFORE_REDIRECT, enabled)
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
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Bắt link YouTube ngay TRONG Trình duyệt",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = if (inBrowserAccessibilityActive) {
                                        "ĐANG HOẠT ĐỘNG: Khi bấm vào video/Shorts trong Chrome, sẽ hiện thanh nút bấm 'Đồng ý mở YouTube' ngay phía dưới trình duyệt!"
                                    } else {
                                        "CHƯA BẬT TRỢ NĂNG: Bật mục này để khi đang lướt Chrome / Brave / Firefox mà bấm vào video YouTube thì hiện nút chuyển sang YouTube Mod."
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
                                                text = "\${browser.appName} (\${browser.packageName})",
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
                                        text = "\${index + 1}. \${route.title}",
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
            "Không thể mở Cài đặt Hỗ trợ tiếp cận: \${e.localizedMessage}",
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

  const accessibilityBrowserInterceptorXml = `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged|typeWindowContentChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagReportViewIds|flagIncludeNotImportantViews"
    android:canRetrieveWindowContent="true"
    android:description="@string/accessibility_service_description"
    android:notificationTimeout="80"
    android:settingsActivity="${config.applicationId}.MainActivity" />`;

  const stringsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${config.appName}</string>
    <string name="accessibility_service_label">${config.appName} - Bắt link trong Trình duyệt</string>
    <string name="accessibility_service_description">Tự động phát hiện khi bạn bấm vào link YouTube, YouTube Music, Spotify ngay bên trong trình duyệt (Chrome, Brave, Firefox, Samsung Internet...) và chuyển thẳng sang ứng dụng Mod tương ứng.</string>
</resources>`;

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
        versionCode = 5
        versionName = "5.0.0"

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

  const rootBuildGradleKts = `plugins {
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
          tag_name: v5.0.\${{ github.run_number }}
          name: "${config.appName} APK #\${{ github.run_number }}"
          body: |
            ### Bản dựng tự động ${config.appName} (Đầy đủ Đường liên kết mặc định & Sửa lỗi văng Chrome)
            - **AndroidManifest.xml:** Khai báo tường minh 25+ đường liên kết mặc định trong \`RouterActivity\` để mục **Mở theo mặc định -> Thêm đường liên kết** luôn hiện đầy đủ.
            - **BrowserUrlInterceptorService.kt:** Đã xóa lệnh tự bấm Back sau 120ms (nguyên nhân làm YouTube Morphe bị đóng ngược về Chrome) và khóa chống lặp tuyệt đối theo ID video.
          files: app/build/outputs/apk/debug/app-debug.apk
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}`;

  const icLauncherXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`;

  const icLauncherBgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:aapt="http://schemas.android.com/aapt"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path android:pathData="M0,0h108v108h-108z">
        <aapt:attr name="android:fillColor">
            <gradient
                android:endX="108"
                android:endY="108"
                android:startX="0"
                android:startY="0"
                android:type="linear">
                <item android:color="#FF07111E" android:offset="0.0" />
                <item android:color="#FF0C262B" android:offset="0.55" />
                <item android:color="#FF090D16" android:offset="1.0" />
            </gradient>
        </aapt:attr>
    </path>
    <path
        android:fillColor="#1A10B981"
        android:pathData="M54,54m-38,0a38,38 0,1 1,76 0a38,38 0,1 1,-76 0" />
</vector>`;

  const icLauncherFgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group
        android:pivotX="54"
        android:pivotY="54"
        android:scaleX="0.92"
        android:scaleY="0.92">
        <path
            android:fillColor="#FF10B981"
            android:pathData="M54,22 L80,37 L80,71 L54,86 L28,71 L28,37 Z" />
        <path
            android:fillColor="#FF09131F"
            android:pathData="M54,27 L75.5,39.5 L75.5,68.5 L54,81 L32.5,68.5 L32.5,39.5 Z" />
        <path
            android:fillColor="#FF34D399"
            android:pathData="M43,41 L64,54 L43,67 Z" />
        <path
            android:strokeColor="#FFFFFFFF"
            android:strokeWidth="3.5"
            android:strokeLineCap="round"
            android:strokeLineJoin="round"
            android:pathData="M58,42 L70,42 L70,54" />
        <path
            android:strokeColor="#FFFFFFFF"
            android:strokeWidth="3.5"
            android:strokeLineCap="round"
            android:strokeLineJoin="round"
            android:pathData="M56,56 L70,42" />
    </group>
</vector>`;

  return [
    {
      path: 'app/src/main/AndroidManifest.xml',
      title: 'AndroidManifest.xml (Đầy đủ 25+ Đường link mặc định)',
      language: 'xml',
      category: 'core',
      description:
        'Đã xóa bộ lọc http/https rỗng host (nguyên nhân làm trống danh sách Mở theo mặc định trên Android 12+) và khai báo tường minh toàn bộ 25+ đường link mặc định ngay trong RouterActivity.',
      content: manifestXml,
    },
    {
      path: `app/src/main/java/${pkgPath}/BrowserUrlInterceptorService.kt`,
      title: 'BrowserUrlInterceptorService.kt (Đã sửa lỗi văng Chrome)',
      language: 'kotlin',
      category: 'core',
      description:
        'Đã xóa lệnh performGlobalAction(GLOBAL_ACTION_BACK) sau 120ms (nguyên nhân bấm Back nhầm vào YouTube Morphe làm văng ngược về Chrome) và chống lặp tuyệt đối theo ID video.',
      content: browserUrlInterceptorServiceKt,
    },
    {
      path: `app/src/main/java/${pkgPath}/RouterActivity.kt`,
      title: 'RouterActivity.kt',
      language: 'kotlin',
      category: 'core',
      description:
        'Tự động chuẩn hóa m.youtube.com sang www.youtube.com để YouTube Morphe mở thẳng video/Shorts và có sẵn hằng số DEFAULT_SAMPLE_YOUTUBE_URL.',
      content: routerActivityKt,
    },
    {
      path: `app/src/main/java/${pkgPath}/MainActivity.kt`,
      title: 'MainActivity.kt',
      language: 'kotlin',
      category: 'core',
      description:
        'Giao diện cài đặt có điền sẵn Đường link mặc định để kiểm tra ngay, nút mở "Mở theo mặc định" hiển thị đủ 25+ tên miền và công tắc Bắt link trong trình duyệt.',
      content: mainActivityKt,
    },
    {
      path: 'app/src/main/res/xml/accessibility_browser_interceptor.xml',
      title: 'accessibility_browser_interceptor.xml',
      language: 'xml',
      category: 'core',
      description:
        'Cấu hình AccessibilityService đọc thanh địa chỉ trình duyệt.',
      content: accessibilityBrowserInterceptorXml,
    },
    {
      path: 'app/src/main/res/values/strings.xml',
      title: 'strings.xml',
      language: 'xml',
      category: 'core',
      description:
        'Khai báo tên ứng dụng và mô tả hiển thị trong Cài đặt Hỗ trợ tiếp cận.',
      content: stringsXml,
    },
    {
      path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
      title: 'ic_launcher_foreground.xml (Logo Foreground)',
      language: 'xml',
      category: 'core',
      description:
        'Vector Drawable biểu tượng chính thức của ứng dụng Link Dispatcher.',
      content: icLauncherFgXml,
    },
    {
      path: 'app/src/main/res/drawable/ic_launcher_background.xml',
      title: 'ic_launcher_background.xml (Logo Background)',
      language: 'xml',
      category: 'core',
      description: 'Vector Drawable nền chuyển sắc cho Adaptive Icon.',
      content: icLauncherBgXml,
    },
    {
      path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
      title: 'ic_launcher.xml (Adaptive Icon)',
      language: 'xml',
      category: 'core',
      description: 'Cấu hình Adaptive Launcher Icon chuẩn cho Android 8.0+.',
      content: icLauncherXml,
    },
    {
      path: 'app/build.gradle.kts',
      title: 'app/build.gradle.kts',
      language: 'gradle',
      category: 'gradle',
      description:
        'Cấu hình Module-level Gradle: compileSdk 34, targetSdk 34, Java 17, Compose Material 3.',
      content: appBuildGradleKts,
    },
    {
      path: 'build.gradle.kts',
      title: 'build.gradle.kts (Project)',
      language: 'gradle',
      category: 'gradle',
      description:
        'Cấu hình Project-level Gradle (AGP 8.5.2, Kotlin 2.0.20).',
      content: rootBuildGradleKts,
    },
    {
      path: 'settings.gradle.kts',
      title: 'settings.gradle.kts',
      language: 'gradle',
      category: 'gradle',
      description:
        'Khai báo repositories và tên dự án gốc LinkDispatcher.',
      content: settingsGradleKts,
    },
    {
      path: 'gradle/wrapper/gradle-wrapper.properties',
      title: 'gradle-wrapper.properties',
      language: 'properties',
      category: 'gradle',
      description: 'Cấu hình phiên bản Gradle 8.7.',
      content: gradleWrapperProperties,
    },
    {
      path: 'gradle.properties',
      title: 'gradle.properties',
      language: 'properties',
      description: 'Khai báo thuộc tính JVM Args và AndroidX.',
      category: 'gradle',
      content: gradleProperties,
    },
    {
      path: '.github/workflows/build-apk.yml',
      title: '.github/workflows/build-apk.yml',
      language: 'yaml',
      category: 'ci',
      description:
        'GitHub Actions Workflow tự động build APK và tạo Release.',
      content: githubWorkflowYml,
    },
  ];
}
