'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SignInWithGoogleButton from "@/components/auth/SignInWithGoogleButton";
import { Music } from "lucide-react";
import Link from "next/link";
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/create-group');
        }
    }, [user, loading, router]);

    if (loading || user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-8 w-64 mt-8" />
                <Skeleton className="h-6 w-48 mt-2" />
                <Skeleton className="h-12 w-64 mt-12" />
            </div>
        );
    }
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
            <div className="text-center mb-12">
                <Link href="/" className="inline-block mb-4">
                    <Music className="h-12 w-12 text-primary" />
                </Link>
                <h1 className="text-4xl font-bold text-foreground">Sign In to Battle of the Band</h1>
                <p className="text-muted-foreground mt-2">
                    Join the ultimate music showdown.
                </p>
            </div>
            <div className="w-full max-w-sm">
                <SignInWithGoogleButton redirectUrl="/create-group" />
            </div>
        </div>
    );
}
