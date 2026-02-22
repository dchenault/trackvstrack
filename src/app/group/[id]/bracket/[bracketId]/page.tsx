
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Group, Bracket, User as GroupUser, Track } from '@/lib/types';
import Header from '@/components/group/Header';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, Shuffle, SquareArrowOutUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { startBracket, removeTrackFromBracket } from './actions';
import { shuffleArray } from '@/lib/utils';
import SetupBracketVisualizer from '@/components/group/SetupBracketVisualizer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function PendingBracketPage({ params }: { params: { id: string; bracketId: string } }) {
    const router = useRouter();
    const firestore = useFirestore();
    const { user: authUser, loading: authLoading } = useUser();
    const { toast } = useToast();
    
    const [isStarting, setIsStarting] = useState(false);
    const [isShuffling, setIsShuffling] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [guestNickname, setGuestNickname] = useState<string | null>(null);
    
    // This state holds the tracks for client-side manipulation (shuffling)
    const [localTracks, setLocalTracks] = useState<Track[] | null>(null);

    const groupRef = useMemo(() => firestore ? doc(firestore, 'groups', params.id) : null, [firestore, params.id]);
    const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'groups', params.id, 'users')) : null, [firestore, params.id]);

    const { data: groupData, loading: groupLoading } = useDoc<Omit<Group, 'users'>>(groupRef);
    const { data: usersData, loading: usersLoading } = useCollection<GroupUser>(usersQuery);

    const loading = authLoading || groupLoading || usersLoading;

    // Derived state for the specific bracket we are viewing
    const bracket = useMemo(() => {
        if (!groupData) return null;
        return groupData.pendingBrackets?.find(b => b.id === params.bracketId) || null;
    }, [groupData, params.bracketId]);
    
    // Effect to synchronize the local track state with data from Firestore.
    // This runs only when the bracket data from Firestore changes.
    useEffect(() => {
        if (bracket?.album?.tracks) {
            setLocalTracks(bracket.album.tracks);
        }
    }, [bracket]);

    useEffect(() => {
        if (!authLoading && !authUser) {
          const storageKey = `guestNickname_${params.id}`;
          let storedNickname = localStorage.getItem(storageKey);
          if (!storedNickname) {
            storedNickname = "Guest" + Math.floor(Math.random() * 1000);
            localStorage.setItem(storageKey, storedNickname);
          }
          setGuestNickname(storedNickname);
        }
    }, [authLoading, authUser, params.id]);

    const handleShuffle = () => {
        if (!localTracks) return;
        setIsShuffling(true);
        setLocalTracks(shuffleArray([...localTracks]));
        // Add a small delay to provide visual feedback for the shuffle
        setTimeout(() => setIsShuffling(false), 300);
    };

    const handleStart = async () => {
        if (!localTracks || localTracks.length < 2) {
             toast({ 
                variant: "destructive", 
                title: "Not enough tracks", 
                description: "You need at least 2 tracks to start a bracket."
            });
            return;
        }
        setIsStarting(true);
        try {
            await startBracket(params.id, params.bracketId, localTracks);
            toast({ title: "Bracket Started!", description: "Let the games begin!" });
            // The action will handle the redirect, no need to push here.
        } catch (error) {
            console.error(error);
            toast({ 
                variant: "destructive", 
                title: "Starting Bracket Failed", 
                description: error instanceof Error ? error.message : "An unknown error occurred." 
            });
            setIsStarting(false);
        }
    };

    const handleRemoveTrack = async (trackId: string) => {
        if (isRemoving) return;
        setIsRemoving(true);
        try {
            const result = await removeTrackFromBracket(params.id, params.bracketId, trackId);
            if (!result.success) throw new Error(result.error);
            toast({ title: "Track removed successfully." });
            // Data will be automatically refetched by the useDoc hook due to server-side revalidation.
        } catch (error) {
            console.error(error);
            toast({ 
                variant: "destructive", 
                title: "Failed to remove track", 
                description: error instanceof Error ? error.message : "An unknown error occurred." 
            });
        } finally {
            setIsRemoving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!groupData || !usersData) {
        return <div>Error loading group data.</div>;
    }

    const group: Group = {
      ...groupData,
      id: params.id,
      users: usersData || []
    };
    
    if (!bracket) {
        return (
            <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
                <h1 className="text-2xl font-bold">Bracket not found</h1>
                <p>This bracket may have been started or deleted.</p>
                <Button onClick={() => router.push(`/group/${params.id}/dashboard`)}>Back to Dashboard</Button>
            </div>
        );
    }
    
    const isOwner = authUser?.uid === groupData?.ownerId;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header 
                group={group} 
                guestNickname={guestNickname}
                onChangeNickname={() => {}}
            />
            <main className="max-w-7xl mx-auto px-4 py-8">
                 <div className="mb-8 flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
                    <Image src={bracket.album.artworkUrl} alt={`Album art for ${bracket.album.name}`} width={200} height={200} className="aspect-square rounded-lg object-cover shadow-2xl" data-ai-hint="abstract album art"/>
                    <div className="flex-grow">
                        <p className="text-sm font-bold uppercase tracking-widest text-secondary">Bracket Setup</p>
                        <h1 className="text-4xl lg:text-5xl font-black text-white">{bracket.album.name}</h1>
                        <h2 className="text-2xl text-muted-foreground">{bracket.album.artist}</h2>
                        {bracket.album.description && (<p className="mt-2 max-w-prose text-sm text-muted-foreground">{bracket.album.description}</p>)}
                         <Link href={`https://open.spotify.com/album/${bracket.album.id}`} target="_blank" className="inline-flex items-center gap-2 text-sm mt-2 text-muted-foreground hover:text-primary transition-colors">
                            View on Spotify <SquareArrowOutUpRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {isOwner && (
                    <Card className="mb-8 bg-card/50">
                        <CardContent className="p-4 flex flex-col md:flex-row justify-center items-center gap-4">
                             <Button onClick={handleShuffle} disabled={isStarting || isShuffling || isRemoving} variant="outline" size="lg">
                                {isShuffling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shuffle className="mr-2 h-4 w-4" />}
                                Shuffle
                            </Button>
                            <Button onClick={handleStart} disabled={isStarting || isShuffling || isRemoving} size="lg">
                                {isStarting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                )}
                                Play Album
                            </Button>
                        </CardContent>
                    </Card>
                )}
                
                {localTracks && localTracks.length > 0 && (
                    <SetupBracketVisualizer 
                        tracks={localTracks} 
                        album={bracket.album} 
                        onRemoveTrack={handleRemoveTrack}
                        isOwner={isOwner}
                        isRemoving={isRemoving}
                    />
                )}
            </main>
        </div>
    );
}
