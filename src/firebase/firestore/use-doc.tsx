'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { serializeFirestoreData } from '@/lib/utils';

export function useDoc<T>(ref: DocumentReference<DocumentData> | null) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ref) {
            setData(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(ref, 
            (docSnap) => {
                if (docSnap.exists()) {
                    const docData = { id: docSnap.id, ...docSnap.data() };
                    setData(serializeFirestoreData(docData) as T);
                } else {
                    setData(null);
                }
                setLoading(false);
            },
            async (error) => {
                console.error(`Error fetching doc (${ref.path}):`, error);
                const permissionError = new FirestorePermissionError({
                    path: ref.path,
                    operation: 'get',
                });
                errorEmitter.emit('permission-error', permissionError);
                setData(null);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [ref?.path]); // Depend on the reference's path to avoid re-renders

    return { data, loading };
}
