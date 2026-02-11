'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { fetchYoutubePlaylistDetails } from '@/ai/flows/get-youtube-playlist-details';
import type { Bracket, Album } from '@/lib/types';

function createBracketFromPlaylist(playlistDetails: {
    playlistId: string;
    title: string;
    image: string;
    tracks: string[];
}, groupId: string): Bracket {
    const album: Album = {
        id: playlistDetails.playlistId,
        name: playlistDetails.title,
        artist: "Various Artists", // YouTube API for playlists doesn't reliably provide a single artist
        artworkUrl: playlistDetails.image,
        tracks: playlistDetails.tracks.map((trackName, index) => ({
            id: `${playlistDetails.playlistId}-${index}`,
            name: trackName,
            trackNumber: index + 1,
            previewUrl: null, // No preview URLs from YouTube playlist items
        })),
    };

    const bracketId = `${groupId.substring(0, 5)}-${playlistDetails.playlistId.substring(0,5)}-${Date.now()}`;
    
    const newBracket: Bracket = {
        id: bracketId,
        album: album,
        rounds: [],
        status: 'pending',
        winner: null,
    };

    return newBracket;
}


export async function addAlbumBracket(formData: FormData) {
  const groupId = formData.get('groupId')?.toString();
  const url = formData.get('url')?.toString();

  if (!groupId || !url) {
    return { success: false, error: 'Group ID and URL are required.' };
  }
  
  try {
    const playlistDetails = await fetchYoutubePlaylistDetails({ url });

    const newBracket = createBracketFromPlaylist(playlistDetails, groupId);

    const groupRef = adminDb.collection('groups').doc(groupId);

    // Atomically add the new bracket to the 'pendingBrackets' array
    await groupRef.update({
      pendingBrackets: FieldValue.arrayUnion(newBracket)
    });

    revalidatePath(`/group/${groupId}/dashboard`);
    return { success: true };

  } catch (error: any) {
    console.error('Error adding album bracket:', error);
    return { success: false, error: error.message || 'An unknown error occurred.' };
  }
}
