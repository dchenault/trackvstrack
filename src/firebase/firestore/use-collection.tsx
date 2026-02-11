'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';
import { serializeFirestoreData } from '@/lib/utils';

export function useCollection<T>(query: Query<DocumentData> | null) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!query) {
            setData([]);
            setLoading(false);
            return;
        }
        
        setLoading(true);
        const unsubscribe = onSnapshot(query, 
            (querySnapshot) => {
                const collectionData = querySnapshot.docs.map(doc => (
                    serializeFirestoreData({ id: doc.id, ...doc.data() })
                )) as T[];
                setData(collectionData);
                setLoading(false);
            },
            async (error) => {
                console.error(`Error fetching collection:`, error);
                 const permissionError = new FirestorePermissionError({
                    path: 'path' in query ? (query as any).path : 'unknown', // Best effort to get path
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
                setData([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    // Using a string representation of the query for dependency array to avoid infinite loops
    // Note: This is a simplified approach. For complex queries, a deep comparison or more stable key might be needed.
    }, [query ? JSON.stringify(query) : 'null']);

    return { data, loading };
}
