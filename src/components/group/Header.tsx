
"use client";

import Link from 'next/link';
import { LayoutDashboard, Music, Users, Share2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Group } from '@/lib/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import UserProfile from '@/components/auth/UserProfile';

export default function Header({ 
  group,
  guestNickname,
  onChangeNickname,
  isOwner,
  onEditName,
}: { 
  group: Group,
  guestNickname: string | null,
  onChangeNickname: () => void,
  isOwner?: boolean,
  onEditName?: () => void,
}) {
  const { toast } = useToast();
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setShareLink(window.location.href);
    }
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link Copied!",
      description: "The invite link has been copied to your clipboard.",
    });
  };

  return (
    <header className="py-4 px-4 md:px-8 border-b border-white/10 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <Link href="/" className="text-primary hover:brightness-125 transition-all">
                <Music />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span>{group.name}</span>
                {isOwner && onEditName && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white" onClick={onEditName}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit group name</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-muted-foreground">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>{group.users.length} members</span>
                </div>
              </div>
            </div>
             <Button variant="outline" size="sm" asChild className="hidden md:flex">
                <Link href={`/group/${group.id}/dashboard`}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                </Link>
            </Button>
        </div>
        <div className="flex items-center gap-4">
            <TooltipProvider>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={copyToClipboard} variant="outline" size="sm" className="hidden md:inline-flex">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Copy invite link: <span className="font-mono text-xs bg-card/50 px-1 py-0.5 rounded-sm">{shareLink}</span></p>
                </TooltipContent>
                </Tooltip>
            </TooltipProvider>
            <UserProfile 
              guestNickname={guestNickname}
              onChangeNickname={onChangeNickname}
            />
        </div>
      </div>
    </header>
  );
}
