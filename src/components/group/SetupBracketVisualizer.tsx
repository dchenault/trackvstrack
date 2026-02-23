import type { Album, Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

const BracketMatchupItem = ({ 
    track, 
    onRemoveTrack,
    isOwner,
    isRemoving
}: { 
    track: Track | null, 
    onRemoveTrack: (trackId: string) => void,
    isOwner: boolean,
    isRemoving: boolean
}) => {
    if (!track) {
        return (
            <div className="flex items-center h-10 px-3 text-sm rounded-md bg-card/30 text-muted-foreground/50 italic border-dashed border border-border/20">
                -- BYE --
            </div>
        );
    }

    return (
        <div className="group relative flex items-center justify-between h-10 px-3 text-sm rounded-md bg-card text-card-foreground border border-border/50">
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

    const pairs = [];
    for (let i = 0; i < finalTracks.length; i += 2) {
        pairs.push({ track1: finalTracks[i], track2: finalTracks[i + 1] ?? null });
    }
    
    return (
        <div className="flex flex-col items-center gap-6 p-4 overflow-x-auto bg-card/20 rounded-lg border border-border/20 w-full">
            <h3 className="text-lg font-bold text-center text-secondary uppercase tracking-widest">
                Round 1 Preview
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-4 w-full">
                {pairs.map((p, i) => (
                    <div key={`setup-pair-${i}-${p.track1?.id || 'bye'}`} className="space-y-1">
                       <BracketMatchupItem 
                            track={p.track1}
                            onRemoveTrack={onRemoveTrack}
                            isOwner={isOwner}
                            isRemoving={isRemoving}
                        />
                         <BracketMatchupItem 
                            track={p.track2}
                            onRemoveTrack={onRemoveTrack}
                            isOwner={isOwner}
                            isRemoving={isRemoving}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
