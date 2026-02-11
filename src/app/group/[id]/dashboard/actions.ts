'use server';

import { getAlbumDetails } from '@/ai/flows/get-album-details';
import { getYoutubePlaylistDetails } from '@/ai/flows/get-youtube-playlist-details';
import type { Album } from '@/lib/types';

async function fetchAlbumData(url: string): Promise<Album> {
  // Simple URL check to determine source
  if (url.includes('spotify.com')) {
    return await getAlbumDetails({ url });
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return await getYoutubePlaylistDetails({ url });
  } else if (url.includes('musicbrainz.org')) {
    throw new Error('MusicBrainz integration is not implemented yet.');
  } else {
    throw new Error('Unsupported URL. Please use a Spotify, YouTube, or MusicBrainz URL.');
  }
}

export async function addAlbumBracket(formData: FormData) {
  console.log("SERVER ACTION STARTED");
  try {
    const url = formData.get("url") as string;
    if (!url) throw new Error("URL is required.");
    console.log("STEP 1 - Got URL:", url);

    const result = await fetchAlbumData(url);
    console.log("STEP 2 - Fetched album data");

    const safeResult = JSON.parse(JSON.stringify(result));
    console.log("STEP 3 - Serialized result, preparing to return");

    return {
      success: true,
      result: safeResult,
    };
  } catch (error) {
    console.error("CRASHED HERE:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown server error",
    };
  }
}
