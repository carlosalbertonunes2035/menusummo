
import { db } from '../firebase/client';
import {
    doc, setDoc, deleteDoc, updateDoc, getDoc,
    collection, getDocs, query, where, DocumentData,
    QueryConstraint, serverTimestamp, Timestamp
} from '@firebase/firestore';
import { getCollection, setCollection } from '../localStorage';
import { CollectionName } from '@/types/collections';
import { auditService, AuditEventType } from '@/services/AuditService';
import { auth } from '../firebase/client';

export abstract class BaseRepository<T extends { id: string; createdAt?: any; updatedAt?: any }> {
    protected collectionName: CollectionName;
    protected isMockMode: boolean;

    constructor(collectionName: CollectionName, isMockMode: boolean = false) {
        this.collectionName = collectionName;
        this.isMockMode = isMockMode;
    }

    protected now() {
        return this.isMockMode ? new Date().toISOString() : serverTimestamp();
    }

    async create(data: T, tenantId: string): Promise<string> {
        const id = data.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = this.now();

        if (this.isMockMode) {
            const items = getCollection(tenantId, this.collectionName as any);
            const newItem = {
                ...data,
                id,
                tenantId,
                createdAt: timestamp,
                updatedAt: timestamp
            };
            items.push(newItem);
            setCollection(tenantId, this.collectionName as any, items);
            return id;
        } else {
            // SECURITY: Always inject ownerUid for permission fallback
            const currentUser = auth.currentUser;
            const payload = {
                ...data,
                id,
                tenantId,
                createdAt: timestamp,
                updatedAt: timestamp,
                ownerUid: (data as any).ownerUid || currentUser?.uid // Auto-inject if not present
            };
            const docRef = doc(db, this.collectionName, id);
            await setDoc(docRef, payload);

            // Log Audit Event
            auditService.logMutation(
                tenantId,
                currentUser?.uid || 'system',
                AuditEventType.CREATE,
                this.collectionName,
                id,
                null,
                data
            );

            return id;
        }
    }

    async update(id: string, data: Partial<T>, tenantId: string): Promise<void> {
        const timestamp = this.now();

        if (this.isMockMode) {
            const items = getCollection(tenantId, this.collectionName as any);
            const updated = items.map((i: T) => i.id === id ? { ...i, ...data, updatedAt: timestamp } : i);
            setCollection(tenantId, this.collectionName as any, updated);
        } else {
            const docRef = doc(db, this.collectionName, id);
            // Use setDoc with merge instead of updateDoc to be more resilient
            // and ensure tenantId is always present in the payload for rules validation
            await setDoc(docRef, {
                ...data,
                tenantId,
                updatedAt: timestamp
            }, { merge: true });

            // Log Audit Event
            auditService.logMutation(
                tenantId,
                auth.currentUser?.uid || 'system',
                AuditEventType.UPDATE,
                this.collectionName,
                id,
                null, // Diffing is expensive, logging current change payload for now
                data
            );
        }
    }

    async delete(id: string, tenantId: string): Promise<void> {
        if (this.isMockMode) {
            const items = getCollection(tenantId, this.collectionName as any);
            const filtered = items.filter((i: T) => i.id !== id);
            setCollection(tenantId, this.collectionName as any, filtered);
        } else {
            await deleteDoc(doc(db, this.collectionName, id));

            // Log Audit Event
            auditService.logMutation(
                tenantId,
                auth.currentUser?.uid || 'system',
                AuditEventType.DELETE,
                this.collectionName,
                id,
                null,
                null
            );
        }
    }

    async getById(id: string, tenantId: string): Promise<T | null> {
        if (this.isMockMode) {
            const items = getCollection(tenantId, this.collectionName as any);
            return items.find((i: T) => i.id === id) || null;
        }
        const docSnap = await getDoc(doc(db, this.collectionName, id));
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Convert Firestore Timestamps to ISO strings for consistency if needed, 
            // but for now we'll just return as is and handle in services.
            return { id, ...data } as T;
        }
        return null;
    }

    async getAll(tenantId: string, constraints: QueryConstraint[] = []): Promise<T[]> {
        if (this.isMockMode) {
            return getCollection(tenantId, this.collectionName as any);
        }
        const q = query(
            collection(db, this.collectionName),
            where("tenantId", "==", tenantId),
            ...constraints
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    }
}
