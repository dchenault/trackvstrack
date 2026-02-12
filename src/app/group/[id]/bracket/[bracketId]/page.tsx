
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Group, Bracket, User as GroupUser, Track } from '@/lib/types';
import Header from '@/components/group/Header';
import { Button } from '@/components/ui/button';
import { Loader2, PlayCircle, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { startBracket } from './actions';
import { shuffleArray } from '@/lib/utils';
import SetupBracketVisualizer from '@/components/group/SetupBracketVisualizer';

export default function PendingBracketPage({ params }: { params: { id: string; bracketId: string } }) {
    const router = useRouter();
    const firestore = useFirestore();
    const { user: authUser, loading: authLoading } = useUser();
    const { toast } = useToast();
    
    const [isStarting, setIsStarting] = useState(false);
    const [guestNickname, setGuestNickname] = useState<string | null>(null);
    const [shuffledTracks, setShuffledTracks] = useState<Track[]>([]);

    const groupRef = useMemo(() => firestore ? doc(firestore, 'groups', params.id) : null, [firestore, params.id]);
    const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'groups', params.id, 'users')) : null, [firestore, params.id]);

    const { data: groupData, loading: groupLoading } = useDoc<Omit<Group, 'users'>>(groupRef);
    const { data: usersData, loading: usersLoading } = useCollection<GroupUser>(usersQuery);

    const loading = authLoading || groupLoading || usersLoading;

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

    const bracket = useMemo(() => {
        if (!groupData) return null;
        return groupData.pendingBrackets?.find(b => b.id === params.bracketId) || null;
    }, [groupData, params.bracketId]);

    useEffect(() => {
        if (bracket?.album?.tracks && shuffledTracks.length === 0) {
            setShuffledTracks(shuffleArray([...bracket.album.tracks]));
        }
    }, [bracket, shuffledTracks.length]);

    const handleShuffle = () => {
        setShuffledTracks(shuffleArray([...shuffledTracks]));
    };

    const handleStart = async () => {
        if (!shuffledTracks || shuffledTracks.length === 0) return;
        setIsStarting(true);
        try {
            await startBracket(params.id, params.bracketId, shuffledTracks);
            toast({ title: "Bracket Started!", description: "Let the games begin!" });
            // The action will handle the redirect
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
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white">Bracket Setup</h1>
                    <p className="text-muted-foreground">Shuffle the tracks and start the tournament when you're ready.</p>
                </div>
                {isOwner && (
                    <div className="flex justify-center items-center gap-4 mb-8">
                        <Button onClick={handleShuffle} disabled={isStarting} variant="outline">
                            <Shuffle className="mr-2 h-4 w-4" />
                            Shuffle
                        </Button>
                        <Button onClick={handleStart} disabled={isStarting}>
                            {isStarting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <PlayCircle className="mr-2 h-4 w-4" />
                            )}
                            Play Album
                        </Button>
                    </div>
                )}
                
                {shuffledTracks.length > 0 && (
                    <SetupBracketVisualizer tracks={shuffledTracks} album={bracket.album} />
                )}
            </main>
        </div>
    );
}
