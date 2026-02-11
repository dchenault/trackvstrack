'use client';

import { useState, useEffect, ReactNode } from 'react';
import { initializeFirebase } from '.';
import { FirebaseProvider } from './provider';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

type FirebaseInstances = {
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
};

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
    const [firebase, setFirebase] = useState<FirebaseInstances | null>(null);

    useEffect(() => {
        const instances = initializeFirebase();
        setFirebase(instances);
    }, []);

    if (!firebase) {
        return null; // Or a loading indicator
    }

    return <FirebaseProvider value={firebase}>{children}</FirebaseProvider>;
}
