
'use server';

import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Bracket, Group, Matchup, Round, Track } from '@/lib/types';
import crypto from 'crypto';
import { shuffleArray } from '@/lib/utils';

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

        // 1. Generate first round matchups using "power of two" logic for byes.
        const numTracks = tracks.length;
        const roundsNeeded = Math.ceil(Math.log2(numTracks));
        const bracketSize = Math.pow(2, roundsNeeded);
        const byesNeeded = bracketSize - numTracks;

        // Create a list with tracks and nulls for byes
        let players: (Track | null)[] = [...tracks];
        for (let i = 0; i < byesNeeded; i++) {
            players.push(null);
        }

        // Shuffle the players list to randomize byes
        players = shuffleArray(players);

        const round1Matchups: Matchup[] = [];
        for (let i = 0; i < players.length; i += 2) {
            const track1 = players[i];
            const track2 = players[i+1];

            // If one track is null, the other gets a bye and is the winner.
            const winner = !track1 ? track2 : !track2 ? track1 : null;
            
            round1Matchups.push({
                id: crypto.randomUUID(),
                track1: track1,
                track2: track2,
                votes: { track1: 0, track2: 0 },
                winner: winner,
            });
        }
        
        // 2. Build the full bracket structure with placeholders
        const allRounds: Round[] = [{
            id: crypto.randomUUID(),
            name: 'Round 1',
            matchups: round1Matchups,
        }];

        let currentRoundMatchups = round1Matchups;
        for (let roundCounter = 2; roundCounter <= roundsNeeded; roundCounter++) {
            const nextRoundMatchups: Matchup[] = [];
            for (let i = 0; i < currentRoundMatchups.length; i += 2) {
                const m1 = currentRoundMatchups[i];
                const m2 = currentRoundMatchups[i + 1];

                const winner1 = m1?.winner;
                const winner2 = m2?.winner;
                
                const nextMatchupWinner = (winner1 && !winner2) ? winner1 : (!winner1 && winner2) ? winner2 : null;

                nextRoundMatchups.push({
                    id: crypto.randomUUID(),
                    track1: winner1 || null,
                    track2: winner2 || null,
                    winner: nextMatchupWinner,
                    votes: { track1: 0, track2: 0 },
                });
            }
            allRounds.push({
                id: crypto.randomUUID(),
                name: `Round ${roundCounter}`,
                matchups: nextRoundMatchups
            });
            currentRoundMatchups = nextRoundMatchups;
        }

        // 3. Prepare the new active bracket
        const newActiveBracket: Bracket = {
            ...bracketToActivate,
            album: {
                ...bracketToActivate.album,
                tracks: tracks.filter(t => t !== null) as Track[],
            },
            status: 'active',
            rounds: allRounds,
        };

        // 4. Create a new pendingBrackets array without the activated bracket
        const newPendingBrackets = groupData.pendingBrackets.filter(b => b.id !== bracketId);
        
        // 5. Archive the old active bracket if it exists
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

        // 6. Perform Firestore update
        await groupRef.update(updates);

    } catch (error) {
        console.error("Error starting bracket:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred during bracket activation.");
    }
    
    // 7. Revalidate and redirect
    revalidatePath(`/group/${groupId}`);
    revalidatePath(`/group/${groupId}/dashboard`);
    redirect(`/group/${groupId}`);
}
