'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, loading } = useUser();

  const playUrl = user ? '/group/123-abc-789' : '/login';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-primary animate-neon-glow font-headline">
          Track vs Track
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Create a tournament for your favorite album and find out which track reigns supreme. Create a group, share the link, and let the voting begin!
        </p>
      </header>

      {loading ? (
        <Button size="lg" className="font-bold group text-xl p-8" disabled>
          <Play className="mr-4 h-8 w-8 animate-spin" />
           Loading...
        </Button>
      ) : (
        <Button asChild size="lg" className="font-bold group text-xl p-8">
            <Link href={playUrl}>
            <Play className="mr-4 h-8 w-8" />
            Play Album
            </Link>
        </Button>
      )}


      <footer className="absolute bottom-4 text-center text-muted-foreground text-sm">
        <p>Built for the love of music.</p>
      </footer>
    </div>
  );
}
