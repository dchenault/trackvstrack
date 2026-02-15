
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, query } from 'firebase/firestore';
import type { Group, User as GroupUser, Bracket } from '@/lib/types';
import Header from '@/components/group/Header';
import AddAlbum from '@/components/group/AddAlbum';
import BracketCard from '@/components/group/BracketCard';
import { Card } from '@/components/ui/card';
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
import { Loader2, PlusCircle, Link as LinkIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateRandomNickname } from '@/lib/nickname-generator';
import { useToast } from '@/hooks/use-toast';
import { addAlbumBracket, getSpotifyRedirectUrl } from './actions';
import { SpotifyIcon } from '@/components/icons/spotify';

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
  
  // Check for Spotify connection
  const spotifyTokensRef = useMemo(() => (firestore && authUser) ? doc(firestore, 'spotify_tokens', authUser.uid) : null, [firestore, authUser]);
  const { data: spotifyTokens, loading: spotifyLoading } = useDoc(spotifyTokensRef);
  const isSpotifyConnected = !!spotifyTokens;

  const { data: groupData, loading: groupLoading } = useDoc<Omit<Group, 'users'>>(groupRef);
  const { data: usersData, loading: usersLoading } = useCollection<GroupUser>(usersQuery);

  const loading = authLoading || groupLoading || usersLoading || spotifyLoading;

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

  const handleConnectSpotify = async () => {
    if (!authUser || !groupData) return;
    // The owner of the group is the one who needs to connect their Spotify
    if (authUser.uid !== groupData.ownerId) {
        toast({
            variant: "destructive",
            title: "Only the group owner can connect Spotify.",
            description: "Please ask the group owner to connect their Spotify account to add albums."
        });
        return;
    }
    const res = await getSpotifyRedirectUrl(params.id, groupData.ownerId);
    if (res.success && res.url) {
      window.location.assign(res.url);
    } else {
      toast({
        variant: "destructive",
        title: "Spotify Connection Failed",
        description: res.error || "Could not generate a connection URL. Please try again.",
      });
    }
  };

  const handleAddAlbum = async (url: string) => {
    if (!groupData) return;
    setAddAlbumLoading(true);
    const formData = new FormData();
    formData.append("url", url);
    formData.append("groupId", params.id);
    formData.append("ownerId", groupData.ownerId);

    try {
      const response = await addAlbumBracket(formData);

      if (response.success) {
        toast({
          title: "Bracket Created!",
          description: `A new bracket has been added to your upcoming list.`,
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
  const safePendingBrackets = Array.isArray(group.pendingBrackets) ? group.pendingBrackets : [];
    
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
              isSpotifyConnected ? (
                 <Button onClick={() => setShowAddAlbumDialog(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Play New Album
                </Button>
              ) : (
                <Button onClick={handleConnectSpotify}>
                  <SpotifyIcon className="mr-2 h-5 w-5" />
                  Connect Spotify to Add Albums
                </Button>
              )
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
                <AccordionTrigger className="text-xl font-bold tracking-wider uppercase p-4 bg-card rounded-t-lg hover:no-underline">Upcoming Brackets ({safePendingBrackets.length})</AccordionTrigger>
                <AccordionContent className="p-4 bg-card rounded-b-lg">
                {safePendingBrackets.length > 0 ? (
                    <div className="border-t pt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {safePendingBrackets.map((bracket: Bracket, index: number) => (
                           <Link key={bracket?.id || index} href={`/group/${group.id}/bracket/${bracket.id}`}>
                                <BracketCard bracket={bracket} />
                           </Link>
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
              Paste a Spotify album or playlist URL to generate a new tournament bracket.
            </DialogDescription>
          </DialogHeader>
          <AddAlbum onAlbumAdd={handleAddAlbum} loading={addAlbumLoading} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
