
import Image from 'next/image';
import type { Album, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const BracketMatchupItem = ({ 
    track, 
    position,
    onRemoveTrack,
    isOwner,
    isRemoving
}: { 
    track: Track | null, 
    position: 'top' | 'bottom',
    onRemoveTrack: (trackId: string) => void,
    isOwner: boolean,
    isRemoving: boolean
}) => {
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
            "group relative flex items-center justify-between h-10 px-3 text-sm rounded-sm bg-card text-card-foreground border border-border/50",
            position === 'top' ? 'rounded-b-none' : 'rounded-t-none'
        )}>
            <span className="truncate pr-6">{track.name}</span>
            {isOwner && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTrack(track.id);
                    }}
                    disabled={isRemoving}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-destructive/80 hover:bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
};

const PairedMatchup = ({ 
    track1, 
    track2, 
    direction,
    onRemoveTrack,
    isOwner,
    isRemoving 
}: { 
    track1: Track | null, 
    track2: Track | null, 
    direction: 'left' | 'right',
    onRemoveTrack: (trackId: string) => void,
    isOwner: boolean,
    isRemoving: boolean
}) => {
    return (
        <div className="relative w-56">
            {/* Matchup Box */}
            <div className="flex flex-col">
                <BracketMatchupItem track={track1} position="top" onRemoveTrack={onRemoveTrack} isOwner={isOwner} isRemoving={isRemoving} />
                <div className="h-2" />
                <BracketMatchupItem track={track2} position="bottom" onRemoveTrack={onRemoveTrack} isOwner={isOwner} isRemoving={isRemoving} />
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

export default function SetupBracketVisualizer({ 
    tracks, 
    album, 
    onRemoveTrack,
    isOwner,
    isRemoving
}: { 
    tracks: Track[], 
    album: Album,
    onRemoveTrack: (trackId: string) => void,
    isOwner: boolean,
    isRemoving: boolean
}) {
    
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
        <div className="flex justify-center items-start gap-12 p-4 overflow-x-auto min-w-max bg-card/20 rounded-lg border border-border/20">
            {/* Left Bracket */}
            <div className="flex flex-col gap-10 items-end">
                <h3 className="text-lg font-bold text-center text-secondary uppercase tracking-widest w-56">Round 1 (Left)</h3>
                {leftPairs.map((p, i) => (
                    <PairedMatchup 
                        key={`left-${i}-${p.track1?.id || 'bye'}`} 
                        track1={p.track1} 
                        track2={p.track2} 
                        direction="right" 
                        onRemoveTrack={onRemoveTrack}
                        isOwner={isOwner}
                        isRemoving={isRemoving}
                    />
                ))}
            </div>

            {/* Center Area */}
            <div className="flex flex-col items-center gap-4 pt-16 px-8 flex-shrink-0">
                 <div className="text-center max-w-xs">
                    <h3 className="text-3xl font-black">VS</h3>
                </div>
            </div>

            {/* Right Bracket */}
            <div className="flex flex-col gap-10 items-start">
                <h3 className="text-lg font-bold text-center text-secondary uppercase tracking-widest w-56">Round 1 (Right)</h3>
                 {rightPairs.map((p, i) => (
                    <PairedMatchup 
                        key={`right-${i}-${p.track1?.id || 'bye'}`} 
                        track1={p.track1} 
                        track2={p.track2} 
                        direction="left"
                        onRemoveTrack={onRemoveTrack}
                        isOwner={isOwner}
                        isRemoving={isRemoving}
                    />
                ))}
            </div>
        </div>
    );
}
