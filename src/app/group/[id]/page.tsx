
"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { doc, collection, setDoc, query } from 'firebase/firestore';
import type { Group, User as GroupUser, Matchup } from '@/lib/types';
import Header from '@/components/group/Header';
import CurrentMatchup from '@/components/group/CurrentMatchup';
import BracketVisualizer from '@/components/group/BracketVisualizer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { generateRandomNickname } from '@/lib/nickname-generator';

export default function GroupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const firestore = useFirestore();
  const { user: authUser, loading: authLoading } = useUser();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [nickname, setNickname] = useState('');

  const [guestNickname, setGuestNickname] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  
  const [selectedMatchup, setSelectedMatchup] = useState<Matchup | null>(null);

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

  const isOwner = authUser?.uid === group.ownerId;

  // Find the first playable matchup as a default
  const defaultActiveMatchup = group.activeBracket?.rounds
    .flatMap(r => r.matchups)
    .find(m => m.winner === null && m.track1 && m.track2);

  // Set the default matchup on initial load or data change
  useEffect(() => {
    if (defaultActiveMatchup) {
      setSelectedMatchup(defaultActiveMatchup);
    } else {
      setSelectedMatchup(null);
    }
  }, [defaultActiveMatchup?.id]);

  const matchupToDisplay = selectedMatchup || defaultActiveMatchup;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        group={group} 
        guestNickname={guestNickname}
        onChangeNickname={handleChangeNickname}
        isOwner={isOwner}
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-12">
        {group.activeBracket && matchupToDisplay ? (
          <CurrentMatchup 
            key={matchupToDisplay.id}
            groupId={group.id}
            matchup={matchupToDisplay} 
            albumArtUrl={group.activeBracket.album.artworkUrl} 
          />
        ) : group.activeBracket ? (
             <BracketVisualizer 
                bracket={group.activeBracket} 
                onMatchupClick={setSelectedMatchup}
             />
        ) : (
          <Card className="w-full max-w-lg mx-auto mt-16 text-center">
            <CardHeader>
                <CardTitle>No Active Bracket</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">There's no album bracket running right now.</p>
                {isOwner && (
                    <Button asChild className="mt-4">
                        <Link href={`/group/${params.id}/dashboard`}>Go to Dashboard</Link>
                    </Button>
                )}
            </CardContent>
          </Card>
        )}

        {group.activeBracket && (
            <>
                <Separator className="w-1/2 bg-border/20" />
                <BracketVisualizer 
                    bracket={group.activeBracket} 
                    onMatchupClick={setSelectedMatchup}
                />
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
          </Header>
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
