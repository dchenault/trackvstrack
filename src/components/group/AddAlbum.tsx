"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SpotifyIcon } from '@/components/icons/spotify';
import { ArrowRight } from 'lucide-react';

export default function AddAlbum({ onAlbumAdd }: { onAlbumAdd: () => void }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAlbumAdd();
  };

  return (
    <Card className="w-full max-w-lg mx-auto mt-16 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <SpotifyIcon className="w-8 h-8 text-green-500" />
          Start a New Bracket
        </CardTitle>
        <CardDescription>
          Paste a Spotify album URL to generate a new tournament bracket.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="album-url">Spotify Album URL</Label>
            <Input id="album-url" placeholder="https://open.spotify.com/album/..." className="bg-background" />
          </div>
          <Button type="submit" className="w-full font-bold group">
            Generate Bracket
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
