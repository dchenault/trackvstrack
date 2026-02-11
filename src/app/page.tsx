import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Music, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <header className="text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-black text-primary animate-neon-glow font-headline">
          Track vs Track
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          Create a tournament for your favorite album and find out which track reigns supreme. Create a group, share the link, and let the voting begin!
        </p>
      </header>

      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/20 shadow-2xl shadow-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Music className="text-primary" />
            Create a New Group
          </CardTitle>
          <CardDescription>
            Give your group a name and start a new bracket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input id="group-name" placeholder="e.g., The Album Club" className="bg-background" />
            </div>
            <Button asChild className="w-full font-bold group">
              <Link href="/group/123-abc-789">
                Create Group
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </form>
        </CardContent>
      </Card>

      <footer className="absolute bottom-4 text-center text-muted-foreground text-sm">
        <p>Built for the love of music.</p>
      </footer>
    </div>
  );
}
