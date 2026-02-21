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
        <span className={cn('truncate', !isWinner && 'text-muted-foreground')}>{track?.name ?? 'BYE'}</span>
        {track && isWinner && <Trophy className="h-4 w-4 text-yellow-500 flex-shrink-0 ml-2" />}
    </div>
);

const SingleMatchup = ({ matchup }: { matchup: Matchup }) => {
    const winnerIsTrack1 = !!matchup.winner && matchup.track1?.id === matchup.winner.id;
    const winnerIsTrack2 = !!matchup.winner && matchup.track2?.id === matchup.winner.id;

    if (!matchup.track1 && !matchup.track2) {
        return <div className="h-[89px] w-48" />;
    }

    return (
        <div className="w-48 overflow-hidden rounded-md border bg-card text-card-foreground shadow-sm">
            <BracketItem track={matchup.track1} isWinner={winnerIsTrack1} />
            <hr className="border-border" />
            <BracketItem track={matchup.track2} isWinner={winnerIsTrack2} />
        </div>
    );
};

const PairedMatchups = ({
    matchup1,
    matchup2,
    isFinalPair,
}: {
    matchup1: Matchup;
    matchup2?: Matchup;
    isFinalPair: boolean;
}) => (
    <div className="relative">
        <div className="flex flex-col gap-6">
            <SingleMatchup matchup={matchup1} />
            {matchup2 ? <SingleMatchup matchup={matchup2} /> : <div className="h-[89px] w-48" />}
        </div>
        {!isFinalPair && (
            <>
                <div className="absolute left-full top-[44px] h-px w-6 bg-border" />
                {matchup2 && <div className="absolute left-full bottom-[44px] h-px w-6 bg-border" />}
                {matchup2 && <div className="absolute left-[calc(100%+1.5rem)] top-[44px] h-[calc(100%-88px)] w-px bg-border" />}
                <div className="absolute left-[calc(100%+1.5rem)] top-1/2 h-px w-6 -translate-y-1/2 bg-border" />
            </>
        )}
    </div>
);

const FinalMatchup = ({ matchup }: { matchup: Matchup }) => (
    <div className="flex flex-col items-center gap-4">
        <SingleMatchup matchup={matchup} />
    </div>
);

const WinnerDisplay = ({ winner, albumName }: { winner: Track, albumName: string }) => (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <Trophy className="h-20 w-20 text-yellow-400" strokeWidth={1} />
        <div>
            <p className="text-muted-foreground">Tournament Winner</p>
            <h3 className="text-2xl font-bold">{albumName}</h3>
        </div>
        <h2 className="text-4xl font-black text-primary">{winner.name}</h2>
    </div>
);

export default function BracketVisualizer({ bracket }: { bracket: Bracket }) {
    const { rounds, winner, album } = bracket;
    const matchupsByRound = rounds.map(r => r.matchups);

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
                <div className="inline-flex items-start gap-12 p-4">
                    {matchupsByRound.map((matchups, roundIndex) => {
                        const isFinalRound = roundIndex === matchupsByRound.length - 1;
                        if (isFinalRound && matchups.length === 1) {
                            return null;
                        }
                        return (
                            <div key={rounds[roundIndex].id} className="flex flex-col justify-around gap-20 pt-8">
                                <h4 className="text-center font-bold uppercase tracking-widest text-secondary -mt-8 mb-0 absolute">{rounds[roundIndex].name}</h4>
                                {Array.from({ length: Math.ceil(matchups.length / 2) }).map((_, i) => (
                                    <PairedMatchups
                                        key={matchups[i * 2].id}
                                        matchup1={matchups[i * 2]}
                                        matchup2={matchups[i * 2 + 1]}
                                        isFinalPair={isFinalRound}
                                    />
                                ))}
                            </div>
                        );
                    })}

                    <div className="flex h-full flex-col items-center justify-around gap-20 pt-8">
                        {winner ? (
                            <>
                                <h4 className="text-center font-bold uppercase tracking-widest text-secondary -mt-8 mb-0 absolute">Winner</h4>
                                <WinnerDisplay winner={winner} albumName={album.name} />
                            </>
                        ) : (
                            rounds[rounds.length - 1]?.matchups.length === 1 && (
                                <>
                                    <h4 className="text-center font-bold uppercase tracking-widest text-secondary -mt-8 mb-0 absolute">Finals</h4>
                                    <FinalMatchup matchup={rounds[rounds.length - 1].matchups[0]} />
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
