"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, updateDoc, arrayUnion } from 'firebase/firestore';
import type { Group, User as GroupUser, Bracket } from '@/lib/types';
import Header from '@/components/group/Header';
import BracketVisualizer from '@/components/group/BracketVisualizer';
import AddAlbum from '@/components/group/AddAlbum';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateRandomNickname } from '@/lib/nickname-generator';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Temporary mock data for bracket creation until album selection is implemented
const getMockBracket = (): Bracket => {
    const seed = Math.floor(Math.random() * 1000);
    const albumArt = PlaceHolderImages.find(img => img.id === 'album-2-art')?.imageUrl ?? `https://picsum.photos/seed/${300 + seed}/500/500`;
    const albumId = `album-${Date.now()}-${seed}`;

    const albumTracks = [
        { id: 't1', name: 'Metro Pulse', trackNumber: 1, previewUrl: null },
        { id: 't2', name: 'Rooftop Gardens', trackNumber: 2, previewUrl: null },
        { id: 't3', name: 'Alleyway Echoes', trackNumber: 3, previewUrl: null },
        { id: 't4', name: 'Glass Towers', trackNumber: 4, previewUrl: null },
        { id: 't5', name: 'Subway Rattle', trackNumber: 5, previewUrl: null },
        { id: 't6', name: 'Concrete Jungle', trackNumber: 6, previewUrl: null },
        { id: 't7', name: 'Pigeon Flight', trackNumber: 7, previewUrl: null },
        { id: 't8', name: 'Streetlight Serenade', trackNumber: 8, previewUrl: null },
    ];
    const album = {
        id: albumId,
        name: 'City Lights',
        artist: 'Urban Explorer',
        artworkUrl: albumArt,
        tracks: albumTracks,
    };
    const round1Matchups = [];
    for (let i = 0; i < album.tracks.length; i += 2) {
        round1Matchups.push({
        id: `m-r1-${i/2}`,
        track1: album.tracks[i],
        track2: album.tracks[i+1],
        winner: null,
        votes: { track1: 0, track2: 0 },
        });
    }
    return {
        id: `bracket-${album.id}`,
        album,
        rounds: [{ id: 'round-1', name: 'Quarter Finals', matchups: round1Matchups }, { id: 'round-2', name: 'Semi Finals', matchups: [{ id: 'm-r2-1', track1: null, track2: null, winner: null, votes: { track1: 0, track2: 0 } }, { id: 'm-r2-2', track1: null, track2: null, winner: null, votes: { track1: 0, track2: 0 } }] }, { id: 'round-3', name: 'Final', matchups: [{ id: 'm-r3-1', track1: null, track2: null, winner: null, votes: { track1: 0, track2: 0 } }] }],
        status: 'pending',
        winner: null,
    };
};


export default function GroupDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();

  // State for guest users
  const [guestNickname, setGuestNickname] = useState<string | null>(null);

  const [showAddAlbumDialog, setShowAddAlbumDialog] = useState(false);
  
  const groupRef = useMemo(() => firestore ? doc(firestore, 'groups', params.id) : null, [firestore, params.id]);
  const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'groups', params.id, 'users')) : null, [firestore, params.id]);

  const { data: groupData, loading: groupLoading } = useDoc<Omit<Group, 'users'>>(groupRef);
  const { data: usersData, loading: usersLoading } = useCollection<GroupUser>(usersQuery);

  const loading = authLoading || groupLoading || usersLoading;

  // Handle unauthenticated (guest) users
  useEffect(() => {
    if (!authLoading && !authUser) {
      const storageKey = `guestNickname_${params.id}`;
      let storedNickname = localStorage.getItem(storageKey);
      if (!storedNickname) {
        storedNickname = generateRandomNickname();
        localStorage.setItem(storageKey, storedNickname);
      }
      setGuestNickname(storedNickname);
    }
  }, [authLoading, authUser, params.id]);

  const handleAddAlbum = async () => {
    if (!firestore || !groupData) return;
    const newBracket = getMockBracket();
    const groupDocRef = doc(firestore, 'groups', params.id);
    await updateDoc(groupDocRef, {
        pendingBrackets: arrayUnion(newBracket)
    });
    setShowAddAlbumDialog(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!groupData) {
      return (
        <div className="flex flex-col gap-4 items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Group not found</h1>
            <p>This group may have been deleted or the link is incorrect.</p>
            <Button onClick={() => router.push('/create-group')}>Create a new group</Button>
        </div>
      );
  }

  const group: Group = {
      ...groupData,
      id: params.id,
      users: usersData || [],
      // Ensure arrays are not undefined
      pendingBrackets: groupData.pendingBrackets || [],
      archivedBrackets: groupData.archivedBrackets || [],
  };

  const isOwner = authUser?.uid === group.ownerId;
    
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* We pass a dummy function for onChangeNickname as it's not needed here */}
      <Header 
        group={group} 
        guestNickname={guestNickname}
        onChangeNickname={() => {}}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black tracking-wider uppercase">Dashboard</h2>
            {isOwner && (
                 <Button onClick={() => setShowAddAlbumDialog(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Play New Album
                </Button>
            )}
        </div>

        <Accordion type="multiple" defaultValue={['active', 'upcoming']} className="w-full space-y-4">
            <AccordionItem value="active" className="border-b-0">
                <AccordionTrigger className="text-xl font-bold tracking-wider uppercase p-4 bg-card rounded-t-lg hover:no-underline">Active Bracket</AccordionTrigger>
                <AccordionContent className="p-4 bg-card rounded-b-lg">
                {group.activeBracket ? (
                    <div className="border-t pt-4">
                        <Link href={`/group/${group.id}`}>
                            <BracketVisualizer bracket={group.activeBracket} />
                        </Link>
                    </div>
                 ) : <p className="text-muted-foreground text-center py-4">There is no active bracket.</p>}
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="upcoming" className="border-b-0">
                <AccordionTrigger className="text-xl font-bold tracking-wider uppercase p-4 bg-card rounded-t-lg hover:no-underline">Upcoming Brackets ({group.pendingBrackets.length})</AccordionTrigger>
                <AccordionContent className="p-4 bg-card rounded-b-lg">
                {group.pendingBrackets.length > 0 ? (
                    <div className="space-y-8 border-t pt-4">
                        {group.pendingBrackets.map(bracket => (
                            <BracketVisualizer key={bracket.id} bracket={bracket} />
                        ))}
                    </div>
                ) : <p className="text-muted-foreground text-center py-4">No upcoming brackets have been added.</p>}
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="completed" className="border-b-0">
                <AccordionTrigger className="text-xl font-bold tracking-wider uppercase p-4 bg-card rounded-t-lg hover:no-underline">Completed Brackets ({group.archivedBrackets.length})</AccordionTrigger>
                <AccordionContent className="p-4 bg-card rounded-b-lg">
                {group.archivedBrackets.length > 0 ? (
                     <div className="space-y-8 border-t pt-4">
                        {group.archivedBrackets.map(bracket => (
                            <BracketVisualizer key={bracket.id} bracket={bracket} />
                        ))}
                    </div>
                ): <p className="text-muted-foreground text-center py-4">No brackets have been completed yet.</p>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </main>
      
      <Dialog open={showAddAlbumDialog} onOpenChange={setShowAddAlbumDialog}>
        <DialogContent>
            <AddAlbum onAlbumAdd={handleAddAlbum} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
