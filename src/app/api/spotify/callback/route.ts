import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import SpotifyWebApi from 'spotify-web-api-node';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
        return NextResponse.redirect(new URL('/?error=Invalid_State_Or_Code', req.url));
    }
    
    // 1. Verify state
    const stateDocRef = adminDb.collection('spotify_auth_states').doc(state);
    const stateDoc = await stateDocRef.get();

    if (!stateDoc.exists) {
        console.error('Spotify callback error: State mismatch or not found.');
        return NextResponse.redirect(new URL('/?error=State_Mismatch', req.url));
    }

    const { ownerId, groupId } = stateDoc.data()!;
    await stateDocRef.delete(); // State is single-use

    // 2. Exchange code for tokens
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        redirectUri: `${process.env.NEXT_PUBLIC_URL}/api/spotify/callback`,
    });

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token, expires_in } = data.body;
        
        // 3. Store tokens in Firestore
        const expiresAt = Date.now() + expires_in * 1000;
        const tokenDocRef = adminDb.collection('spotify_tokens').doc(ownerId);
        
        await tokenDocRef.set({
            access_token,
            refresh_token,
            expires_at: expiresAt,
        });

        console.log(`Successfully stored Spotify tokens for user ${ownerId}`);

        // 4. Redirect back to the dashboard
        const dashboardUrl = new URL(`/group/${groupId}/dashboard`, req.url);
        return NextResponse.redirect(dashboardUrl);

    } catch (error) {
        console.error('Error during Spotify token exchange:', error);
        const errorUrl = new URL(`/group/${groupId}/dashboard?error=token_exchange_failed`, req.url);
        return NextResponse.redirect(errorUrl);
    }
}
