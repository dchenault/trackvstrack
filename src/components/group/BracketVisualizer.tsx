'use client';

import type { Bracket, Matchup, Round, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

const BracketItem = ({ track, isWinner }: { track: Track | null; isWinner: boolean }) => (
    <div
        className={cn(
            'flex h-10 w-48 items-center justify-between overflow-hidden px-3 text-sm transition-colors',
            !track && 'italic text-muted-foreground/60',
            isWinner ? 'font-bold bg-primary/20' : 'bg-card'
        )}
    >
        <span className={cn('truncate', !isWinner && 'text-muted-foreground')}>{track?.name ?? '...'}</span>
        {track && isWinner && <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />}
    </div>
);

const SingleMatchup = ({ matchup, onMatchupClick }: { matchup: Matchup; onMatchupClick?: (m: Matchup) => void }) => {
    const winnerIsTrack1 = !!matchup.winner && matchup.track1?.id === matchup.winner.id;
    const winnerIsTrack2 = !!matchup.winner && matchup.track2?.id === matchup.winner.id;
    const isClickable = !!onMatchupClick && !!matchup.track1 && !!matchup.track2 && !matchup.winner;

    const Wrapper = isClickable ? 'button' : 'div';
    const wrapperProps = {
        className: cn(
            "overflow-hidden rounded-md border text-card-foreground shadow-sm w-full",
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
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-8 w-[240px]">
        <Trophy className="h-20 w-20 text-yellow-400" strokeWidth={1} />
        <div>
            <p className="text-muted-foreground">Tournament Winner</p>
            <h3 className="text-xl font-bold">{albumName}</h3>
        </div>
        <h2 className="text-2xl font-black text-primary">{winner.name}</h2>
    </div>
);


const RoundColumn = ({ matchups, title, side, isFinal, onMatchupClick }: { matchups: Matchup[], title: string, side: 'left' | 'right' | 'center', isFinal: boolean, onMatchupClick?: (m: Matchup) => void }) => {
    const gapHeight = 48; // from gap-y-12
    const matchupHeight = 81; // h-10*2 for BracketItem + 1px for hr
    const connectorHeight = `calc(50% + ${gapHeight / 2}px + 0.5px)`;

    // Guard against rendering if matchups are not ready
    if (!matchups) {
        return null;
    }

    return (
        <div className="flex flex-col justify-around gap-y-12">
            <h4 className="text-center font-bold uppercase tracking-widest text-secondary mb-6 h-5">
                {title}
            </h4>
            {matchups.map((matchup, index) => (
                <div key={matchup.id || `matchup-${index}`} className="relative">
                    <SingleMatchup matchup={matchup} onMatchupClick={onMatchupClick} />
                    {!isFinal && (
                        <>
                            <div className={cn( "absolute top-1/2 -translate-y-px h-px w-4 bg-border", side === 'left' ? "left-full" : "right-full")} />
                             {index % 2 === 0 ? (
                                <div className={cn("absolute top-1/2 w-px bg-border", side === 'left' ? "left-[calc(100%+1rem)]" : "right-[calc(100%+1rem)]" )} style={{height: connectorHeight}} />
                            ) : (
                                <div className={cn("absolute bottom-1/2 w-px bg-border", side === 'left' ? "left-[calc(100%+1rem)]" : "right-[calc(100%+1rem)]")} style={{height: connectorHeight}} />
                            )}
                             {index % 2 === 0 && (
                                <div className={cn("absolute h-px w-4 bg-border", side === 'left' ? "left-[calc(100%+1rem)]" : "right-[calc(100%+1rem)]")} style={{ top: `calc(50% + ${matchupHeight / 2}px + ${gapHeight/2}px)` }} />
                            )}
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function BracketVisualizer({ bracket, onMatchupClick }: { bracket: Bracket; onMatchupClick?: (m: Matchup) => void; }) {
    
    // Top-level guard to prevent rendering with incomplete data.
    if (!bracket || !Array.isArray(bracket.rounds) || bracket.rounds.length === 0) {
        return <div className="text-center py-8">Bracket data is not available yet.</div>;
    }
    
    const { rounds, winner, album } = bracket;

    // useMemo hook to perform calculations only when `rounds` data changes.
    // This prevents the infinite loop and performance issues.
    const { leftRounds, rightRounds, finalMatchup } = useMemo(() => {
        
        // Find the index of the final round (which has only 1 matchup).
        const finalRoundIndex = rounds.findIndex(r => r.matchups.length === 1);

        // Separate the rounds for the two sides of the bracket from the final round.
        const sideRoundsData = finalRoundIndex !== -1 ? rounds.slice(0, finalRoundIndex) : rounds;
        const finalMatchupData = finalRoundIndex !== -1 ? rounds[finalRoundIndex].matchups[0] : null;

        const left: Round[] = [];
        const right: Round[] = [];

        // Split each pre-final round into a left and right half.
        sideRoundsData.forEach(round => {
            const mid = Math.ceil(round.matchups.length / 2);
            left.push({ ...round, matchups: round.matchups.slice(0, mid) });
            right.push({ ...round, matchups: round.matchups.slice(mid) });
        });

        return {
            leftRounds: left,
            rightRounds: right,
            finalMatchup: finalMatchupData,
        };
    }, [rounds]);
    
    // Final guard after calculations.
    if (!leftRounds.length || !rightRounds.length) {
       return <div className="text-center py-8">Bracket data could not be processed.</div>;
    }

    return (
        <div className="w-full flex-1">
             <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <Image src={album.artworkUrl} alt={`Album art for ${album.name}`} width={150} height={150} className="aspect-square rounded-lg object-cover shadow-2xl" data-ai-hint="abstract album art"/>
                <div>
                    <h2 className="text-4xl font-black">{album.name}</h2>
                    <h3 className="text-2xl text-muted-foreground">{album.artist}</h3>
                    {album.description && (<p className="mt-2 max-w-prose text-sm text-muted-foreground">{album.description}</p>)}
                </div>
            </div>
            
            <div className="overflow-x-auto pb-8">
                <div className="inline-flex items-start justify-center p-4 min-w-max gap-x-8">
                   {leftRounds.map((round, rIndex) => (
                       <RoundColumn key={`left-round-${rIndex}`} matchups={round.matchups} title={`Round ${rIndex + 1}`} side="left" isFinal={false} onMatchupClick={onMatchupClick} />
                   ))}

                   <div className="flex flex-col h-full px-8 items-center justify-center pt-[7rem]">
                        {winner ? (
                             <WinnerDisplay winner={winner} albumName={album.name} />
                        ) : (
                            finalMatchup && (
                                <RoundColumn matchups={[finalMatchup]} title="Finals" side="center" isFinal={true} onMatchupClick={onMatchupClick} />
                            )
                        )}
                   </div>

                   {rightRounds.map((round, rIndex) => (
                       <RoundColumn key={`right-round-${rIndex}`} matchups={round.matchups} title={`Round ${rIndex + 1}`} side="right" isFinal={false} onMatchupClick={onMatchupClick} />
                   ))}
                </div>
            </div>
        </div>
    )
}
