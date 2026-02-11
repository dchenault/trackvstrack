"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpotifyIcon } from '@/components/icons/spotify';
import { ArrowRight, Loader2 } from 'lucide-react';

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

  return (
    <Card className="w-full max-w-lg mx-auto mt-16 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <SpotifyIcon className="w-8 h-8 text-green-500" />
          Start a New Bracket
        </CardTitle>
        <CardDescription>
          Paste a Spotify album URL to generate a new tournament bracket. I'll fetch the album art and tracklist for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="album-url">Spotify Album URL</Label>
            <Input 
                id="album-url" 
                placeholder="https://open.spotify.com/album/..." 
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
      </CardContent>
    </Card>
  );
}
