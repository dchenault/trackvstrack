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
  try {
    const url = formData.get("url") as string;

    console.log("STEP 1: Got URL");

    const result = await fetchAlbumData(url);

    console.log("STEP 2: fetchAlbumData finished");

    return {
      success: true,
      result: "TEST_STRING_ONLY"
    };

  } catch (error) {
    console.error("SERVER CRASH:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
