/**
 * Table Merge Service
 * Handles merging and unmerging of physical tables into virtual tables
 */

import { db } from '@/lib/firebase/client';
import { collection, doc, setDoc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { MergedTable } from '@/types/table';

/**
 * Merges multiple tables into a virtual table
 * @param tables - Array of table numbers to merge
 * @param tenantId - Tenant ID
 * @param userId - User ID creating the merge
 * @returns Created merged table
 */
export async function mergeTables(
    tables: string[],
    tenantId: string,
    userId: string
): Promise<MergedTable> {
    if (tables.length < 2) {
        throw new Error('Must merge at least 2 tables');
    }

    // Sort tables for consistent naming
    const sortedTables = [...tables].sort();

    // Generate virtual name (e.g., "Mesa 05-07")
    const firstNum = sortedTables[0].replace(/\D/g, '');
    const lastNum = sortedTables[sortedTables.length - 1].replace(/\D/g, '');
    const prefix = sortedTables[0].replace(/\d/g, '').trim();
    const virtualName = `${prefix} ${firstNum}-${lastNum}`;

    const mergeId = `merge_${Date.now()}`;
    const mergedTable: MergedTable = {
        id: mergeId,
        tenantId,
        tables: sortedTables,
        virtualName,
        createdAt: new Date(),
        createdBy: userId,
        status: 'ACTIVE'
    };

    await setDoc(doc(db, 'merged_tables', mergeId), {
        ...mergedTable,
        createdAt: serverTimestamp()
    });

    return mergedTable;
}

/**
 * Unmerges a virtual table back to individual tables
 * @param mergeId - Merged table ID
 * @param userId - User ID performing the unmerge
 */
export async function unmergeTables(mergeId: string, userId: string): Promise<void> {
    const mergeRef = doc(db, 'merged_tables', mergeId);

    await updateDoc(mergeRef, {
        status: 'CLOSED',
        closedAt: serverTimestamp(),
        closedBy: userId
    });
}

/**
 * Gets active merged table for a physical table
 * @param tableNumber - Physical table number
 * @param tenantId - Tenant ID
 * @returns Merged table if exists, null otherwise
 */
export async function getActiveMergedTable(
    tableNumber: string,
    tenantId: string
): Promise<MergedTable | null> {
    const q = query(
        collection(db, 'merged_tables'),
        where('tenantId', '==', tenantId),
        where('tables', 'array-contains', tableNumber),
        where('status', '==', 'ACTIVE')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const data = snapshot.docs[0].data();
    return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        closedAt: data.closedAt?.toDate()
    } as MergedTable;
}

/**
 * Gets all tables in a merge (including the virtual table itself)
 * @param tableNumber - Any table in the merge
 * @param tenantId - Tenant ID
 * @returns Array of all table numbers in the merge
 */
export async function getAllTablesInMerge(
    tableNumber: string,
    tenantId: string
): Promise<string[]> {
    const mergedTable = await getActiveMergedTable(tableNumber, tenantId);
    return mergedTable ? mergedTable.tables : [tableNumber];
}
