"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2 } from 'lucide-react';
import { SpotifyIcon } from '@/components/icons/spotify';

export default function AddAlbum({ 
    onAlbumAdd,
    loading 
}: { 
    onAlbumAdd: (url: string) => void,
    loading: boolean
}) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onAlbumAdd(url);
  };
  
  const placeholder = 'https://open.spotify.com/album/...';

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
            <Label htmlFor="album-url-spotify" className="flex items-center gap-2">
                <SpotifyIcon className="w-5 h-5 text-green-500"/>
                Spotify Album URL
            </Label>
            <Input 
                id="album-url-spotify" 
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
  );
}
