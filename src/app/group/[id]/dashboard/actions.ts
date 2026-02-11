'use server';

export async function addAlbumBracket(formData: FormData) {
  try {
    const url = formData.get("url")?.toString();

    console.log("URL RECEIVED:", url);
    console.log("YOUTUBE API KEY EXISTS:", !!process.env.YOUTUBE_API_KEY);

    if (!url) {
      return { success: false, error: "No URL provided" };
    }

    const playlistIdMatch = url.match(/[?&]list=([^&]+)/);
    const playlistId = playlistIdMatch ? playlistIdMatch[1] : null;

    if (!playlistId) {
      return { success: false, error: "Invalid playlist URL" };
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return { success: false, error: "Missing YOUTUBE_API_KEY" };
    }

    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${apiKey}`
    );

    const playlistText = await playlistRes.text();

    console.log("PLAYLIST RESPONSE:", playlistText);

    if (!playlistRes.ok) {
      return { success: false, error: "YouTube API error" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("SERVER ACTION CRASH:", err);

    return {
      success: false,
      error: err?.message || "Unknown server error",
    };
  }
}
