'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function CreateGroupPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();
    const [groupName, setGroupName] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingGroups, setCheckingGroups] = useState(true);

    useEffect(() => {
        if (user && firestore) {
            const checkGroups = async () => {
                const groupsRef = collection(firestore, 'groups');
                const q = query(groupsRef, where('ownerId', '==', user.uid), limit(1));
                
                try {
                    const querySnapshot = await getDocs(q);
                    if (!querySnapshot.empty) {
                        const firstGroup = querySnapshot.docs[0];
                        router.replace(`/group/${firstGroup.id}`);
                    } else {
                        setCheckingGroups(false);
                    }
                } catch (error) {
                    console.error("Error checking for existing groups:", error);
                    toast({
                        variant: "destructive",
                        title: "Error loading your data.",
                        description: "Could not check for existing groups. Please try again later.",
                    });
                    setCheckingGroups(false);
                }
            };
            checkGroups();
        }
        if (!user && !userLoading) {
            router.replace('/login');
        }
    }, [user, firestore, router, toast, userLoading]);


    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')
            .concat(`-${Math.random().toString(36).substring(2, 7)}`);
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !firestore || !groupName.trim() || !nickname.trim()) return;

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

            const userRef = doc(firestore, 'groups', groupSlug, 'users', user.uid);
            await setDoc(userRef, {
                name: nickname.trim()
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
    
    if (checkingGroups || userLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Create Your Group</CardTitle>
                    <CardDescription>
                        Give your group a name and set your nickname. Let the games begin!
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
                        <div className="space-y-2">
                            <Label htmlFor="nickname">Your Nickname</Label>
                            <Input 
                                id="nickname"
                                placeholder="e.g., DJ Jazzy Jeff"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                required
                                className="bg-background"
                            />
                        </div>
                        <Button type="submit" className="w-full font-bold group" disabled={loading || !groupName.trim() || !nickname.trim()}>
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
