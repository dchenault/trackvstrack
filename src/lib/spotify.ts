
import SpotifyWebApi from 'spotify-web-api-node';
import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: `${process.env.BASE_URL}/api/spotify/callback`,
});

interface SpotifyTokens {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

/**
 * Retrieves Spotify tokens for a given user from Firestore.
 */
async function getTokens(userId: string): Promise<SpotifyTokens | null> {
    const tokenDoc = await adminDb.collection('spotify_tokens').doc(userId).get();
    if (!tokenDoc.exists) {
        return null;
    }
    return tokenDoc.data() as SpotifyTokens;
}

/**
 * Returns an authenticated Spotify API client.
 * It automatically handles token retrieval and refreshing.
 */
export async function getSpotifyApi(userId: string): Promise<SpotifyWebApi> {
    const tokens = await getTokens(userId);

    if (!tokens) {
        throw new Error('User not connected to Spotify.');
    }

    const client = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    
    client.setAccessToken(tokens.access_token);
    client.setRefreshToken(tokens.refresh_token);

    // Check if the token is expired (or close to expiring)
    if (Date.now() >= tokens.expires_at) {
        console.log('Spotify token expired, refreshing...');
        const data = await client.refreshAccessToken();
        const newAccessToken = data.body['access_token'];
        const newExpiresIn = data.body['expires_in'];
        const newExpiresAt = Date.now() + newExpiresIn * 1000;

        client.setAccessToken(newAccessToken);

        // Update the new token details in Firestore
        await adminDb.collection('spotify_tokens').doc(userId).update({
            access_token: newAccessToken,
            expires_at: newExpiresAt,
        });
        console.log('Spotify token refreshed and updated.');
    }

    return client;
}

/**
 * Extracts Spotify Album ID from a URL.
 */
export function extractAlbumIdFromUrl(url: string): string | null {
    try {
        const path = new URL(url).pathname;
        const match = path.match(/\/album\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

/**
 * Extracts Spotify Playlist ID from a URL.
 */
export function extractPlaylistIdFromUrl(url: string): string | null {
    try {
        const path = new URL(url).pathname;
        const match = path.match(/\/playlist\/([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}
