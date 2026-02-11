import Image from 'next/image';
import type { Bracket } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

export default function BracketCard({ bracket }: { bracket: Bracket }) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg group border-none">
        <div className="relative aspect-square">
            <Image
                src={bracket.album.artworkUrl}
                alt={`Album art for ${bracket.album.name}`}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                data-ai-hint={bracket.album.artworkUrl.includes('picsum') ? 'abstract colorful' : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                 <h3 className="text-lg font-bold truncate">{bracket.album.name}</h3>
                 <p className="text-sm text-muted-foreground truncate">{bracket.album.artist}</p>
            </div>

            {bracket.winner && (
                <div className="absolute top-0 left-0 right-0 p-3">
                    <div className="flex items-center gap-2 text-yellow-300 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 w-fit">
                        <Trophy className="w-4 h-4" />
                        <p className="text-xs font-bold truncate">{bracket.winner.name}</p>
                    </div>
                </div>
            )}
        </div>
    </Card>
  );
}
