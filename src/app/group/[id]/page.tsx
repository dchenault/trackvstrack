"use client";

import { useState, useEffect, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, setDoc, query, serverTimestamp } from 'firebase/firestore';
import type { Group, User as GroupUser, Bracket } from '@/lib/types';
import Header from '@/components/group/Header';
import CurrentMatchup from '@/components/group/CurrentMatchup';
import BracketVisualizer from '@/components/group/BracketVisualizer';
import AddAlbum from '@/components/group/AddAlbum';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { generateRandomNickname } from '@/lib/nickname-generator';

// Temporary mock data for bracket creation until album selection is implemented
const getMockBracket = (): Bracket => {
    const neonDreamsArt = PlaceHolderImages.find(img => img.id === 'album-1-art')?.imageUrl ?? 'https://picsum.photos/seed/101/500/500';
    const album1Tracks = [
        { id: 't1', name: 'Sunrise Drive', trackNumber: 1, previewUrl: null },
        { id: 't2', name: 'Chrome Reflections', trackNumber: 2, previewUrl: null },
        { id: 't3', name: 'Midnight Circuit', trackNumber: 3, previewUrl: null },
        { id: 't4', name: 'Digital Bloom', trackNumber: 4, previewUrl: null },
        { id: 't5', name: 'Starlight Cassette', trackNumber: 5, previewUrl: null },
        { id: 't6', name: 'Sunset Grid', trackNumber: 6, previewUrl: null },
        { id: 't7', name: 'Virtual Plaza', trackNumber: 7, previewUrl: null },
        { id: 't8', name: 'Ocean Drive', trackNumber: 8, previewUrl: null },
    ];
    const album = {
        id: 'album-1',
        name: 'Neon Dreams',
        artist: 'Synthwave Rider',
        artworkUrl: neonDreamsArt,
        tracks: album1Tracks,
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
        status: 'active',
        winner: null,
    };
};


export default function GroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [nickname, setNickname] = useState('');

  // State for guest users
  const [guestNickname, setGuestNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  
  const groupRef = useMemo(() => firestore ? doc(firestore, 'groups', params.id) : null, [firestore, params.id]);
  const usersQuery = useMemo(() => firestore ? query(collection(firestore, 'groups', params.id, 'users')) : null, [firestore, params.id]);

  const { data: groupData, loading: groupLoading } = useDoc<Omit<Group, 'users'>>(groupRef);
  const { data: usersData, loading: usersLoading } = useCollection<GroupUser>(usersQuery);

  const loading = authLoading || groupLoading || usersLoading;

  // Handle authenticated users who are not yet members
  useEffect(() => {
    if (loading || !authUser || !groupData) return;

    const isMember = usersData.some(member => member.id === authUser.uid);
    if (!isMember) {
        setShowJoinModal(true);
    }
  }, [authUser, usersData, groupData, loading]);

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


  const handleJoinGroup = async () => {
    if (!nickname.trim() || !firestore || !authUser) return;

    try {
        const userRef = doc(firestore, 'groups', params.id, 'users', authUser.uid);
        await setDoc(userRef, { name: nickname.trim() });
        setShowJoinModal(false);
        setNickname('');
    } catch (error) {
        console.error("Error joining group:", error);
    }
  };

  const handleAddAlbum = async () => {
    if (!firestore || !groupData) return;
    const bracketData = getMockBracket();
    const groupDocRef = doc(firestore, 'groups', params.id);
    await setDoc(groupDocRef, { activeBracket: bracketData }, { merge: true });
  }

  const handleChangeNickname = () => {
    if (guestNickname) {
      setNewNickname(guestNickname);
    }
    setShowNicknameModal(true);
  };

  const handleUpdateNickname = () => {
    if (newNickname.trim()) {
      const storageKey = `guestNickname_${params.id}`;
      localStorage.setItem(storageKey, newNickname.trim());
      setGuestNickname(newNickname.trim());
      setShowNicknameModal(false);
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
      users: usersData || []
  };

  const activeMatchup = group.activeBracket?.rounds
    .flatMap(r => r.matchups)
    .find(m => m.winner === null && m.track1 && m.track2);
    
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        group={group} 
        guestNickname={guestNickname}
        onChangeNickname={handleChangeNickname}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-12">
        {group.activeBracket && activeMatchup ? (
          <CurrentMatchup matchup={activeMatchup} albumArtUrl={group.activeBracket.album.artworkUrl} />
        ) : group.activeBracket ? (
             <BracketVisualizer bracket={group.activeBracket} />
        ) : (
          <AddAlbum onAlbumAdd={handleAddAlbum} />
        )}

        {group.activeBracket && activeMatchup && (
            <>
                <Separator className="w-1/2 bg-border/20" />
                <BracketVisualizer bracket={group.activeBracket} />
            </>
        )}
      </main>
      
      {/* Modal for guest to change their nickname */}
      <Dialog open={showNicknameModal} onOpenChange={setShowNicknameModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Your Nickname</DialogTitle>
            <DialogDescription>
              Enter a new nickname to be displayed for this group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="guest-nickname" className="text-right">
                Nickname
              </Label>
              <Input
                id="guest-nickname"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                className="col-span-3"
                placeholder="Your new nickname"
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateNickname()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateNickname} disabled={!newNickname.trim()}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal for authenticated user to join the group */}
      <Dialog open={showJoinModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join {group.name}</DialogTitle>
            <DialogDescription>
              Choose a nickname to join this group.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                Nickname
              </Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="col-span-3"
                placeholder="Your display name"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinGroup()}
              />
            </div>
          </div>
          <Button onClick={handleJoinGroup} disabled={!nickname.trim()}>Join Group</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
