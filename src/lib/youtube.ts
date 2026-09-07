/**
 * Tiny YouTube helpers shared by the admin Call Recordings upload flow.
 */

const YT_ID_RE = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/;

// Real browser UA. YouTube's oEmbed endpoint sometimes refuses / rate-limits
// requests from Vercel serverless IPs when they carry an obviously-non-browser
// UA, which was returning empty titles.
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(YT_ID_RE);
  return m ? m[1] : null;
}

export interface OEmbedResult {
  title: string;
  author_name?: string;
  thumbnail_url?: string;
}

async function fetchYouTubeOEmbed(youtubeId: string): Promise<OEmbedResult | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`;
  try {
    const res = await fetch(oEmbedUrl, { headers: { 'User-Agent': BROWSER_UA } });
    if (!res.ok) {
      console.warn(`[youtube] oEmbed non-ok status: ${res.status} for ${youtubeId}`);
      return null;
    }
    return (await res.json()) as OEmbedResult;
  } catch (err) {
    console.warn('[youtube] oEmbed threw:', err);
    return null;
  }
}

async function fetchNoembedFallback(youtubeId: string): Promise<OEmbedResult | null> {
  const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
  const url = `https://noembed.com/embed?url=${encodeURIComponent(watchUrl)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': BROWSER_UA } });
    if (!res.ok) {
      console.warn(`[youtube] noembed non-ok status: ${res.status} for ${youtubeId}`);
      return null;
    }
    const data = (await res.json()) as { title?: string; author_name?: string; thumbnail_url?: string; error?: string };
    if (data.error || !data.title) return null;
    return {
      title: data.title,
      author_name: data.author_name,
      thumbnail_url: data.thumbnail_url,
    };
  } catch (err) {
    console.warn('[youtube] noembed threw:', err);
    return null;
  }
}

export async function fetchOEmbed(youtubeId: string): Promise<OEmbedResult | null> {
  const primary = await fetchYouTubeOEmbed(youtubeId);
  if (primary && primary.title) return primary;
  const fallback = await fetchNoembedFallback(youtubeId);
  if (fallback && fallback.title) return fallback;
  return null;
}
