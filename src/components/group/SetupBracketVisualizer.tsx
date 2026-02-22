
import Image from 'next/image';
import type { Album, Track } from '@/lib/types';
import { cn } from '@/lib/utils';

const BracketMatchupItem = ({ track, position }: { track: Track | null, position: 'top' | 'bottom' }) => {
    if (!track) {
        return (
            <div className={cn(
                "flex items-center h-10 px-3 text-sm rounded-sm bg-card/30 text-muted-foreground/50 italic border-dashed border border-border/20",
                position === 'top' ? 'rounded-b-none' : 'rounded-t-none'
            )}>
                -- BYE --
            </div>
        );
    }
    return (
        <div className={cn(
            "flex items-center h-10 px-3 text-sm rounded-sm bg-card text-card-foreground border border-border/50",
            position === 'top' ? 'rounded-b-none' : 'rounded-t-none'
        )}>
            {track.name}
        </div>
    );
};

const PairedMatchup = ({ track1, track2, direction }: { track1: Track | null, track2: Track | null, direction: 'left' | 'right' }) => {
    return (
        <div className="relative w-56">
            {/* Matchup Box */}
            <div className="flex flex-col">
                <BracketMatchupItem track={track1} position="top" />
                <div className="h-2" />
                <BracketMatchupItem track={track2} position="bottom" />
            </div>
            
            {/* Connector Lines */}
            <div className={cn(
                "absolute top-1/4 h-px w-4 bg-border",
                direction === 'right' ? 'left-full' : 'right-full'
            )} />
            <div className={cn(
                "absolute bottom-1/4 h-px w-4 bg-border",
                direction === 'right' ? 'left-full' : 'right-full'
            )} />
            <div className={cn(
                "absolute top-1/4 h-1/2 w-px bg-border",
                direction === 'right' ? 'left-[calc(100%+1rem)]' : 'right-[calc(100%+1rem)]'
            )} />
            <div className={cn(
                "absolute top-1/2 -translate-y-px h-px w-4 bg-border",
                 direction === 'right' ? 'left-[calc(100%+1rem)]' : 'right-[calc(100%+1rem)]'
            )} />
        </div>
    );
};

export default function SetupBracketVisualizer({ tracks, album }: { tracks: Track[], album: Album }) {
    
    let finalTracks: (Track | null)[] = [...tracks];
    const numTracks = finalTracks.length;
    
    if (numTracks > 1) {
        const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numTracks)));
        if (numTracks < nextPowerOfTwo) {
            const byesNeeded = nextPowerOfTwo - numTracks;
            for (let i = 0; i < byesNeeded; i++) {
                finalTracks.push(null);
            }
        }
    }

    const midPoint = Math.ceil(finalTracks.length / 2);
    const leftTracks = finalTracks.slice(0, midPoint);
    const rightTracks = finalTracks.slice(midPoint);

    const createPairs = (trackList: (Track | null)[]) => {
        const pairs = [];
        for (let i = 0; i < trackList.length; i += 2) {
            pairs.push({ track1: trackList[i], track2: trackList[i + 1] ?? null });
        }
        return pairs;
    }

    const leftPairs = createPairs(leftTracks);
    const rightPairs = createPairs(rightTracks);
    
    return (
        <div className="flex justify-center items-start gap-12 p-4 overflow-x-auto min-w-max">
            {/* Left Bracket */}
            <div className="flex flex-col gap-10 items-end">
                <h3 className="text-lg font-bold text-center text-secondary uppercase tracking-widest w-56">Round 1 (Left)</h3>
                {leftPairs.map((p, i) => (
                    <PairedMatchup key={`left-${i}`} track1={p.track1} track2={p.track2} direction="right" />
                ))}
            </div>

            {/* Center Album Info */}
            <div className="flex flex-col items-center gap-4 pt-16 px-8 flex-shrink-0">
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                    <Image 
                        src={album.artworkUrl} 
                        alt={`Art for ${album.name}`} 
                        fill
                        className="rounded-full object-cover border-4 border-primary shadow-2xl shadow-primary/30"
                        data-ai-hint="abstract album art"
                    />
                </div>
                <div className="text-center max-w-xs">
                    <h3 className="text-3xl font-black">{album.name}</h3>
                    <p className="text-xl text-muted-foreground">{album.artist}</p>
                </div>
            </div>

            {/* Right Bracket */}
            <div className="flex flex-col gap-10 items-start">
                <h3 className="text-lg font-bold text-center text-secondary uppercase tracking-widest w-56">Round 1 (Right)</h3>
                 {rightPairs.map((p, i) => (
                    <PairedMatchup key={`right-${i}`} track1={p.track1} track2={p.track2} direction="left" />
                ))}
            </div>
        </div>
    );
}
