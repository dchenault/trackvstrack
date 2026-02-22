
import type { Bracket, Matchup, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import Image from 'next/image';

const BracketItem = ({ track, isWinner }: { track: Track | null; isWinner: boolean }) => (
    <div
        className={cn(
            'flex h-10 items-center justify-between px-3 text-sm transition-colors',
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
            <div className="w-48 overflow-hidden rounded-md border border-dashed bg-card/30 text-card-foreground shadow-sm">
                <BracketItem track={null} isWinner={false} />
                <hr className="border-border/20 border-dashed" />
                <BracketItem track={null} isWinner={false} />
            </div>
        )
    }

    return (
        <div className="w-48 overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm">
            <BracketItem track={matchup.track1} isWinner={winnerIsTrack1} />
            <hr className="border-border" />
            <BracketItem track={matchup.track2} isWinner={winnerIsTrack2} />
        </div>
    );
};

const WinnerDisplay = ({ winner, albumName }: { winner: Track, albumName: string }) => (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-8">
        <Trophy className="h-20 w-20 text-yellow-400" strokeWidth={1} />
        <div>
            <p className="text-muted-foreground">Tournament Winner</p>
            <h3 className="text-2xl font-bold">{albumName}</h3>
        </div>
        <h2 className="text-4xl font-black text-primary">{winner.name}</h2>
    </div>
);

const MatchupNode = ({ matchup, children }: { matchup: Matchup, children?: React.ReactNode }) => {
    return (
        <div className="flex justify-center items-center relative">
            {children && (
                <div className="flex-1 flex flex-col justify-around">
                    {children}
                </div>
            )}
            <div className={cn("w-12 h-px bg-border", children && "flex-shrink-0")} />
            <SingleMatchup matchup={matchup} />
        </div>
    )
}

function buildBracketTree(rounds: Round[]): React.ReactNode {
    if (!rounds || rounds.length === 0) return null;

    const lastRound = rounds[rounds.length - 1];
    if (lastRound.matchups.length !== 1) return null; // Should end in a single final

    const finalMatchup = lastRound.matchups[0];
    
    const findFeederMatchups = (winner: Track | null): [Matchup | null, Matchup | null] => {
        if (!winner) return [null, null];
        
        for (let i = rounds.length - 2; i >= 0; i--) {
            const round = rounds[i];
            const feeders: Matchup[] = [];
            for (const m of round.matchups) {
                if (m.winner?.id === winner.id) {
                    feeders.push(m);
                }
            }

            if (feeders.length >= 2) {
                return [feeders[0], feeders[1]];
            }
             if (feeders.length === 1) {
                return [feeders[0], null];
            }
        }
        return [null, null];
    };
    
    const buildNode = (matchup: Matchup | null): React.ReactNode => {
        if (!matchup) {
            // This happens for byes in early rounds. Render a placeholder.
            return <div className="h-[89px]" />;
        };

        const [feeder1, feeder2] = findFeederMatchups(matchup.track1);
        const [feeder3, feeder4] = findFeederMatchups(matchup.track2);

        const track1Node = buildNode(feeder1);
        const track2Node = buildNode(feeder2);
        const track3Node = buildNode(feeder3);
        const track4Node = buildNode(feeder4);

        const hasChildren = feeder1 || feeder2 || feeder3 || feeder4;

        return (
            <MatchupNode matchup={matchup}>
                {hasChildren && (
                    <>
                        {buildNode(feeder1)}
                        {buildNode(feeder2)}
                    </>
                )}
            </MatchupNode>
        )
    };
    
    const buildSide = (track: Track | null): React.ReactNode => {
        const rootMatchups = rounds[0].matchups.filter(m => m.track1 === track || m.track2 === track);
        if (rootMatchups.length > 0) {
            return buildTreeFromSide(rootMatchups[0], rounds);
        }
        return null;
    }

    const buildTreeFromSide = (matchup: Matchup, allRounds: Round[]): React.ReactNode => {
        const nextMatchup = allRounds.flatMap(r => r.matchups).find(m => m.track1?.id === matchup.winner?.id || m.track2?.id === matchup.winner?.id);

        if (!nextMatchup || nextMatchup.id === matchup.id) {
            return <SingleMatchup matchup={matchup} />;
        }

        const otherFeederWinnerId = nextMatchup.track1?.id === matchup.winner?.id ? nextMatchup.track2?.id : nextMatchup.track1?.id;
        const otherFeederMatchup = allRounds.flatMap(r => r.matchups).find(m => m.winner?.id === otherFeederWinnerId);

        return (
            <div className="flex items-center">
                <div className="flex flex-col justify-around relative">
                    {buildTreeFromSide(matchup, allRounds)}
                    {otherFeederMatchup && buildTreeFromSide(otherFeederMatchup, allRounds)}
                    {/* Connectors */}
                    <div className="absolute left-full top-1/4 w-6 h-px bg-border"/>
                    <div className="absolute left-full bottom-1/4 w-6 h-px bg-border"/>
                    <div className="absolute left-[calc(100%+1.5rem-1px)] top-1/4 h-1/2 w-px bg-border"/>
                </div>
                <div className="w-6 h-px bg-border" />
                <SingleMatchup matchup={nextMatchup}/>
            </div>
        );
    }
    
    // Split Round 1 into two halves
    const round1 = rounds[0].matchups;
    const mid = Math.ceil(round1.length / 2);
    const leftSide = round1.slice(0, mid);
    const rightSide = round1.slice(mid);

    const buildRecursiveTree = (matchups: Matchup[]): React.ReactNode => {
        if (matchups.length === 1) {
            if (matchups[0].id === finalMatchup.id) return null; // stop before final
            return <SingleMatchup matchup={matchups[0]} />;
        }

        const nextRoundMatchups: Matchup[] = [];
        for(let i = 0; i < matchups.length; i+=2) {
            const winner1 = matchups[i].winner;
            const winner2 = matchups[i+1]?.winner;
            
            const nextMatchup = rounds.flatMap(r=>r.matchups).find(m => 
                (m.track1?.id === winner1?.id && m.track2?.id === winner2?.id) ||
                (m.track1?.id === winner2?.id && m.track2?.id === winner1?.id)
            );

            if (nextMatchup) {
                 nextRoundMatchups.push(nextMatchup);
            } else {
                 nextRoundMatchups.push({
                     id: `placeholder-${i}`,
                     track1: winner1,
                     track2: winner2,
                     winner: null,
                     votes: { track1: 0, track2: 0 },
                 });
            }
        }

        return (
            <div className="flex flex-col justify-around gap-y-4">
                {matchups.map((m, i) => <SingleMatchup key={m.id} matchup={m} />)}
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            {/* Left Side */}
            <div className="flex flex-col gap-y-4">
                 {buildRecursiveTree(leftSide)}
            </div>
            {/* Final */}
            <div className="px-8">
                 <SingleMatchup matchup={finalMatchup} />
            </div>
            {/* Right Side */}
            <div className="flex flex-col gap-y-4">
                 {buildRecursiveTree(rightSide)}
            </div>
        </div>
    )
}


export default function BracketVisualizer({ bracket }: { bracket: Bracket }) {
    const { rounds, winner, album } = bracket;

    if (!rounds || rounds.length === 0 || !rounds[0].matchups || rounds[0].matchups.length === 0) {
        return <div className="text-center py-8">Bracket data is not available yet.</div>;
    }
    
    // Generate the full visual bracket structure, including placeholders for future rounds
    const allVisualRounds: Matchup[][] = [rounds[0].matchups];
    let lastRoundMatchups = rounds[0].matchups;
    let roundIdx = 0;

    while (lastRoundMatchups.length > 1) {
        const nextRoundVisual: Matchup[] = [];
        const nextRoundData = rounds[roundIdx + 1]?.matchups || [];

        for (let i = 0; i < lastRoundMatchups.length; i += 2) {
            const feeder1 = lastRoundMatchups[i];
            const feeder2 = lastRoundMatchups[i + 1];

            const existingMatchup = nextRoundData.find(m =>
                (m.track1?.id === feeder1.winner?.id && m.track2?.id === feeder2?.winner?.id) ||
                (m.track1?.id === feeder2?.winner?.id && m.track2?.id === feeder1.winner?.id)
            );

            if (existingMatchup) {
                nextRoundVisual.push(existingMatchup);
            } else {
                 const winner = (feeder1.winner && !feeder2?.winner) ? feeder1.winner : null;
                 if (feeder1 && feeder2) { // Only create future matchups if both feeders exist
                    nextRoundVisual.push({
                        id: `placeholder-${roundIdx}-${i}`,
                        track1: feeder1.winner,
                        track2: feeder2.winner,
                        winner,
                        votes: { track1: 0, track2: 0 },
                    });
                 }
            }
        }
        allVisualRounds.push(nextRoundVisual);
        lastRoundMatchups = nextRoundVisual;
        roundIdx++;
    }
    
    const finalMatchup = allVisualRounds[allVisualRounds.length - 1][0];

    return (
        <div className="w-full flex-1">
             <div className="mb-12 flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <Image
                    src={bracket.album.artworkUrl}
                    alt={`Album art for ${bracket.album.name}`}
                    width={150}
                    height={150}
                    className="aspect-square rounded-lg object-cover shadow-2xl"
                    data-ai-hint="abstract album art"
                />
                <div>
                    <h2 className="text-4xl font-black">{bracket.album.name}</h2>
                    <h3 className="text-2xl text-muted-foreground">{bracket.album.artist}</h3>
                    {bracket.album.description && (
                        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
                            {bracket.album.description}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="overflow-x-auto pb-8">
                <div className="inline-flex items-center justify-center p-4 min-w-max">
                   {allVisualRounds.map((round, rIndex) => {
                       if (rIndex >= allVisualRounds.length -1) return null;
                       const midPoint = Math.ceil(allVisualRounds[0].matchups.length / 2);
                       const isRightSide = rIndex >= midPoint;
                       const gap = (Math.pow(2, rIndex) - 1) * 89 + (Math.pow(2, rIndex) -1) * 24;

                       return (
                           <div key={rIndex} className="flex flex-col h-full px-8">
                                <h4 className="text-center font-bold uppercase tracking-widest text-secondary mb-6 h-5">
                                   {`Round ${rIndex + 1}`}
                                </h4>
                                <div className="flex flex-col justify-around flex-grow" style={{ gap: `${gap}px` }}>
                                   {round.map((matchup, mIndex) => {
                                        const isEven = mIndex % 2 === 0;
                                        const nextRoundGap = (Math.pow(2, rIndex + 1) - 1) * 89 + (Math.pow(2, rIndex + 1) - 1) * 24;
                                        const connectorHeight = `calc(50% + ${gap / 2}px + 0.5px)`;

                                       return (
                                           <div key={matchup.id} className="relative">
                                               <SingleMatchup matchup={matchup} />
                                               {rIndex < allVisualRounds.length - 2 && (
                                                   <>
                                                    <div className="absolute left-full top-1/2 w-4 h-px bg-border -translate-y-px" />
                                                    {isEven ? (
                                                        <div className="absolute left-[calc(100%+1rem)] top-1/2 w-px bg-border" style={{ height: connectorHeight }} />
                                                    ) : (
                                                        <div className="absolute left-[calc(100%+1rem)] bottom-1/2 w-px bg-border" style={{ height: connectorHeight }} />
                                                    )}
                                                    {isEven && (
                                                         <div className="absolute left-[calc(100%+1rem)] h-px w-4 bg-border" style={{ bottom: `calc(-${gap/2}px - 0.5px)` }}/>
                                                    )}
                                                   </>
                                               )}
                                           </div>
                                       )
                                   })}
                                </div>
                           </div>
                       )
                   })}
                   {/* Final/Winner Column */}
                   <div className="flex flex-col h-full px-8">
                        {winner ? (
                             <>
                                <h4 className="text-center font-bold uppercase tracking-widest text-secondary mb-6 h-5">Winner</h4>
                                <div className="flex-grow flex items-center">
                                    <WinnerDisplay winner={winner} albumName={album.name} />
                                </div>
                             </>
                        ) : (
                            finalMatchup && (
                                <>
                                    <h4 className="text-center font-bold uppercase tracking-widest text-secondary mb-6 h-5">Finals</h4>
                                    <div className="flex-grow flex items-center">
                                        <SingleMatchup matchup={finalMatchup} />
                                    </div>
                                </>
                            )
                        )}
                   </div>
                </div>
            </div>
        </div>
    )
}
