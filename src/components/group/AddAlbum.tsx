
"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2 } from 'lucide-react';
import { SpotifyIcon } from '@/components/icons/spotify';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AddAlbum({ 
    onAlbumAdd,
    loading 
}: { 
    onAlbumAdd: (url: string) => void,
    loading: boolean
}) {
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState('album');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onAlbumAdd(url);
  };
  
  const placeholder = sourceType === 'album' 
    ? 'https://open.spotify.com/album/...'
    : 'https://open.spotify.com/playlist/...';

  return (
    <div className="space-y-4 pt-4">
        <Tabs defaultValue="album" onValueChange={setSourceType} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="album">Album</TabsTrigger>
                <TabsTrigger value="playlist">Playlist</TabsTrigger>
            </TabsList>
        </Tabs>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="spotify-url" className="flex items-center gap-2">
                    <SpotifyIcon className="w-5 h-5 text-green-500"/>
                    Spotify {sourceType === 'album' ? 'Album' : 'Playlist'} URL
                </Label>
                <Input 
                    id="spotify-url" 
                    placeholder={placeholder}
                    className="bg-background"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={loading}
                />
            </div>

          <Button type="submit" className="w-full font-bold group" disabled={loading || !url}>
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <>
                    Generate Bracket
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
            )}
          </Button>
        </form>
    </div>
  );
}
