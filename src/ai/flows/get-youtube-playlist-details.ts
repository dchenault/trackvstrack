'use server';
/**
 * @fileOverview A utility to retrieve playlist details from a YouTube URL.
 *
 * - fetchYoutubePlaylistDetails - Fetches metadata and tracks for a given YouTube playlist URL.
 */
import { z } from 'genkit';

export const GetYoutubePlaylistDetailsInputSchema = z.object({
  url: z.string().url().describe("The YouTube playlist URL"),
});
export type GetYoutubePlaylistDetailsInput = z.infer<typeof GetYoutubePlaylistDetailsInputSchema>;

type YoutubePlaylistDetails = {
    playlistId: string;
    title: string;
    image: string;
    tracks: string[];
}

function extractPlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
}

export async function fetchYoutubePlaylistDetails(input: GetYoutubePlaylistDetailsInput): Promise<YoutubePlaylistDetails> {
    const playlistId = extractPlaylistId(input.url);

    if (!playlistId) {
        throw new Error("Invalid YouTube playlist URL. Could not find a 'list' parameter.");
    }
    
    // 1. Fetch Playlist Metadata
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!playlistRes.ok) {
      const errorBody = await playlistRes.text();
      console.error("YouTube API Error (Playlist):", errorBody);
      throw new Error(`Failed to fetch playlist metadata (status: ${playlistRes.status}).`);
    }

    const playlistData = await playlistRes.json();

    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error("YouTube playlist not found or it is private.");
    }
    
    const playlist = playlistData.items[0];
    const albumTitle = playlist.snippet.title;
    const albumArt =
      playlist.snippet.thumbnails?.maxres?.url ||
      playlist.snippet.thumbnails?.high?.url ||
      playlist.snippet.thumbnails?.default?.url ||
      "";

    // 2. Fetch Playlist Tracks
    const itemsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!itemsRes.ok) {
       const errorBody = await itemsRes.text();
       console.error("YouTube API Error (PlaylistItems):", errorBody);
       throw new Error(`Failed to fetch playlist tracks (status: ${itemsRes.status}).`);
    }

    const itemsData = await itemsRes.json();
    const tracks: string[] =
      itemsData.items
        ?.map((item: any) => item.snippet?.title)
        .filter(Boolean) || [];

    if (tracks.length === 0) {
      throw new Error("No tracks found in the playlist. The playlist might be empty.");
    }

    if (tracks.length % 2 !== 0 && tracks.length > 1) {
      // Brackets must have an even number of tracks. Remove the last one.
      tracks.pop();
    }

    if (tracks.length < 2) {
      throw new Error("Playlists must have at least 2 tracks to form a bracket.");
    }

    // 3. Return safe JSON
    return {
        playlistId,
        title: albumTitle,
        image: albumArt,
        tracks: tracks,
    };
}
