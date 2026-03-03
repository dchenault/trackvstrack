
'use client';

import type { Bracket, Matchup, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy, Zap } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BracketItem = ({ track, isWinner }: { track: Track | null; isWinner: boolean }) => (
    <div
        className={cn(
            'flex h-10 w-full items-center justify-between overflow-hidden px-3 text-sm transition-colors',
            !track && 'italic text-muted-foreground/60',
            isWinner ? 'font-bold bg-primary/20' : 'bg-card'
        )}
    >
        <span className={cn('truncate', !isWinner && 'text-muted-foreground')}>{track?.name ?? '...'}</span>
        {track && isWinner && <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />}
    </div>
);


const MatchupCard = ({ matchup }: { matchup: Matchup }) => {
    const winnerIsTrack1 = !!matchup.winner && matchup.track1?.id === matchup.winner.id;
    const winnerIsTrack2 = !!matchup.winner && matchup.track2?.id === matchup.winner.id;
    
    return (
        <div className="overflow-hidden rounded-md border text-card-foreground shadow-sm w-full bg-card">
            <BracketItem track={matchup.track1} isWinner={winnerIsTrack1} />
            <hr className="border-border" />
            <BracketItem track={matchup.track2} isWinner={winnerIsTrack2} />
        </div>
    );
};

const WinnerDisplay = ({ winner, albumName }: { winner: Track, albumName: string }) => (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-8 py-12 rounded-lg bg-card border-2 border-yellow-400 shadow-2xl shadow-yellow-400/20">
        <Trophy className="h-20 w-20 text-yellow-400" strokeWidth={1} />
        <div>
            <p className="text-muted-foreground">Tournament Winner</p>
            <h3 className="text-xl font-bold">{albumName}</h3>
        </div>
        <h2 className="text-2xl font-black text-primary">{winner.name}</h2>
    </div>
);

export default function BracketVisualizer({ bracket, onMatchupClick }: { bracket: Bracket; onMatchupClick?: (m: Matchup) => void; }) {
    
    if (!bracket || !Array.isArray(bracket.rounds) || bracket.rounds.length === 0) {
        return <div className="text-center py-8">Bracket data is not available yet.</div>;
    }
    
    const { rounds, winner, album } = bracket;

    return (
        <div className="w-full">
             <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
                <Image src={album.artworkUrl} alt={`Album art for ${album.name}`} width={150} height={150} className="aspect-square rounded-lg object-cover shadow-2xl" data-ai-hint="abstract album art"/>
                <div>
                    <h2 className="text-4xl font-black">{album.name}</h2>
                    <h3 className="text-2xl text-muted-foreground">{album.artist}</h3>
                    {album.description && (<p className="mt-2 max-w-prose text-sm text-muted-foreground">{album.description}</p>)}
                </div>
            </div>
            
            <div className="flex flex-row gap-8 overflow-x-auto pb-8">
                {rounds.map((round) => (
                    <div key={round.id} className="flex flex-col gap-4 flex-shrink-0 w-72">
                        <h4 className="text-center font-bold uppercase tracking-widest text-secondary mb-2 h-5">
                            {round.name}
                        </h4>
                        <div className="flex flex-col gap-y-4">
                            {round.matchups.map((matchup) => {
                                const canBattle = matchup.track1 && matchup.track2 && !matchup.winner && onMatchupClick;
                                return (
                                    <div key={matchup.id} className="flex items-center gap-2">
                                        <div className="flex-grow">
                                            <MatchupCard matchup={matchup} />
                                        </div>
                                        <div className="w-10 h-10 flex-shrink-0">
                                            {canBattle && (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="rounded-full w-10 h-10 border-primary/50 text-primary/80 hover:bg-primary/10 hover:text-primary"
                                                                onClick={() => onMatchupClick(matchup)}
                                                            >
                                                                <Zap className="h-5 w-5" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Start Battle</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}

                {winner && (
                    <div className="flex-shrink-0 w-72">
                        <WinnerDisplay winner={winner} albumName={album.name} />
                    </div>
                )}
            </div>
        </div>
    )
}
