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
  serviceId: ServiceRouteId;
  serviceTitle: string;
  extractedId: string | null;
  playlistId: string | null;
  timestampSeconds: string | null;
  nativeSchemeUri: string | null;
  linkType: string;
  host: string | null;
}

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
      { label: 'Mở bằng Web (Để trống)', pkg: '' },
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
      { label: 'Mở bằng Web (Để trống)', pkg: '' },
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
      { label: 'Mở bằng Web (Để trống)', pkg: '' },
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
      { label: 'Mở bằng Web (Để trống)', pkg: '' },
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
      { label: 'Mở bằng Web (Để trống)', pkg: '' },
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
      serviceId: 'youtube_video',
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

    // 2. Spotify
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

    // 3. Facebook
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

    // 4. Social Media (TikTok, Instagram, Threads, X, Reddit)
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

    // 5. Default: YouTube Video
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

    const nativeSchemeUri = videoId
      ? timestampSeconds
        ? `vnd.youtube:${videoId}?t=${timestampSeconds}`
        : `vnd.youtube:${videoId}`
      : null;

    return {
      originalInput: input,
      extractedUrl: candidate,
      normalizedHttpsUrl,
      serviceId: 'youtube_video',
      serviceTitle: 'YouTube Video',
      extractedId: videoId,
      playlistId,
      timestampSeconds,
      nativeSchemeUri,
      linkType,
      host,
    };
  } catch {
    return {
      originalInput: input,
      extractedUrl: null,
      normalizedHttpsUrl: null,
      serviceId: 'youtube_video',
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
      'com.android.chrome',
      'com.brave.browser',
      'org.mozilla.firefox',
      'com.microsoft.emmx',
      'com.sec.android.app.sbrowser',
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
      để kiểm tra trạng thái cài đặt và chuyển tiếp mượt mà trong mili-giây.
    -->
    <queries>
${queriesPackagesXml}

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
          2. RouterActivity: Dùng Theme.NoDisplay (như phiên bản đầu) để chuyển tiếp
          tức thì không tạo cửa sổ giao diện, không giật khung hình và tự đóng ngay.
        -->
        <activity
            android:name=".RouterActivity"
            android:exported="true"
            android:excludeFromRecents="true"
            android:noHistory="true"
            android:theme="@android:style/Theme.NoDisplay">

            <!-- Hỗ trợ nhận link với tư cách Default Browser / Generic HTTP & HTTPS Handler -->
            <intent-filter android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="http" />
                <data android:scheme="https" />
            </intent-filter>

            <!-- Đón bắt thao tác Share link (ACTION_SEND) từ Zalo, Messenger, Trình duyệt -->
            <intent-filter android:priority="${config.intentPriority}">
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>
        </activity>

        <!--
          ======================================================================
          CÁC ACTIVITY-ALIAS ĐỘC LẬP CHO TỪNG LUỒNG DỊCH VỤ:
          Khi bản Mod của một luồng chưa được cài đặt hoặc người dùng gạt nút Tắt,
          hệ thống sẽ tự động vô hiệu hóa ComponentName của alias đó (DISABLED).
          ======================================================================
        -->

        <!-- ALIAS 1: YOUTUBE VIDEO (youtube.com, m.youtube.com, www.youtube.com, youtu.be) -->
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
                <data android:pathPattern=".*" />
            </intent-filter>
        </activity-alias>

        <!-- ALIAS 2: YOUTUBE MUSIC (music.youtube.com) -->
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
                <data android:pathPattern=".*" />
            </intent-filter>
        </activity-alias>

        <!-- ALIAS 3: SPOTIFY (open.spotify.com, spotify.link, spoti.fi) -->
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
                <data android:pathPattern=".*" />
            </intent-filter>
        </activity-alias>

        <!-- ALIAS 4: FACEBOOK (facebook.com, m.facebook.com, fb.watch, fb.com) -->
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
                <data android:pathPattern=".*" />
            </intent-filter>
        </activity-alias>

        <!-- ALIAS 5: MẠNG XÃ HỘI KHÁC (TikTok, Instagram, Threads, X/Twitter, Reddit) -->
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
                <data android:pathPattern=".*" />
            </intent-filter>
        </activity-alias>

    </application>

</manifest>`;

  const routerActivityKt = `package ${config.applicationId}

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import java.util.regex.Pattern

/**
 * Danh mục các dịch vụ (luồng điều hướng) được hỗ trợ
 */
enum class ServiceRoute(
    val id: String,
    val title: String,
    val aliasClassName: String,
    val defaultPackage: String,
    val defaultEnabled: Boolean,
    val suggestedPackages: List<Pair<String, String>>
) {
    YOUTUBE_VIDEO(
        id = "youtube_video",
        title = "YouTube Video",
        aliasClassName = "${config.applicationId}.RouteYoutubeVideoAlias",
        defaultPackage = "${ytVideo.targetPackage}",
        defaultEnabled = ${ytVideo.enabled},
        suggestedPackages = listOf(
            "YouTube Morphe (Mod)" to "app.morphe.android.youtube",
            "YouTube ReVanced (Mod)" to "app.revanced.android.youtube",
            "RVX YouTube (Mod)" to "app.rvx.android.youtube",
            "YouTube Thường" to "com.google.android.youtube",
            "NewPipe" to "org.schabi.newpipe",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    YOUTUBE_MUSIC(
        id = "youtube_music",
        title = "YouTube Music",
        aliasClassName = "${config.applicationId}.RouteYoutubeMusicAlias",
        defaultPackage = "${ytMusic.targetPackage}",
        defaultEnabled = ${ytMusic.enabled},
        suggestedPackages = listOf(
            "RVX Music (Mod)" to "app.rvx.android.apps.youtube.music",
            "ReVanced Music (Mod)" to "app.revanced.android.apps.youtube.music",
            "Morphe Music (Mod)" to "app.morphe.android.apps.youtube.music",
            "YouTube Music Thường" to "com.google.android.apps.youtube.music",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    SPOTIFY(
        id = "spotify",
        title = "Spotify",
        aliasClassName = "${config.applicationId}.RouteSpotifyAlias",
        defaultPackage = "${spotify.targetPackage}",
        defaultEnabled = ${spotify.enabled},
        suggestedPackages = listOf(
            "Spotify / xManager" to "com.spotify.music",
            "Spotify Lite" to "com.spotify.lite",
            "Spotube" to "oss.krtirtho.spotube",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    FACEBOOK(
        id = "facebook",
        title = "Facebook & Watch",
        aliasClassName = "${config.applicationId}.RouteFacebookAlias",
        defaultPackage = "${facebook.targetPackage}",
        defaultEnabled = ${facebook.enabled},
        suggestedPackages = listOf(
            "Facebook" to "com.facebook.katana",
            "Facebook Lite" to "com.facebook.lite",
            "SlimSocial" to "it.rignanese.leo.slimfacebook",
            "Mở bằng Web (Để trống)" to ""
        )
    ),
    SOCIAL_MEDIA(
        id = "social_media",
        title = "Mạng xã hội (TikTok / IG / X / Reddit)",
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
            "Mở bằng Web (Để trống)" to ""
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

/**
 * RouterActivity kế thừa trực tiếp từ android.app.Activity với Theme.NoDisplay (như phiên bản đầu):
 * - Không khởi tạo cửa sổ giao diện, chuyển tiếp siêu mượt trong vài mili-giây và gọi finish() ngay lập tức.
 * - KHÔNG tự mở app mặc định khi chưa cài bản Mod.
 * - KHÔNG hiển thị bảng báo lỗi "Không tìm thấy ứng dụng đích".
 * - Nếu gói đích (ví dụ app.morphe.android.youtube) chưa được cài đặt trên máy:
 *   tự động tắt luồng / vô hiệu hóa ComponentName của luồng đó và mở thẳng qua trình duyệt Web.
 */
class RouterActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        handleIncomingIntent(intent)
        finish()
    }

    private fun handleIncomingIntent(incomingIntent: Intent?) {
        val incomingUri = extractIncomingUri(incomingIntent) ?: return
        val translated = analyzeAndTranslateUri(incomingUri)
        val service = translated.service

        if (service == null) {
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isRouteEnabled = prefs.getBoolean(
            prefKeyRouteEnabled(service),
            service.defaultEnabled
        )

        if (!isRouteEnabled) {
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        val targetPackage = resolveTargetPackageForLink(prefs, service, translated.linkSubType)
        val useNativeScheme = prefs.getBoolean(KEY_USE_NATIVE_SCHEME, ${config.preferNativeSchemeDefault})

        prefs.edit()
            .putString(KEY_LAST_DISPATCHED_URL, translated.normalizedHttpsUrl)
            .putString(KEY_LAST_VIDEO_ID, translated.extractedId ?: service.title)
            .putInt(KEY_DISPATCH_COUNT, prefs.getInt(KEY_DISPATCH_COUNT, 0) + 1)
            .apply()

        if (targetPackage.isBlank()) {
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        // Nếu gói đích (ví dụ app.morphe.android.youtube) chưa cài đặt:
        // Tự động tắt luồng, vô hiệu hóa ComponentName của luồng đó và mở thẳng qua trình duyệt
        if (!isPackageInstalled(targetPackage)) {
            disableRouteAndAliasSilently(prefs, service)
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
            return
        }

        val launched = tryLaunchTargetPackage(
            translated = translated,
            targetPackage = targetPackage,
            preferNativeScheme = useNativeScheme
        )

        if (!launched) {
            disableRouteAndAliasSilently(prefs, service)
            openDirectlyInExternalBrowser(translated.normalizedHttpsUrl)
        }
    }

    private fun disableRouteAndAliasSilently(
        prefs: android.content.SharedPreferences,
        service: ServiceRoute
    ) {
        prefs.edit().putBoolean(prefKeyRouteEnabled(service), false).apply()
        try {
            val componentName = ComponentName(packageName, service.aliasClassName)
            packageManager.setComponentEnabledSetting(
                componentName,
                PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                PackageManager.DONT_KILL_APP
            )
        } catch (_: Exception) {
            // Bỏ qua
        }
    }

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

    private fun analyzeAndTranslateUri(rawUri: Uri): TranslatedLinkResult {
        var workingUri = rawUri
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
            val timestamp = workingUri.getQueryParameter("t") ?: workingUri.getQueryParameter("start")
            val vndUri = if (!videoId.isNullOrBlank()) {
                val base = "vnd.youtube:$videoId"
                Uri.parse(if (!timestamp.isNullOrBlank()) "$base?t=$timestamp" else base)
            } else null

            return TranslatedLinkResult(
                service = ServiceRoute.YOUTUBE_VIDEO,
                originalUrl = rawUri.toString(),
                normalizedHttpsUrl = httpsString,
                nativeSchemeUri = vndUri,
                extractedId = videoId ?: workingUri.getQueryParameter("list"),
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
                extractedId = resourceId,
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
                "INSTAGRAM" -> if (isPackageInstalled("com.instander.android")) "com.instander.android" else "com.instagram.android"
                "THREADS" -> "com.instagram.barcelona"
                "X_TWITTER" -> "com.twitter.android"
                "REDDIT" -> "com.reddit.frontpage"
                else -> configured
            }
        }
        return configured
    }

    private fun tryLaunchTargetPackage(
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
                addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            }
            try {
                startActivity(forwardIntent)
                return true
            } catch (_: ActivityNotFoundException) {
                // Thử URI kế tiếp
            } catch (_: Exception) {
                // Tiếp tục
            }
        }
        return false
    }

    private fun openDirectlyInExternalBrowser(httpsUrl: String) {
        val uri = Uri.parse(httpsUrl)
        val knownBrowsers = listOf(
            "com.android.chrome",
            "com.brave.browser",
            "org.mozilla.firefox",
            "com.microsoft.emmx",
            "com.sec.android.app.sbrowser",
            "com.opera.browser"
        )

        for (browserPkg in knownBrowsers) {
            if (isPackageInstalled(browserPkg)) {
                try {
                    val directBrowserIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                        setPackage(browserPkg)
                        addCategory(Intent.CATEGORY_BROWSABLE)
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                    }
                    startActivity(directBrowserIntent)
                    return
                } catch (_: Exception) {
                    // Thử trình duyệt tiếp theo
                }
            }
        }

        try {
            val genericIntent = Intent(Intent.ACTION_VIEW, uri).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            startActivity(genericIntent)
        } catch (_: Exception) {
            // Không hiển thị bảng báo lỗi
        }
    }

    private fun isPackageInstalled(targetPkg: String): Boolean {
        if (targetPkg.isBlank()) return false
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                packageManager.getPackageInfo(
                    targetPkg,
                    PackageManager.PackageInfoFlags.of(0)
                )
            } else {
                @Suppress("DEPRECATION")
                packageManager.getPackageInfo(targetPkg, 0)
            }
            true
        } catch (_: PackageManager.NameNotFoundException) {
            false
        }
    }

    companion object {
        const val PREFS_NAME = "link_dispatcher_prefs"
        const val KEY_USE_NATIVE_SCHEME = "use_vnd_scheme"
        const val KEY_WALLPAPER_STYLE = "wallpaper_style"
        const val KEY_LAST_DISPATCHED_URL = "last_dispatched_url"
        const val KEY_LAST_VIDEO_ID = "last_video_id"
        const val KEY_DISPATCH_COUNT = "dispatch_count"

        fun prefKeyRouteEnabled(route: ServiceRoute): String = "route_enabled_\${route.id}"
        fun prefKeyRoutePackage(route: ServiceRoute): String =
            if (route == ServiceRoute.YOUTUBE_VIDEO) "target_package" else "route_pkg_\${route.id}"

        private val URL_EXTRACT_PATTERN: Pattern =
            Pattern.compile("(https?://[\\\\w\\\\-._~:/?#\\\\[\\\\]@!$&'()*+,;=%]+)")
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

    var testUrl by remember {
        mutableStateOf("")
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
                                    text = "Điều hướng siêu mượt (Theme.NoDisplay & Default Browser)",
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
                // CARD 0: CHỌN HÌNH NỀN
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
                                                "Đã tự động tắt luồng (Chưa cài $currentPkg -> Mở thẳng bằng Trình duyệt)"
                                            isEnabled ->
                                                "Đang bật đón bắt liên kết"
                                            else ->
                                                "Đã tắt (ComponentName đã vô hiệu hóa)"
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

                            Text(
                                text = "Chọn nhanh Package đích hoặc để trống để mở bằng Trình duyệt:",
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
                                label = { Text("Package Name đích (Để trống = Mở bằng Web)") },
                                placeholder = { Text("Để trống để mở qua trình duyệt Web") },
                                singleLine = true,
                                modifier = Modifier.fillMaxWidth()
                            )

                            Text(
                                text = when {
                                    currentPkg.isBlank() ->
                                        "Chế độ Web: Đang để trống Package (Mở thẳng qua Trình duyệt)"
                                    isInstalled ->
                                        "Đã cài đặt \\"$currentPkg\\" trên thiết bị"
                                    else ->
                                        "Chưa cài \\"$currentPkg\\" -> Đã tự động vô hiệu hóa luồng & mở thẳng qua Trình duyệt"
                                },
                                style = MaterialTheme.typography.bodySmall,
                                color = if (currentPkg.isBlank() || isInstalled) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                }
                            )
                        }
                    }
                }

                // CARD CẤP QUYỀN MỞ THEO MẶC ĐỊNH / DEFAULT BROWSER
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
                            text = "Cài đặt 'Mở theo mặc định' / Trình duyệt mặc định",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "Nhờ hỗ trợ cả bộ lọc BROWSABLE http/https lẫn autoVerify, bạn có thể bật 'Mở đường liên kết được hỗ trợ' hoặc chọn làm ứng dụng điều hướng liên kết mặc định mượt như phiên bản đầu.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Button(
                            onClick = { openSystemDefaultLinksSettings(context) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Mở màn hình 'Mở theo mặc định' (Open by default)")
                        }
                        OutlinedButton(
                            onClick = { openDefaultAppsSettings(context) },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Mở cài đặt 'Ứng dụng mặc định' (Default Apps)")
                        }
                    }
                }

                // CARD KIỂM TRA NHANH INTENT
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
                            text = "Kiểm tra nhanh Chuyển tiếp",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )

                        OutlinedTextField(
                            value = testUrl,
                            onValueChange = { testUrl = it },
                            label = { Text("Nhập link cần thử nghiệm (Để trống mặc định)") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

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
}

private fun openDefaultAppsSettings(context: Context) {
    try {
        context.startActivity(Intent(Settings.ACTION_MANAGE_DEFAULT_APPS_SETTINGS))
    } catch (_: Exception) {
        openSystemDefaultLinksSettings(context)
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
        versionCode = 3
        versionName = "3.0.0"

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
          tag_name: v3.0.\${{ github.run_number }}
          name: "${config.appName} APK #\${{ github.run_number }}"
          body: |
            ### Bản dựng tự động ${config.appName} (Theme.NoDisplay & Default Browser)
            - **YouTube Video:** \`${ytVideo.targetPackage || 'Web Browser'}\`
            - **YouTube Music:** \`${ytMusic.targetPackage || 'Web Browser'}\`
            - **Spotify:** \`${spotify.targetPackage || 'Web Browser'}\`
            - **Facebook & MXH:** \`${facebook.targetPackage || 'Web Browser'}\`
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
            android:pathData="M56,56 L70,42" />
    </group>
</vector>`;

  return [
    {
      path: 'app/src/main/AndroidManifest.xml',
      title: 'AndroidManifest.xml',
      language: 'xml',
      category: 'core',
      description:
        'RouterActivity dùng Theme.NoDisplay kèm bộ lọc Default Browser (http/https BROWSABLE) và pathPattern=".*" trên 5 <activity-alias> để bắt link mặc định siêu mượt như phiên bản đầu.',
      content: manifestXml,
    },
    {
      path: `app/src/main/java/${pkgPath}/RouterActivity.kt`,
      title: 'RouterActivity.kt',
      language: 'kotlin',
      category: 'core',
      description:
        'Kế thừa android.app.Activity (Theme.NoDisplay): Không tự mở app mặc định; nếu chưa cài bản Mod sẽ tự động tắt ComponentName của luồng đó và mở thẳng qua trình duyệt mà không hiện bảng lỗi.',
      content: routerActivityKt,
    },
    {
      path: `app/src/main/java/${pkgPath}/MainActivity.kt`,
      title: 'MainActivity.kt',
      language: 'kotlin',
      category: 'core',
      description:
        'Giao diện Compose Material 3 có Logo, Hình nền đa lớp, tự động vô hiệu hóa ComponentName nếu gói đích chưa cài đặt, và nút mở cài đặt Default Apps / Open by default.',
      content: mainActivityKt,
    },
    {
      path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
      title: 'ic_launcher_foreground.xml (Logo Foreground)',
      language: 'xml',
      category: 'core',
      description:
        'Vector Drawable biểu tượng chính thức của ứng dụng Link Dispatcher (Nút Play kết hợp mũi tên chuyển hướng lục giác).',
      content: icLauncherFgXml,
    },
    {
      path: 'app/src/main/res/drawable/ic_launcher_background.xml',
      title: 'ic_launcher_background.xml (Logo Background)',
      language: 'xml',
      category: 'core',
      description: 'Vector Drawable nền chuyển sắc (Gradient) cho Adaptive Icon của ứng dụng.',
      content: icLauncherBgXml,
    },
    {
      path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
      title: 'ic_launcher.xml (Adaptive Icon)',
      language: 'xml',
      category: 'core',
      description: 'Cấu hình Adaptive Launcher Icon chuẩn cho Android 8.0+ (API 26+).',
      content: icLauncherXml,
    },
    {
      path: 'app/build.gradle.kts',
      title: 'app/build.gradle.kts',
      language: 'gradle',
      category: 'gradle',
      description:
        'Cấu hình Module-level Gradle: compileSdk 34, targetSdk 34, Java 17, Compose Compiler plugin và các thư viện Compose Material 3.',
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
      description: 'Khai báo thuộc tính JVM Args, AndroidX và Non-Transitive R Class.',
      category: 'gradle',
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
