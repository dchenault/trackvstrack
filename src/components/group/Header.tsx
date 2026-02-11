"use client";

import Link from 'next/link';
import { Music, Users, Link as LinkIcon, Share2 } from 'lucide-react';
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

export default function Header({ group }: { group: Group }) {
  const { toast } = useToast();
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    setShareLink(window.location.href);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    toast({
      title: "Link Copied!",
      description: "The invite link has been copied to your clipboard.",
    });
  };

  return (
    <header className="py-6 px-4 md:px-8 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Link href="/" className="text-primary hover:brightness-125 transition-all">
                <Music />
            </Link>
            <span>{group.name}</span>
          </h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{group.users.length} members</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              <p className="font-mono text-sm bg-card/50 px-2 py-1 rounded-md">{shareLink}</p>
            </div>
          </div>
        </div>
        <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={copyToClipboard} variant="secondary" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50">
              <Share2 className="mr-2 h-4 w-4" />
              Share Link
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy invite link</p>
          </TooltipContent>
        </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}
