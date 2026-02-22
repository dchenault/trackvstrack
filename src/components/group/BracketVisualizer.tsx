
import type { Bracket, Matchup, Round, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

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

const SingleMatchup = ({ matchup }: { matchup: Matchup }) => {
    const winnerIsTrack1 = !!matchup.winner && matchup.track1?.id === matchup.winner.id;
    const winnerIsTrack2 = !!matchup.winner && matchup.track2?.id === matchup.winner.id;

    if (!matchup.track1 && !matchup.track2) {
        return (
            <div className="overflow-hidden rounded-md border border-dashed bg-card/30 text-card-foreground shadow-sm">
                <BracketItem track={null} isWinner={false} />
                <hr className="border-border/20 border-dashed" />
                <BracketItem track={null} isWinner={false} />
            </div>
        )
    }

    return (
        <div className="overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm">
            <BracketItem track={matchup.track1} isWinner={winnerIsTrack1} />
            <hr className="border-border" />
            <BracketItem track={matchup.track2} isWinner={winnerIsTrack2} />
        </div>
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


const RoundColumn = ({ matchups, title, side, isFinal }: { matchups: Matchup[], title: string, side: 'left' | 'right' | 'center', isFinal: boolean }) => {
    const gapHeight = 48; // from gap-y-12
    const matchupHeight = 89; // h-10*2 for BracketItem + 1px for hr
    const connectorHeight = `calc(50% + ${gapHeight / 2}px + 0.5px)`;

    return (
        <div className="flex flex-col justify-around gap-y-12">
            <h4 className="text-center font-bold uppercase tracking-widest text-secondary mb-6 h-5">
                {title}
            </h4>
            {matchups && matchups.map((matchup, index) => (
                <div key={matchup.id || `matchup-${index}`} className="relative">
                    <SingleMatchup matchup={matchup} />
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

export default function BracketVisualizer({ bracket }: { bracket: Bracket }) {
    if (!bracket) {
        return <div className="text-center py-8">No bracket data provided.</div>;
    }
    const { rounds, winner, album } = bracket;

    if (!rounds || rounds.length === 0 || !rounds[0]?.matchups || rounds[0].matchups.length === 0) {
        return <div className="text-center py-8">Bracket data is not available yet.</div>;
    }

    const buildFullBracket = (allRoundsData: Round[]): Matchup[][] => {
        if (!allRoundsData || allRoundsData.length === 0 || !allRoundsData[0]?.matchups) {
            return [];
        }
        
        const fullBracket: Matchup[][] = [];
        let lastRoundMatchups = [...allRoundsData[0].matchups];
        fullBracket.push(lastRoundMatchups);

        let roundIdx = 0;
        while (lastRoundMatchups.length > 1) {
            const nextRoundVisual: Matchup[] = [];
            for (let i = 0; i < lastRoundMatchups.length; i += 2) {
                const feeder1 = lastRoundMatchups[i];
                const feeder2 = lastRoundMatchups[i + 1];

                if (!feeder2) {
                    nextRoundVisual.push({
                        id: `bye-${feeder1.id}`,
                        track1: feeder1.winner,
                        track2: null,
                        winner: feeder1.winner,
                        votes: { track1: 0, track2: 0 },
                    });
                    continue;
                }

                const existingMatchup = (allRoundsData[roundIdx + 1]?.matchups || []).find(m =>
                    (m.track1?.id === feeder1.winner?.id && m.track2?.id === feeder2.winner?.id) ||
                    (m.track1?.id === feeder2.winner?.id && m.track2?.id === feeder1.winner?.id)
                );

                if (existingMatchup) {
                    nextRoundVisual.push(existingMatchup);
                } else {
                    nextRoundVisual.push({
                        id: `placeholder-${roundIdx}-${i}`,
                        track1: feeder1.winner,
                        track2: feeder2.winner,
                        winner: null,
                        votes: { track1: 0, track2: 0 },
                    });
                }
            }
            if (nextRoundVisual.length === 0 && lastRoundMatchups.length > 1) {
                break;
            }
            fullBracket.push(nextRoundVisual);
            lastRoundMatchups = nextRoundVisual;
            roundIdx++;
        }
        return fullBracket;
    };

    const fullBracketStructure = buildFullBracket(rounds);
    
    if (fullBracketStructure.length === 0) {
       return <div className="text-center py-8">Bracket data could not be processed.</div>;
    }

    const getRoundsForSide = (side: 'left' | 'right', allBracketRounds: Matchup[][]): Matchup[][] => {
        const round1 = allBracketRounds[0];
        if (!round1) return [];

        const midPoint = Math.ceil(round1.length / 2);
        const startIndex = side === 'left' ? 0 : midPoint;
        const endIndex = side === 'left' ? midPoint : round1.length;
        
        let currentMatchups = round1.slice(startIndex, endIndex);
        if (currentMatchups.length === 0) return [];
        
        const sideRounds: Matchup[][] = [currentMatchups];

        let roundIndex = 0;
        while (currentMatchups.length > 1) {
            const nextRound: Matchup[] = [];
            const nextRoundData = allBracketRounds[roundIndex + 1] || [];

            for (let i = 0; i < currentMatchups.length; i += 2) {
                const winner1 = currentMatchups[i]?.winner;
                const winner2 = currentMatchups[i+1]?.winner;
                
                const nextMatchup = nextRoundData.find(m => 
                    (m.track1?.id === winner1?.id && m.track2?.id === winner2?.id) ||
                    (m.track1?.id === winner2?.id && m.track2?.id === winner1?.id)
                );

                if (nextMatchup) {
                    nextRound.push(nextMatchup);
                } else {
                    nextRound.push({
                        id: `ph-side-${side}-${i}-${roundIndex}`,
                        track1: winner1 || null,
                        track2: winner2 || null,
                        winner: (!winner2 && winner1) ? winner1 : null,
                        votes: { track1: 0, track2: 0 },
                    });
                }
            }
            sideRounds.push(nextRound);
            currentMatchups = nextRound;
            roundIndex++;
        }
        return sideRounds;
    }

    const leftRounds = getRoundsForSide('left', fullBracketStructure);
    const rightRounds = getRoundsForSide('right', fullBracketStructure);
    const finalMatchup = fullBracketStructure[fullBracketStructure.length - 1]?.[0];

    return (
        <div className="w-full flex-1">
             <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <Image src={bracket.album.artworkUrl} alt={`Album art for ${bracket.album.name}`} width={150} height={150} className="aspect-square rounded-lg object-cover shadow-2xl" data-ai-hint="abstract album art"/>
                <div>
                    <h2 className="text-4xl font-black">{bracket.album.name}</h2>
                    <h3 className="text-2xl text-muted-foreground">{bracket.album.artist}</h3>
                    {bracket.album.description && (<p className="mt-2 max-w-prose text-sm text-muted-foreground">{bracket.album.description}</p>)}
                </div>
            </div>
            
            <div className="overflow-x-auto pb-8">
                <div className="inline-flex items-start justify-center p-4 min-w-max gap-x-8">
                   {leftRounds && leftRounds.map((round, rIndex) => (
                       round && <RoundColumn key={`left-round-${rIndex}`} matchups={round} title={`Round ${rIndex + 1}`} side="left" isFinal={false} />
                   ))}

                   <div className="flex flex-col h-full px-8 items-center justify-center pt-[7rem]">
                        {winner ? (
                             <WinnerDisplay winner={winner} albumName={album.name} />
                        ) : (
                            finalMatchup && (
                                <RoundColumn matchups={[finalMatchup]} title="Finals" side="center" isFinal={true} />
                            )
                        )}
                   </div>

                   {rightRounds && rightRounds.map((round, rIndex) => (
                       round && <RoundColumn key={`right-round-${rIndex}`} matchups={round} title={`Round ${rIndex + 1}`} side="right" isFinal={false}/>
                   )).reverse()}
                </div>
            </div>
        </div>
    )
}
