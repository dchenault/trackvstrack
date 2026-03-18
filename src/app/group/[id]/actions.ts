
'use server';

import { adminDb } from '@/lib/firebase-admin';
import type { Bracket, Group, Matchup, Round, Track } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function castVote(
    groupId: string,
    matchupId: string,
    winnerTrackId: string,
    userId: string
) {
    const groupRef = adminDb.collection('groups').doc(groupId);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const groupDoc = await transaction.get(groupRef);
            if (!groupDoc.exists) {
                throw new Error('Group not found.');
            }

            // Get total number of group members to determine when voting is complete.
            // Note: This is read outside the main transaction as transactions can't query collections.
            // There's a small window for a race condition if a user joins at the exact wrong time,
            // but it's an acceptable trade-off for this app's logic.
            const membersSnapshot = await groupRef.collection('users').get();
            const totalMembers = membersSnapshot.size;

            const groupData = groupDoc.data() as Group;
            const activeBracket = groupData.activeBracket;

            if (!activeBracket || activeBracket.status !== 'active') {
                throw new Error('No active bracket found.');
            }

            // Find the matchup within the active bracket
            let targetRoundIndex = -1;
            let targetMatchupIndex = -1;

            for (let i = 0; i < activeBracket.rounds.length; i++) {
                const matchupIndex = activeBracket.rounds[i].matchups.findIndex(m => m.id === matchupId);
                if (matchupIndex !== -1) {
                    targetRoundIndex = i;
                    targetMatchupIndex = matchupIndex;
                    break;
                }
            }

            if (targetRoundIndex === -1) {
                throw new Error('Matchup not found.');
            }
            
            const matchup = activeBracket.rounds[targetRoundIndex].matchups[targetMatchupIndex];

            // Ensure voting is on a valid, undecided matchup
            if (matchup.winner) {
                console.log("This matchup has already been decided.");
                return; // Not an error, just means someone else's vote decided it first.
            }
            if (!matchup.track1 || !matchup.track2) {
                throw new Error("Cannot vote on a matchup with a bye.");
            }
            
            // Ensure votes object exists
            if (!matchup.votes) {
                matchup.votes = {};
            }

            // Prevent user from voting multiple times
            if (matchup.votes[userId]) {
                throw new Error("You have already voted in this matchup.");
            }

            // Record the vote
            matchup.votes[userId] = winnerTrackId;
            
            // Check if all members have voted to decide the winner
            const effectiveTotalMembers = Math.max(1, totalMembers); // At least 1 vote needed
            if (Object.keys(matchup.votes).length >= effectiveTotalMembers) {
                // Tally votes
                const votesForTrack1 = Object.values(matchup.votes).filter(v => v === matchup.track1!.id).length;
                const votesForTrack2 = Object.values(matchup.votes).filter(v => v === matchup.track2!.id).length;

                // All votes are in, declare winner (track1 wins ties)
                const finalWinner = votesForTrack1 >= votesForTrack2 ? matchup.track1 : matchup.track2;
                matchup.winner = finalWinner;

                const isFinalRound = targetRoundIndex === activeBracket.rounds.length - 1;

                if (isFinalRound) {
                    // This was the final, set the bracket winner and status
                    activeBracket.winner = finalWinner;
                    activeBracket.status = 'complete';
                } else {
                    // Advance the winner to the next round
                    const nextRoundIndex = targetRoundIndex + 1;
                    const nextMatchupIndex = Math.floor(targetMatchupIndex / 2);
                    const nextMatchup = activeBracket.rounds[nextRoundIndex].matchups[nextMatchupIndex];

                    if (targetMatchupIndex % 2 === 0) {
                        nextMatchup.track1 = finalWinner;
                    } else {
                        nextMatchup.track2 = finalWinner;
                    }
                }
            }
            
            // Update the entire bracket in Firestore within the transaction
            transaction.update(groupRef, { activeBracket: activeBracket });
        });

        // Revalidate paths to refresh UI for all users after the transaction is successful
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
