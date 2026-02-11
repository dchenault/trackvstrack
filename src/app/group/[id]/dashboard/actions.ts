'use server';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { fetchYoutubePlaylistDetails } from '@/ai/flows/get-youtube-playlist-details';

// Initialize Firebase if not already initialized for server-side usage.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export async function addAlbumBracket(formData: FormData) {
  const url = formData.get("url") as string;
  const groupId = formData.get("groupId") as string;

  try {
    console.log("STEP 1 - Calling fetchYoutubePlaylistDetails with URL:", url);
    const playlistData = await fetchYoutubePlaylistDetails({ url });
    console.log("STEP 2 - Fetched playlist data:", playlistData);

    // Create a simplified, serializable object for Firestore
    const bracketData = {
      id: `bracket-yt-${playlistData.playlistId}-${Date.now()}`,
      title: playlistData.title,
      image: playlistData.image,
      tracks: playlistData.tracks,
      status: 'pending',
    };

    console.log("STEP 3 - Saving simplified bracket to Firestore for group:", groupId);
    const groupRef = doc(firestore, 'groups', groupId);
    await updateDoc(groupRef, {
        pendingBrackets: arrayUnion(bracketData),
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
