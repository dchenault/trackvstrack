'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, CollectionReference } from 'firebase/firestore';
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
                
                // Best effort to get the path for error reporting.
                const path = (query as CollectionReference)?.path || 'unknown path';

                const permissionError = new FirestorePermissionError({
                    path: path,
                    operation: 'list',
                });
                errorEmitter.emit('permission-error', permissionError);
                setData([]);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    // The parent component must memoize the query object for this to be efficient.
    }, [query]);

    return { data, loading };
}
