"use client"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, BrainCircuit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpotifyIcon } from '@/components/icons/spotify';
import { YoutubeIcon } from '@/components/icons/youtube';

type AlbumSource = 'spotify' | 'youtube' | 'musicbrainz';

export default function AddAlbum({ 
    onAlbumAdd,
    loading 
}: { 
    onAlbumAdd: (url: string, source: AlbumSource) => void,
    loading: boolean
}) {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<AlbumSource>('spotify');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    onAlbumAdd(url, activeTab);
  };
  
  const placeholders = {
      spotify: 'https://open.spotify.com/album/...',
      youtube: 'https://www.youtube.com/playlist?list=...',
      musicbrainz: 'https://musicbrainz.org/release-group/...'
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <Tabs defaultValue="spotify" onValueChange={(value) => {
            setActiveTab(value as AlbumSource);
            setUrl('');
        }} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="spotify" className="flex items-center gap-2">
                    <SpotifyIcon className="w-5 h-5"/>
                    Spotify
                </TabsTrigger>
                <TabsTrigger value="youtube" className="flex items-center gap-2">
                    <YoutubeIcon className="w-5 h-5 text-red-500"/>
                    YouTube
                </TabsTrigger>
                <TabsTrigger value="musicbrainz" className="flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5 text-orange-400"/>
                    MusicBrainz
                </TabsTrigger>
            </TabsList>
            <div className="pt-4">
                <TabsContent value="spotify" className="m-0">
                    <div className="space-y-2">
                        <Label htmlFor="album-url-spotify">Spotify Album URL</Label>
                        <Input 
                            id="album-url-spotify" 
                            placeholder={placeholders.spotify}
                            className="bg-background"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="youtube" className="m-0">
                    <div className="space-y-2">
                        <Label htmlFor="album-url-youtube">YouTube Playlist URL</Label>
                        <Input 
                            id="album-url-youtube" 
                            placeholder={placeholders.youtube}
                            className="bg-background"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </TabsContent>
                <TabsContent value="musicbrainz" className="m-0">
                    <div className="space-y-2">
                        <Label htmlFor="album-url-musicbrainz">MusicBrainz Release Group URL</Label>
                        <Input 
                            id="album-url-musicbrainz" 
                            placeholder={placeholders.musicbrainz}
                            className="bg-background"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                </TabsContent>
            </div>
        </Tabs>

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
