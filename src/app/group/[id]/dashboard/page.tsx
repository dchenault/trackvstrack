"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query, updateDoc, arrayUnion } from 'firebase/firestore';
import type { Group, User as GroupUser, Bracket, Album } from '@/lib/types';
import Header from '@/components/group/Header';
import AddAlbum from '@/components/group/AddAlbum';
import BracketCard from '@/components/group/BracketCard';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateRandomNickname } from '@/lib/nickname-generator';
import { useToast } from '@/hooks/use-toast';
import { shuffleArray } from '@/lib/utils';
import { addAlbumBracket } from './actions';

const createBracketFromAlbum = (album: Album): Bracket => {
    const shuffledTracks = shuffleArray([...album.tracks]);
    
    const getRoundName = (numMatchups: number, roundNum: number): string => {
        if (numMatchups === 1) return 'Final';
        if (numMatchups === 2) return 'Semi-Finals';
        if (numMatchups === 4) return 'Quarter-Finals';
        if (numMatchups === 8) return 'Round of 16';
        return `Round ${roundNum}`;
    }

    const round1Matchups = [];
    for (let i = 0; i < shuffledTracks.length; i += 2) {
        round1Matchups.push({
            id: `m-r1-${i / 2}`,
            track1: shuffledTracks[i],
            track2: shuffledTracks[i + 1],
            winner: null,
            votes: { track1: 0, track2: 0 },
        });
    }

    const rounds = [
        { id: 'round-1', name: getRoundName(round1Matchups.length, 1), matchups: round1Matchups }
    ];

    let numMatchupsInPreviousRound = round1Matchups.length;
    let roundNum = 2;
    while(numMatchupsInPreviousRound > 1) {
        const numMatchupsInCurrentRound = numMatchupsInPreviousRound / 2;
        const currentRoundMatchups = [];
        for (let i=0; i<numMatchupsInCurrentRound; i++) {
            currentRoundMatchups.push({
                id: `m-r${roundNum}-${i}`,
                track1: null,
                track2: null,
                winner: null,
                votes: { track1: 0, track2: 0 },
            });
        }
        rounds.push({
            id: `round-${roundNum}`,
            name: getRoundName(numMatchupsInCurrentRound, roundNum),
            matchups: currentRoundMatchups,
        });
        numMatchupsInPreviousRound = numMatchupsInCurrentRound;
        roundNum++;
    }

    return {
        id: `bracket-${album.id}-${Math.random().toString(36).substring(2, 9)}`,
        album,
        rounds,
        status: 'pending',
        winner: null,
    };
}

type AlbumSource = 'spotify' | 'youtube' | 'musicbrainz';

export default function GroupDashboardPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();
  const { toast } = useToast();

  const [guestNickname, setGuestNickname] = useState<string | null>(null);

  const [showAddAlbumDialog, setShowAddAlbumDialog] = useState(false);
  const [addAlbumLoading, setAddAlbumLoading] = useState(false);
  
  const groupRef = useMemo(() => firestore ? doc(firestore, 'groups', params.id) : null, [firestore, params.id]);
  const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'groups', params.id, 'users')) : null, [firestore, params.id]);

  const { data: groupData, loading: groupLoading } = useDoc<Omit<Group, 'users'>>(groupRef);
  const { data: usersData, loading: usersLoading } = useCollection<GroupUser>(usersQuery);

  const loading = authLoading || groupLoading || usersLoading;

  useEffect(() => {
    console.log("DASHBOARD DATA:", { groupData, usersData });
  }, [groupData, usersData]);

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

  const handleAddAlbum = async (url: string, source: AlbumSource) => {
    setAddAlbumLoading(true);
    const formData = new FormData();
    formData.append("url", url);

    try {
      const response = await addAlbumBracket(formData);

      if (response.success && response.result) {
        // The server action returns "TEST_STRING_ONLY" which is not a valid Album object.
        // This will cause createBracketFromAlbum to fail. The catch block will handle it.
        const newBracket = createBracketFromAlbum(response.result as any);
        if (groupRef) {
          await updateDoc(groupRef, {
            pendingBrackets: arrayUnion(newBracket),
          });
        }
        toast({
          title: "Bracket Created!",
          description: `A new bracket for "${(response.result as any).name}" has been added.`,
        });
      } else {
        throw new Error(response.error || "Failed to create bracket.");
      }
    } catch (error: any) {
      console.error("Error adding new album bracket:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description:
          error.message ||
          "Could not add the album. Please check the URL and try again.",
      });
    } finally {
      setAddAlbumLoading(false);
      setShowAddAlbumDialog(false);
    }
  };


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
      pendingBrackets: groupData.pendingBrackets || [],
      archivedBrackets: groupData.archivedBrackets || [],
  };

  const isOwner = authUser?.uid === group.ownerId;
    
  return (
    <div className="min-h-screen bg-background text-foreground">
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
                        <Link href={`/group/${group.id}`} className="max-w-sm mx-auto block">
                            <BracketCard bracket={group.activeBracket} />
                        </Link>
                    </div>
                 ) : <p className="text-muted-foreground text-center py-4">There is no active bracket.</p>}
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="upcoming" className="border-b-0">
                <AccordionTrigger className="text-xl font-bold tracking-wider uppercase p-4 bg-card rounded-t-lg hover:no-underline">Upcoming Brackets ({Array.isArray(group.pendingBrackets) ? group.pendingBrackets.length : 0})</AccordionTrigger>
                <AccordionContent className="p-4 bg-card rounded-b-lg">
                {Array.isArray(group.pendingBrackets) && group.pendingBrackets.length > 0 ? (
                    <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {group.pendingBrackets.map(bracket => (
                            bracket && <BracketCard key={bracket.id} bracket={bracket} />
                        ))}
                    </div>
                ) : <p className="text-muted-foreground text-center py-4">No upcoming brackets have been added.</p>}
                </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="completed" className="border-b-0">
                <AccordionTrigger className="text-xl font-bold tracking-wider uppercase p-4 bg-card rounded-t-lg hover:no-underline">Completed Brackets ({Array.isArray(group.archivedBrackets) ? group.archivedBrackets.length : 0})</AccordionTrigger>
                <AccordionContent className="p-4 bg-card rounded-b-lg">
                {Array.isArray(group.archivedBrackets) && group.archivedBrackets.length > 0 ? (
                     <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {group.archivedBrackets.map(bracket => (
                            bracket && <BracketCard key={bracket.id} bracket={bracket} />
                        ))}
                    </div>
                ): <p className="text-muted-foreground text-center py-4">No brackets have been completed yet.</p>}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </main>
      
      <Dialog open={showAddAlbumDialog} onOpenChange={setShowAddAlbumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Bracket</DialogTitle>
            <DialogDescription>
              Paste an album URL from Spotify, YouTube, or MusicBrainz to generate a new tournament bracket.
            </DialogDescription>
          </DialogHeader>
          <AddAlbum onAlbumAdd={handleAddAlbum} loading={addAlbumLoading} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
