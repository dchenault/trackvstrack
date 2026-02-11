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
      <Image
        src="https://static.vecteezy.com/system/resources/previews/013/787/732/non_2x/a-80s-grid-background-with-a-neon-horizon-vector.jpg"
        alt="80s retro grid background"
        fill
        className="object-cover z-0"
        priority
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-background/50 via-background/80 to-background" />

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
        <h1
          className="text-6xl md:text-8xl font-black text-primary font-headline animate-neon-glow"
        >
          Track vs Track
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-xl mx-auto">
          Create a tournament for your favorite album and find out which track reigns supreme. Create a group, share the link, and let the voting begin!
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
                  <span>Play Album</span>
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
