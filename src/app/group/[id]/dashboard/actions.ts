'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Bracket, Album, Track } from '@/lib/types';
import { getSpotifyApi, extractAlbumIdFromUrl } from '@/lib/spotify';
import crypto from 'crypto';

/**
 * Creates a redirect URL for Spotify authorization.
 * Stores a temporary state in Firestore to prevent CSRF attacks.
 */
export async function getSpotifyRedirectUrl(groupId: string, ownerId: string) {
    console.log('getSpotifyRedirectUrl called for owner:', ownerId);
    try {
        const state = crypto.randomBytes(16).toString('hex');
        const stateDocRef = adminDb.collection('spotify_auth_states').doc(state);

        await stateDocRef.set({
            ownerId,
            groupId,
            createdAt: FieldValue.serverTimestamp(),
        });
        
        const scopes = ['user-read-private', 'user-read-email'];
        const redirectUri = `${process.env.BASE_URL}/api/spotify/callback`;
        
        const authUrl = new URL('https://accounts.spotify.com/authorize');
        authUrl.searchParams.append('response_type', 'code');
        authUrl.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID!);
        authUrl.searchParams.append('scope', scopes.join(' '));
        authUrl.searchParams.append('redirect_uri', redirectUri);
        authUrl.searchParams.append('state', state);

        console.log('Generated Spotify auth URL');
        return { success: true, url: authUrl.toString() };
    } catch (error) {
        console.error('Error creating Spotify redirect URL:', error);
        return { success: false, error: 'Could not connect to Spotify.' };
    }
}


/**
 * Fetches album data from Spotify and creates a new bracket in Firestore.
 */
export async function addAlbumBracket(formData: FormData) {
  const groupId = formData.get('groupId')?.toString();
  const url = formData.get('url')?.toString();
  const ownerId = formData.get('ownerId')?.toString();

  if (!groupId || !url || !ownerId) {
    return { success: false, error: 'Group ID, URL, and Owner ID are required.' };
  }
  
  try {
    const albumId = extractAlbumIdFromUrl(url);
    if (!albumId) {
        throw new Error('Invalid Spotify Album URL.');
    }

    const spotifyApi = await getSpotifyApi(ownerId);
    const { body: albumData } = await spotifyApi.getAlbum(albumId);
    
    const albumTracks: Track[] = albumData.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        trackNumber: track.track_number,
        previewUrl: track.preview_url,
    }));

    if (albumTracks.length < 2) {
      throw new Error("Playlists must have at least 2 tracks to form a bracket.");
    }
    
    // Ensure even number of tracks for the bracket
    if (albumTracks.length % 2 !== 0) {
        albumTracks.pop();
    }
    
    const album: Album = {
        id: albumData.id,
        name: albumData.name,
        artist: albumData.artists.map(a => a.name).join(', '),
        artists: albumData.artists.map(a => ({ name: a.name })),
        artworkUrl: albumData.images?.[0]?.url || '',
        tracks: albumTracks,
    };

    const bracketId = `${groupId.substring(0, 5)}-${album.id.substring(0,5)}-${Date.now()}`;
    
    const newBracket: Bracket = {
        id: bracketId,
        album: album,
        rounds: [],
        status: 'pending',
        winner: null,
    };

    const groupRef = adminDb.collection('groups').doc(groupId);

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
