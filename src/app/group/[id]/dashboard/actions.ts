
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Bracket, Album, Track } from '@/lib/types';
import { getSpotifyApi, extractAlbumIdFromUrl, extractPlaylistIdFromUrl } from '@/lib/spotify';
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
 * Fetches album or playlist data from Spotify and creates a new bracket in Firestore.
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
    const playlistId = extractPlaylistIdFromUrl(url);

    if (!albumId && !playlistId) {
        throw new Error('Invalid Spotify URL. Please provide a valid album or playlist URL.');
    }

    const spotifyApi = await getSpotifyApi(ownerId);
    let album: Album;

    if (albumId) {
        const { body: albumData } = await spotifyApi.getAlbum(albumId);
        
        const albumTracks: Track[] = albumData.tracks.items.map(track => ({
            id: track.id,
            name: track.name,
            trackNumber: track.track_number,
            previewUrl: track.preview_url,
        }));

        if (albumTracks.length < 2) {
            throw new Error("Content must have at least 2 tracks to form a bracket.");
        }
        
        album = {
            id: albumData.id,
            name: albumData.name,
            artist: albumData.artists.map(a => a.name).join(', '),
            artists: albumData.artists.map(a => ({ name: a.name })),
            artworkUrl: albumData.images?.[0]?.url || '',
            tracks: albumTracks,
        };
    } else if (playlistId) {
        const { body: playlistData } = await spotifyApi.getPlaylist(playlistId);

        let allTracks: Track[] = [];
        let offset = 0;
        const limit = 100;
        let response;
        do {
            response = await spotifyApi.getPlaylistTracks(playlistId, { offset, limit });
            const tracksFromPage = response.body.items
                .filter(item => item.track && item.track.type === 'track')
                .map((item, index) => ({
                    id: item.track!.id,
                    name: item.track!.name,
                    trackNumber: offset + index + 1,
                    previewUrl: item.track!.preview_url,
                }));
            
            allTracks = allTracks.concat(tracksFromPage);
            offset += response.body.items.length;
        } while (response.body.next);

        if (allTracks.length < 2) {
          throw new Error("Playlists must have at least 2 tracks to form a bracket.");
        }
        
        album = {
            id: playlistData.id,
            name: playlistData.name,
            artist: playlistData.owner.display_name || 'Various Artists',
            artists: [{ name: playlistData.owner.display_name || 'Various Artists' }],
            artworkUrl: playlistData.images?.[0]?.url || '',
            tracks: allTracks,
        };
    } else {
        // This case is already handled by the initial check, but included for completeness
        return { success: false, error: 'Invalid URL provided.' };
    }

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
    // Handle Spotify API specific errors which might not have a .message property
    const errorMessage = error.body?.error?.message || error.message || 'An unknown error occurred.';
    return { success: false, error: errorMessage };
  }
}
