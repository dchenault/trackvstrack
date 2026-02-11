import type { Bracket, Round, Matchup, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';

const BracketTrack = ({ track, isWinner }: { track: Track | null, isWinner: boolean }) => (
  <div className={cn(
    "flex items-center justify-between w-full h-8 px-2 text-sm rounded-md",
    !track && "bg-card/50",
    track && isWinner && "bg-primary/80 text-primary-foreground font-bold border-2 border-primary",
    track && !isWinner && "bg-card text-muted-foreground italic"
  )}>
    <span>{track?.name ?? '...'}</span>
    {track && <span className="font-mono text-xs">{isWinner ? 'W' : 'L'}</span>}
  </div>
);

const BracketMatchup = ({ matchup }: { matchup: Matchup }) => {
  const winnerIsTrack1 = matchup.winner && matchup.winner.id === matchup.track1?.id;
  const winnerIsTrack2 = matchup.winner && matchup.winner.id === matchup.track2?.id;

  return (
    <div className="flex flex-col gap-1 w-48">
      <BracketTrack track={matchup.track1} isWinner={!!winnerIsTrack1} />
      <BracketTrack track={matchup.track2} isWinner={!!winnerIsTrack2} />
    </div>
  );
}

const BracketRound = ({ round, isFinal }: { round: Round, isFinal: boolean }) => (
  <div className="flex flex-col items-center justify-around flex-1 gap-6">
    <h4 className="font-bold text-lg text-secondary tracking-widest uppercase">{round.name}</h4>
    <div className={cn("flex flex-col gap-12", isFinal && "justify-center")}>
      {round.matchups.map(matchup => (
        <div key={matchup.id} className="relative flex items-center">
            <BracketMatchup matchup={matchup} />
            {!isFinal && <div className="absolute left-full top-1/2 -translate-y-1/2 w-8 h-px bg-border"></div>}
            {!isFinal && <div className="absolute left-[calc(100%+2rem)] top-1/2 -translate-y-1/2 w-px h-[calc(100%+3rem)] bg-border"></div>}
        </div>
      ))}
    </div>
  </div>
);

const BracketWinner = ({ winner, albumName }: { winner: Track, albumName: string }) => (
    <div className="flex flex-col items-center gap-4">
        <Trophy className="w-24 h-24 text-yellow-400" strokeWidth={1} />
        <div className="text-center">
            <p className="text-muted-foreground">Winner of</p>
            <h3 className="text-2xl font-bold">{albumName}</h3>
            <h2 className="text-4xl font-black text-primary mt-2">{winner.name}</h2>
        </div>
    </div>
);

export default function BracketVisualizer({ bracket }: { bracket: Bracket }) {
  const { rounds, winner, album } = bracket;
  
  return (
    <div className="w-full p-4 md:p-8">
      <h2 className="text-3xl font-black text-center mb-8 uppercase tracking-wider">Tournament Bracket</h2>
      <div className="flex justify-center items-start gap-8 overflow-x-auto pb-8">
        {rounds.map((round, index) => (
          <BracketRound key={round.id} round={round} isFinal={index === rounds.length - 1} />
        ))}
        {winner && (
            <div className="flex flex-col items-center justify-center flex-1">
                <BracketWinner winner={winner} albumName={album.name}/>
            </div>
        )}
      </div>
    </div>
  )
}
