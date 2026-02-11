'use client';

import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { GoogleIcon } from '@/components/icons/google';

export default function SignInWithGoogleButton({ redirectUrl }: { redirectUrl: string }) {
    const auth = useAuth();
    const router = useRouter();

    const handleSignIn = async () => {
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            const groupId = redirectUrl.split('/').pop();

            if (user.displayName && groupId) {
                const userData = { id: user.uid, name: user.displayName };
                localStorage.setItem(`trackvstrack_user_${groupId}`, JSON.stringify(userData));
            }
            router.push(redirectUrl);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    return (
        <Button onClick={handleSignIn} className="w-full font-bold" variant="outline">
            <GoogleIcon className="mr-2 h-6 w-6" />
            Sign in with Google
        </Button>
    );
}
