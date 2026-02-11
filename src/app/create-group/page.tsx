'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function CreateGroupPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [groupName, setGroupName] = useState('');
    const [loading, setLoading] = useState(false);

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')       // Replace spaces with -
            .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
            .replace(/\-\-+/g, '-')     // Replace multiple - with single -
            .replace(/^-+/, '')          // Trim - from start of text
            .replace(/-+$/, '')         // Trim - from end of text
            .concat(`-${Math.random().toString(36).substring(2, 7)}`); // Add random string
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !groupName.trim()) return;

        setLoading(true);

        const groupSlug = slugify(groupName);

        try {
            const groupRef = doc(firestore, 'groups', groupSlug);
            await setDoc(groupRef, {
                name: groupName.trim(),
                ownerId: user.uid,
                createdAt: serverTimestamp(),
                activeBracket: null,
                archivedBrackets: []
            });
            
            toast({
                title: "Group created!",
                description: `Your group "${groupName.trim()}" is ready.`,
            });
            
            router.push(`/group/${groupSlug}`);
        } catch (error: any) {
            console.error("Error creating group:", error);
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Could not create the group. Please try again.",
            });
            setLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Name Your Group</CardTitle>
                    <CardDescription>
                        Choose a name for your group. This will be part of the shareable URL.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCreateGroup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="group-name">Group Name</Label>
                            <Input 
                                id="group-name"
                                placeholder="e.g., The Indie Heads"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>
                        <Button type="submit" className="w-full font-bold group" disabled={loading || !groupName.trim()}>
                            {loading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Create Group and Continue
                                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
