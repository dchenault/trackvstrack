'use server';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { fetchYoutubePlaylistDetails } from '@/ai/flows/get-youtube-playlist-details';
import type { Album, Bracket } from '@/lib/types';
import { shuffleArray } from '@/lib/utils';

// Initialize Firebase if not already initialized for server-side usage.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

const createBracketFromAlbum = (album: Album): Bracket => {
    const shuffledTracks = shuffleArray([...album.tracks]);
    
    const getRoundName = (numMatchups: number, roundNum: number): string => {
        if (numMatchups === 1) return 'Final';
        if (numMatchups === 2) return 'Semi-Finals';
        if (numMatchups === 4) return 'Quarter-Finals';
        if (numMatchups === 8) return 'Round of 16';
        return `Round ${roundNum}`;
    }

    const round1Matchups = [];
    for (let i = 0; i < shuffledTracks.length; i += 2) {
        round1Matchups.push({
            id: `m-r1-${i / 2}`,
            track1: shuffledTracks[i],
            track2: shuffledTracks[i + 1],
            winner: null,
            votes: { track1: 0, track2: 0 },
        });
    }

    const rounds = [
        { id: 'round-1', name: getRoundName(round1Matchups.length, 1), matchups: round1Matchups }
    ];

    let numMatchupsInPreviousRound = round1Matchups.length;
    let roundNum = 2;
    while(numMatchupsInPreviousRound > 1) {
        const numMatchupsInCurrentRound = numMatchupsInPreviousRound / 2;
        const currentRoundMatchups = [];
        for (let i=0; i<numMatchupsInCurrentRound; i++) {
            currentRoundMatchups.push({
                id: `m-r${roundNum}-${i}`,
                track1: null,
                track2: null,
                winner: null,
                votes: { track1: 0, track2: 0 },
            });
        }
        rounds.push({
            id: `round-${roundNum}`,
            name: getRoundName(numMatchupsInCurrentRound, roundNum),
            matchups: currentRoundMatchups,
        });
        numMatchupsInPreviousRound = numMatchupsInCurrentRound;
        roundNum++;
    }

    return {
        id: `bracket-${album.id}-${Math.random().toString(36).substring(2, 9)}`,
        album,
        rounds,
        status: 'pending',
        winner: null,
    };
}


export async function addAlbumBracket(formData: FormData) {
  const url = formData.get("url") as string;
  const groupId = formData.get("groupId") as string;

  try {
    console.log("STEP 1 - Calling fetchYoutubePlaylistDetails with URL:", url);
    const playlistData = await fetchYoutubePlaylistDetails({ url });
    console.log("STEP 2 - Fetched playlist data");

    // Transform API data into our Album type
    const album: Album = {
      id: `youtube-${playlistData.playlistId}`,
      name: playlistData.title,
      artist: 'Various Artists', // YouTube playlists often don't have a single artist
      artworkUrl: playlistData.image,
      tracks: playlistData.tracks.map((title, index) => ({
        id: `yt-track-${playlistData.playlistId}-${index}`,
        name: title,
        trackNumber: index + 1,
        previewUrl: null,
      })),
    };
    
    // Create a bracket object
    const newBracket = createBracketFromAlbum(album);
    
    // Save the new bracket to Firestore.
    // The `newBracket` object needs to be converted to a plain JS object for Firestore.
    const plainBracketObject = JSON.parse(JSON.stringify(newBracket));

    console.log("STEP 3 - Saving bracket to Firestore for group:", groupId);
    const groupRef = doc(firestore, 'groups', groupId);
    await updateDoc(groupRef, {
        pendingBrackets: arrayUnion(plainBracketObject),
    });
    console.log("STEP 4 - Bracket saved successfully");

    return { success: true };

  } catch (error) {
    console.error("YOUTUBE IMPORT ERROR:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown server error",
    };
  }
}
