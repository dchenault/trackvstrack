'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Bracket, Group, Matchup, Round, Track } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function castVote(
    groupId: string,
    matchupId: string,
    winnerTrackId: string
) {
    const groupRef = adminDb.collection('groups').doc(groupId);

    try {
        const groupDoc = await groupRef.get();
        if (!groupDoc.exists) {
            throw new Error('Group not found.');
        }

        const groupData = groupDoc.data() as Group;
        const activeBracket = groupData.activeBracket;

        if (!activeBracket) {
            throw new Error('No active bracket found.');
        }

        let targetRoundIndex = -1;
        let targetMatchupIndex = -1;
        let winnerTrack: Track | null = null;

        // Find the matchup and its indices
        for (let i = 0; i < activeBracket.rounds.length; i++) {
            const round = activeBracket.rounds[i];
            const matchupIndex = round.matchups.findIndex(m => m.id === matchupId);

            if (matchupIndex !== -1) {
                const matchup = round.matchups[matchupIndex];
                // Ensure we can only vote on pending matchups
                if (matchup.winner) {
                    throw new Error("This matchup has already been decided.");
                }
                targetRoundIndex = i;
                targetMatchupIndex = matchupIndex;
                if (matchup.track1?.id === winnerTrackId) winnerTrack = matchup.track1;
                if (matchup.track2?.id === winnerTrackId) winnerTrack = matchup.track2;
                break;
            }
        }

        if (targetRoundIndex === -1 || !winnerTrack) {
            throw new Error('Matchup or winner track not found.');
        }
        
        // 1. Set the winner of the current matchup
        activeBracket.rounds[targetRoundIndex].matchups[targetMatchupIndex].winner = winnerTrack;

        // 2. Advance the winner to the next round if applicable
        const isFinalRound = targetRoundIndex === activeBracket.rounds.length - 1;

        if (isFinalRound) {
            // This is the final match, set the bracket winner
            activeBracket.winner = winnerTrack;
            activeBracket.status = 'complete';
        } else {
            // Find the next matchup to populate
            const nextRoundIndex = targetRoundIndex + 1;
            const nextMatchupIndex = Math.floor(targetMatchupIndex / 2);
            const nextMatchup = activeBracket.rounds[nextRoundIndex].matchups[nextMatchupIndex];

            // Populate track1 or track2 based on the current matchup's position (even/odd)
            if (targetMatchupIndex % 2 === 0) {
                nextMatchup.track1 = winnerTrack;
            } else {
                nextMatchup.track2 = winnerTrack;
            }
        }

        // Update the database
        await groupRef.update({
            activeBracket: activeBracket
        });

        // Revalidate path to refresh UI for all users
        revalidatePath(`/group/${groupId}`);
        revalidatePath(`/group/${groupId}/dashboard`);

    } catch (error) {
        console.error("Error casting vote:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error("An unknown error occurred while casting vote.");
    }
}
