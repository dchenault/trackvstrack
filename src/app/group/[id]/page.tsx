"use client";

import { useState, useEffect } from 'react';
import { MOCK_GROUP, MOCK_GROUP_NO_BRACKET } from '@/lib/data';
import type { Group } from '@/lib/types';
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
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function GroupPage({ params }: { params: { id: string } }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [username, setUsername] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const initialGroup = params.id === '123-abc-789' ? MOCK_GROUP : MOCK_GROUP_NO_BRACKET;
    setGroup(initialGroup);

    const storedUser = localStorage.getItem(`trackvstrack_user_${params.id}`);
    if (!storedUser) {
      setShowJoinModal(true);
    } else {
      setUsername(JSON.parse(storedUser).name);
    }
  }, [params.id]);

  const handleJoinGroup = () => {
    if (username.trim()) {
      const user = { id: `user-${Date.now()}`, name: username.trim() };
      localStorage.setItem(`trackvstrack_user_${params.id}`, JSON.stringify(user));
      setGroup(prevGroup => prevGroup ? { ...prevGroup, users: [...prevGroup.users, user] } : null);
      setShowJoinModal(false);
    }
  };

  const handleAddAlbum = () => {
    setGroup(prev => prev ? {...MOCK_GROUP, name: prev.name, users: prev.users } : null);
  }

  if (!isMounted || !group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading group...</p>
      </div>
    );
  }

  const activeMatchup = group.activeBracket?.rounds
    .flatMap(r => r.matchups)
    .find(m => m.winner === null && m.track1 && m.track2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header group={group} />
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex flex-col items-center gap-12">
        {group.activeBracket && activeMatchup && (
          <CurrentMatchup matchup={activeMatchup} albumArtUrl={group.activeBracket.album.artworkUrl} />
        )}

        {group.activeBracket ? (
          <>
            <Separator className="w-1/2 bg-border/20" />
            <BracketVisualizer bracket={group.activeBracket} />
          </>
        ) : (
          <AddAlbum onAlbumAdd={handleAddAlbum} />
        )}
      </main>

      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Join {group.name}</DialogTitle>
            <DialogDescription>
              Enter a display name to join the group and start voting.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                placeholder="Your display name"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinGroup()}
              />
            </div>
          </div>
          <Button onClick={handleJoinGroup}>Join Group</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
