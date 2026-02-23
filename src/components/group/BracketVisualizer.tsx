'use client';

import type { Bracket, Matchup, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

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


const MatchupCard = ({ matchup, onMatchupClick }: { matchup: Matchup; onMatchupClick?: (m: Matchup) => void }) => {
    const winnerIsTrack1 = !!matchup.winner && matchup.track1?.id === matchup.winner.id;
    const winnerIsTrack2 = !!matchup.winner && matchup.track2?.id === matchup.winner.id;
    const isClickable = !!onMatchupClick && !!matchup.track1 && !!matchup.track2 && !matchup.winner;

    const Wrapper = isClickable ? 'button' : 'div';
    const wrapperProps = {
        className: cn(
            "overflow-hidden rounded-md border text-card-foreground shadow-sm w-full max-w-md",
            isClickable && "cursor-pointer hover:border-primary/80 hover:shadow-primary/20 hover:shadow-lg transition-all",
            !isClickable && "bg-card",
        ),
        onClick: () => isClickable && onMatchupClick(matchup),
    };
    
    return (
        <Wrapper {...wrapperProps}>
            <BracketItem track={matchup.track1} isWinner={winnerIsTrack1} />
            <hr className="border-border" />
            <BracketItem track={matchup.track2} isWinner={winnerIsTrack2} />
        </Wrapper>
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
        <div className="w-full flex-1">
             <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
                <Image src={album.artworkUrl} alt={`Album art for ${album.name}`} width={150} height={150} className="aspect-square rounded-lg object-cover shadow-2xl" data-ai-hint="abstract album art"/>
                <div>
                    <h2 className="text-4xl font-black">{album.name}</h2>
                    <h3 className="text-2xl text-muted-foreground">{album.artist}</h3>
                    {album.description && (<p className="mt-2 max-w-prose text-sm text-muted-foreground">{album.description}</p>)}
                </div>
            </div>
            
            <div className="flex flex-col gap-12">
                {rounds.map((round, rIndex) => {
                    // Filter out matchups that are completely empty placeholders for future rounds
                    const activeMatchups = round.matchups.filter(m => m.track1 || m.track2);
                    
                    // Don't render the round if it has no active matchups
                    if (activeMatchups.length === 0) {
                        return null;
                    }

                    return (
                        <div key={round.id || `round-${rIndex}`}>
                            <h4 className="text-center font-bold uppercase tracking-widest text-secondary mb-6 h-5">
                                {round.name}
                            </h4>
                            <div className="flex flex-col items-center gap-4">
                                {activeMatchups.map((matchup) => (
                                    <MatchupCard key={matchup.id} matchup={matchup} onMatchupClick={onMatchupClick} />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {winner && <WinnerDisplay winner={winner} albumName={album.name} />}
            </div>
        </div>
    )
}
