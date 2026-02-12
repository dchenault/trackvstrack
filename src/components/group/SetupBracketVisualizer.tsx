
import Image from 'next/image';
import type { Album, Track } from '@/lib/types';
import { cn } from '@/lib/utils';

const BracketMatchupItem = ({ track, position }: { track: Track | null, position: 'top' | 'bottom' }) => {
    if (!track) {
        return (
            <div className={cn(
                "flex items-center h-10 px-3 text-sm rounded-md bg-card/30 text-muted-foreground/50 italic border-dashed border-2 border-border/20",
                position === 'top' ? 'rounded-b-none' : 'rounded-t-none'
            )}>
                -- BYE --
            </div>
        );
    }
    return (
        <div className={cn(
            "flex items-center h-10 px-3 text-sm rounded-md bg-card text-card-foreground",
            position === 'top' ? 'rounded-b-none' : 'rounded-t-none'
        )}>
            {track.name}
        </div>
    );
};

const PairedMatchup = ({ track1, track2 }: { track1: Track | null, track2: Track | null }) => {
    return (
        <div className="relative flex flex-col w-56">
            <BracketMatchupItem track={track1} position="top" />
            <div className="h-2" />
            <BracketMatchupItem track={track2} position="bottom" />
            <div className="absolute top-1/2 left-full h-px w-6 bg-border" />
        </div>
    );
};

export default function SetupBracketVisualizer({ tracks, album }: { tracks: Track[], album: Album }) {
    
    let finalTracks: (Track | null)[] = [...tracks];
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(finalTracks.length)));

    if (finalTracks.length > 1 && finalTracks.length < nextPowerOfTwo) {
        const byesNeeded = nextPowerOfTwo - finalTracks.length;
        for (let i = 0; i < byesNeeded; i++) {
            finalTracks.push(null);
        }
    }

    const midPoint = Math.ceil(finalTracks.length / 2);
    const leftTracks = finalTracks.slice(0, midPoint);
    const rightTracks = finalTracks.slice(midPoint).reverse(); // Reverse for right side layout

    const leftMatchups = [];
    for (let i = 0; i < leftTracks.length; i += 2) {
        leftMatchups.push({ track1: leftTracks[i], track2: leftTracks[i + 1] });
    }

    const rightMatchups = [];
    for (let i = 0; i < rightTracks.length; i += 2) {
        // For the right side, the visual order is often reversed
        rightMatchups.push({ track1: rightTracks[i], track2: rightTracks[i + 1] });
    }
    
    return (
        <div className="flex justify-center items-start gap-12 p-4 overflow-x-auto">
            {/* Left Bracket */}
            <div className="flex flex-col gap-10">
                <h3 className="text-lg font-bold text-center text-secondary uppercase tracking-widest">Round 1</h3>
                {leftMatchups.map((m, i) => (
                    <PairedMatchup key={`left-${i}`} track1={m.track1} track2={m.track2} />
                ))}
            </div>

            {/* Center Album Info */}
            <div className="flex flex-col items-center gap-4 pt-16 sticky left-1/2 -translate-x-1/2">
                <div className="relative w-48 h-48 md:w-64 md:h-64">
                    <Image 
                        src={album.artworkUrl} 
                        alt={`Art for ${album.name}`} 
                        fill
                        className="rounded-full object-cover border-4 border-primary shadow-2xl shadow-primary/30"
                        data-ai-hint="abstract album art"
                    />
                </div>
                <div className="text-center">
                    <h3 className="text-3xl font-black">{album.name}</h3>
                    <p className="text-xl text-muted-foreground">{album.artist}</p>
                </div>
            </div>

            {/* Right Bracket */}
            <div className="flex flex-col gap-10">
                <h3 className="text-lg font-bold text-center text-secondary uppercase tracking-widest">Round 1</h3>
                {rightMatchups.map((m, i) => (
                    <PairedMatchup key={`right-${i}`} track1={m.track1} track2={m.track2} />
                ))}
            </div>
        </div>
    );
}
