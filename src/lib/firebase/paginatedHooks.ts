import { useInfiniteQuery } from '@tanstack/react-query';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    getDocs,
    QueryConstraint,
    QueryDocumentSnapshot,
    DocumentData
} from '@firebase/firestore';
import { db } from '@/lib/firebase/client';
import { CollectionName } from '@/types/collections';

interface PageResult<T> {
    docs: T[];
    lastDoc: QueryDocumentSnapshot<DocumentData> | null;
}

export const useInfiniteFirestoreCollection = <T>(
    collectionName: CollectionName,
    tenantId: string | undefined,
    pageSize: number = 20,
    orderByField: string = 'createdAt',
    orderByDirection: 'asc' | 'desc' = 'desc',
    additionalConstraints: QueryConstraint[] = []
) => {
    return useInfiniteQuery<PageResult<T>>({
        queryKey: [collectionName, tenantId, pageSize, orderByField, orderByDirection, additionalConstraints.map(c => c.type).join(',')],
        queryFn: async ({ pageParam }) => {
            if (!tenantId) return { docs: [], lastDoc: null };

            let q = query(
                collection(db, collectionName),
                where('tenantId', '==', tenantId),
                orderBy(orderByField, orderByDirection),
                limit(pageSize)
            );

            // Apply any additional constraints passed
            if (additionalConstraints.length > 0) {
                q = query(q, ...additionalConstraints);
            }

            if (pageParam) {
                q = query(q, startAfter(pageParam));
            }

            const snapshot = await getDocs(q);
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];

            return {
                docs,
                lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
            };
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.lastDoc,
        enabled: !!tenantId,
        staleTime: 5 * 60 * 1000 // 5 minutes
    });
};
