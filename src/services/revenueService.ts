
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
} from '@firebase/firestore';
import { db } from '@/lib/firebase/client';
import { Revenue } from '../types/finance';

const COLLECTION_NAME = 'revenues';

export const revenueService = {
    // Add a new revenue
    async addRevenue(revenue: Omit<Revenue, 'id'>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, COLLECTION_NAME), {
                ...revenue,
                date: Timestamp.fromDate(new Date(revenue.date)),
                receivedAt: revenue.receivedAt ? Timestamp.fromDate(new Date(revenue.receivedAt)) : null,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding revenue:", error);
            throw error;
        }
    },

    // Get revenues by date range
    async getRevenues(startDate: Date, endDate: Date): Promise<Revenue[]> {
        try {
            const q = query(
                collection(db, COLLECTION_NAME),
                where('date', '>=', Timestamp.fromDate(startDate)),
                where('date', '<=', Timestamp.fromDate(endDate)),
                orderBy('date', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date.toDate(),
                    receivedAt: data.receivedAt?.toDate(),
                } as Revenue;
            });
        } catch (error) {
            console.error("Error fetching revenues:", error);
            throw error;
        }
    },

    // Delete revenue
    async deleteRevenue(id: string): Promise<void> {
        try {
            await deleteDoc(doc(db, COLLECTION_NAME, id));
        } catch (error) {
            console.error("Error deleting revenue:", error);
            throw error;
        }
    }
};
