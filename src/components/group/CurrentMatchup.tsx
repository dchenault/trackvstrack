
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Matchup } from '@/lib/types';
import { Loader2, Vote } from 'lucide-react';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { castVote } from '@/app/group/[id]/actions';
import { useUser } from '@/firebase';
import { SpotifyIcon } from '../icons/spotify';

export default function CurrentMatchup({ 
  groupId, 
  matchup, 
  albumArtUrl 
}: { 
  groupId: string; 
  matchup: Matchup; 
  albumArtUrl: string 
}) {
  const { user: authUser } = useUser();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  const userHasVoted = authUser && matchup.voters?.includes(authUser.uid);
  const canVote = !matchup.winner && !isPending && authUser && !userHasVoted;

  const handleVote = (winningTrackId: string) => {
    if (!authUser) {
      toast({
        variant: "destructive",
        title: "Please sign in to vote",
        description: "Only group members can participate in battles.",
      });
      return;
    }
    
    startTransition(async () => {
      try {
        await castVote(groupId, matchup.id, winningTrackId, authUser.uid);
        toast({ title: "Vote Cast!", description: "Your vote has been counted." });
      } catch (error) {
        console.error("Failed to cast vote", error);
        toast({
          variant: "destructive",
          title: "Vote Failed",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
      }
    });
  };

  if (!matchup.track1 || !matchup.track2) {
    return (
      <Card className="w-full max-w-4xl p-8 text-center bg-card/50">
        <p className="text-muted-foreground">Select a matchup from the bracket below to start voting.</p>
      </Card>
    );
  }
  
  const voteCount1 = matchup.votes.track1 || 0;
  const voteCount2 = matchup.votes.track2 || 0;
  const totalVotes = voteCount1 + voteCount2;
  const track1Percentage = totalVotes > 0 ? (voteCount1 / totalVotes) * 100 : 50;
  const track2Percentage = totalVotes > 0 ? (voteCount2 / totalVotes) * 100 : 50;

  return (
    <div className="w-full max-w-4xl relative">
      <Card className="bg-card/30 backdrop-blur-sm border-border/10 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Track 1 */}
          <div className="flex-1 p-6 flex flex-col items-center justify-between text-center relative group">
            <div className="absolute top-0 left-0 h-full bg-primary/20 transition-all duration-500 ease-out" style={{ width: `${track1Percentage}%` }}></div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <h3 className="text-2xl font-bold">{matchup.track1.name}</h3>
              <p className="text-muted-foreground text-sm">Track {matchup.track1.trackNumber}</p>
              <Link href={`https://open.spotify.com/track/${matchup.track1.id}`} target="_blank" className="inline-flex items-center gap-2 text-sm text-green-500 hover:text-green-400 transition-colors">
                  <SpotifyIcon className="h-4 w-4" /> Listen on Spotify
              </Link>
            </div>
            <div className="mt-4 flex flex-col items-center w-full max-w-xs gap-2">
              <Button 
                className="w-full font-bold bg-primary hover:bg-primary/90 text-primary-foreground group-hover:scale-105 transition-transform" 
                size="lg"
                onClick={() => handleVote(matchup.track1!.id)}
                disabled={!canVote}
              >
                {isPending ? <Loader2 className="mr-2 animate-spin" /> : <Vote className="mr-2" />}
                Vote
              </Button>
              {authUser && userHasVoted && <p className="text-xs text-green-400">You voted!</p>}
            </div>
            <div className="relative z-10 text-4xl font-black mt-4 text-white">{voteCount1}</div>
          </div>

          <div className="flex items-center justify-center relative">
            <Separator orientation="vertical" className="hidden md:block h-3/4 self-center" />
            <Separator orientation="horizontal" className="md:hidden w-3/4 mx-auto" />
            <div className="absolute z-20 bg-background text-foreground rounded-full p-2 border">VS</div>
          </div>

          {/* Track 2 */}
          <div className="flex-1 p-6 flex flex-col items-center justify-between text-center relative group">
            <div className="absolute top-0 right-0 h-full bg-secondary/20 transition-all duration-500 ease-out" style={{ width: `${track2Percentage}%` }}></div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <h3 className="text-2xl font-bold">{matchup.track2.name}</h3>
              <p className="text-muted-foreground text-sm">Track {matchup.track2.trackNumber}</p>
              <Link href={`https://open.spotify.com/track/${matchup.track2.id}`} target="_blank" className="inline-flex items-center gap-2 text-sm text-green-500 hover:text-green-400 transition-colors">
                  <SpotifyIcon className="h-4 w-4" /> Listen on Spotify
              </Link>
            </div>
            <div className="mt-4 flex flex-col items-center w-full max-w-xs gap-2">
              <Button 
                className="w-full font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground group-hover:scale-105 transition-transform" 
                size="lg"
                onClick={() => handleVote(matchup.track2!.id)}
                disabled={!canVote}
              >
                 {isPending ? <Loader2 className="mr-2 animate-spin" /> : <Vote className="mr-2" />}
                 Vote
              </Button>
              {authUser && userHasVoted && <p className="text-xs text-green-400">You voted!</p>}
            </div>
            <div className="relative z-10 text-4xl font-black mt-4 text-white">{voteCount2}</div>
          </div>
        </div>
      </Card>

       <div className="absolute -top-12 -left-12 w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-primary shadow-2xl shadow-primary/50 rotate-[-15deg]">
        <Image src={albumArtUrl} alt="Album Art" width={200} height={200} data-ai-hint="abstract colorful" />
      </div>
      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full overflow-hidden border-4 border-secondary shadow-2xl shadow-secondary/50 rotate-[10deg] hidden md:block">
        <Image src={albumArtUrl} alt="Album Art" width={150} height={150} data-ai-hint="abstract colorful" />
      </div>
    </div>
  );
}
