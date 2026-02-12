
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Bracket, Group, Matchup, Round, Track } from '@/lib/types';
import { shuffleArray } from '@/lib/utils';
import crypto from 'crypto';

export async function startBracket(groupId: string, bracketId: string, tracks: Track[]) {
    const groupRef = adminDb.collection('groups').doc(groupId);

    try {
        const groupDoc = await groupRef.get();
        if (!groupDoc.exists) {
            throw new Error('Group not found.');
        }
        
        const groupData = groupDoc.data() as Omit<Group, 'id' | 'users'>;

        const pendingBracketIndex = groupData.pendingBrackets?.findIndex(b => b.id === bracketId);

        if (pendingBracketIndex === -1 || !groupData.pendingBrackets) {
            throw new Error('Bracket not found in pending list.');
        }

        const bracketToActivate = groupData.pendingBrackets[pendingBracketIndex];

        // 1. Generate first round from the provided track order, handling byes
        let finalTracks: (Track | null)[] = [...tracks];
        const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(finalTracks.length)));
        
        if (finalTracks.length > 1 && finalTracks.length < nextPowerOfTwo) {
            const byesNeeded = nextPowerOfTwo - finalTracks.length;
            for (let i = 0; i < byesNeeded; i++) {
                finalTracks.push(null);
            }
        }
        
        // The list is already shuffled how the user wants it, now pair them up
        const matchups: Matchup[] = [];
        for (let i = 0; i < finalTracks.length; i += 2) {
            const track1 = finalTracks[i];
            const track2 = finalTracks[i + 1];

            // If one track is a bye, the other is the winner
            let winner: Track | null = null;
            if (track1 && !track2) winner = track1;
            if (!track1 && track2) winner = track2;
            
            matchups.push({
                id: crypto.randomUUID(),
                track1,
                track2,
                votes: { track1: 0, track2: 0 },
                winner: winner,
            });
        }

        const firstRound: Round = {
            id: crypto.randomUUID(),
            name: `Round 1`,
            matchups,
        };

        // 2. Prepare the new active bracket, storing the shuffled track order
        const newActiveBracket: Bracket = {
            ...bracketToActivate,
            album: {
                ...bracketToActivate.album,
                tracks: tracks.filter(t => t !== null) as Track[], // Store original shuffled tracks, no byes
            },
            status: 'active',
            rounds: [firstRound],
        };

        // 3. Create a new pendingBrackets array without the activated bracket
        const newPendingBrackets = groupData.pendingBrackets.filter(b => b.id !== bracketId);
        
        // 4. Archive the old active bracket if it exists
        const oldActiveBracket = groupData.activeBracket;
        const updates: { [key: string]: any } = {
            activeBracket: newActiveBracket,
            pendingBrackets: newPendingBrackets
        };

        if (oldActiveBracket) {
            updates.archivedBrackets = FieldValue.arrayUnion({
                ...oldActiveBracket,
                status: 'complete',
            });
        }

        // 5. Perform Firestore update
        await groupRef.update(updates);

    } catch (error) {
        console.error("Error starting bracket:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred during bracket activation.");
    }
    
    // 6. Revalidate and redirect
    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/group/${groupId}/dashboard`);
    redirect(`/group/${groupId}`);
}
