
'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Group, Bracket, User as GroupUser, Track } from '@/lib/types';
import Header from '@/components/group/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PlayCircle, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { activateBracket } from './actions';

export default function PendingBracketPage({ params }: { params: { id: string; bracketId: string } }) {
    const router = useRouter();
    const firestore = useFirestore();
    const { user: authUser, loading: authLoading } = useUser();
    const { toast } = useToast();
    
    const [isActivating, setIsActivating] = useState(false);
    const [guestNickname, setGuestNickname] = useState<string | null>(null);

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
            // Placeholder if generator is not available or for brevity
            storedNickname = "Guest" + Math.floor(Math.random() * 1000);
            localStorage.setItem(storageKey, storedNickname);
          }
          setGuestNickname(storedNickname);
        }
    }, [authLoading, authUser, params.id]);

    const bracket = useMemo(() => {
        if (!groupData) return null;
        const foundBracket = groupData.pendingBrackets?.find(b => b.id === params.bracketId);
        return foundBracket;
    }, [groupData, params.bracketId]);

    const handleActivate = async () => {
        setIsActivating(true);
        try {
            await activateBracket(params.id, params.bracketId);
            toast({ title: "Bracket Activated!", description: "Let the games begin!" });
        } catch (error) {
            console.error(error);
            toast({ 
                variant: "destructive", 
                title: "Activation Failed", 
                description: error instanceof Error ? error.message : "An unknown error occurred." 
            });
            setIsActivating(false);
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
            <main className="max-w-4xl mx-auto px-4 py-8">
                <Card className="overflow-hidden">
                    <div className="relative h-64 md:h-80">
                        <Image
                            src={bracket.album.artworkUrl}
                            alt={`Album art for ${bracket.album.name}`}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                        <div className="absolute bottom-0 left-0 p-6">
                            <h1 className="text-4xl md:text-5xl font-black text-white">{bracket.album.name}</h1>
                            <h2 className="text-xl md:text-2xl text-muted-foreground font-semibold">{bracket.album.artist}</h2>
                        </div>
                    </div>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Tracklist</span>
                            {isOwner && (
                                <Button onClick={handleActivate} disabled={isActivating}>
                                    {isActivating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <PlayCircle className="mr-2 h-4 w-4" />
                                    )}
                                    Play this Album
                                </Button>
                            )}
                        </CardTitle>
                        <CardDescription>
                            This is a pending bracket. Once activated, the tournament will begin.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {bracket.album.tracks.map((track: Track) => (
                                <li key={track.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-card">
                                    <Music className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{track.name}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
