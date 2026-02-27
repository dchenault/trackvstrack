'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import UserProfile from '@/components/auth/UserProfile';

export default function Home() {
  const { user, loading } = useUser();

  const playUrl = user ? '/create-group' : '/login';

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden">
      <header className="absolute top-4 right-4 z-20">
        {loading ? (
          <Skeleton className="h-10 w-24 bg-white/10" />
        ) : user ? (
          <UserProfile />
        ) : (
          null
        )}
      </header>

      <main className="relative z-20 text-center flex flex-col items-center px-4">
        <div className="animate-neon-glow mb-4">
          <Image
            src="https://firebasestorage.googleapis.com/v0/b/studio-7633580652-c2695.firebasestorage.app/o/logo.png?alt=media"
            alt="Battle of the Band logo"
            width={700}
            height={350}
            className="object-contain"
            priority
          />
        </div>
        <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
          Pit your favorite albums and playlists against each other in an epic tournament bracket. Let the crowd decide the ultimate champion!
        </p>

        <div className="mt-12">
          {loading ? (
            <div className="p-1 rounded-xl bg-gradient-to-b from-zinc-400 to-zinc-700">
                <Button size="lg" disabled className="font-bold group text-xl px-10 py-5 bg-zinc-500">
                    <Loader2 className="mr-4 h-6 w-6 animate-spin" />
                    Loading...
                </Button>
            </div>
          ) : (
            <div className="p-1 rounded-xl bg-gradient-to-b from-zinc-400 to-zinc-700 shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-shadow duration-300">
              <Button
                asChild
                size="lg"
                className="w-full font-bold group text-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-[1.02]"
              >
                <Link href={playUrl} className="flex items-center gap-3 px-10 py-3">
                  <Play className="h-6 w-6" />
                  <span>Start a Battle</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>

      <footer className="absolute bottom-4 text-center text-muted-foreground text-sm z-20">
        <p>Built for the love of music.</p>
      </footer>
    </div>
  );
}
