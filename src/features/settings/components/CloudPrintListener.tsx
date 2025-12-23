
import React, { useEffect } from 'react';
import { db } from '../../../lib/firebase/client';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, QuerySnapshot, DocumentData } from '@firebase/firestore';
import { useApp } from '../../../contexts/AppContext';
import { printingService } from '../../../services/printingService';

/**
 * This component listens for print jobs in the cloud (sent from mobile devices)
 * and relays them to the local printer agent if this tab is active on a desktop.
 */
const CloudPrintListener: React.FC = () => {
    const { tenantId, showToast } = useApp();

    useEffect(() => {
        if (!tenantId) return;

        console.log('[CloudPrintListener] Starting cloud print listener...');

        const q = query(
            collection(db, 'print_jobs'),
            where('tenantId', '==', tenantId),
            where('status', '==', 'PENDING')
        );

        const unsubscribe = onSnapshot(q, async (snapshot: QuerySnapshot<DocumentData>) => {
            if (snapshot.empty) return;

            // Check if agent is reachable before trying to process
            let agentStatus = 'OFFLINE';
            try {
                agentStatus = await printingService.checkAgentStatus();
            } catch (e) {
                console.warn('[CloudPrintListener] Failed to check agent status', e);
            }

            if (agentStatus !== 'ONLINE') {
                console.warn('[CloudPrintListener] Local agent is OFFLINE. Jobs will remain PENDING.');
                return;
            }

            for (const jobDoc of snapshot.docs) {
                const job = jobDoc.data();
                console.log(`[CloudPrintListener] Processing cloud job: ${jobDoc.id}`);

                try {
                    // Forward to local agent
                    const res = await fetch('http://localhost:3030/print', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: job.content,
                            type: job.type || 'order',
                            options: job.options || {}
                        })
                    }).catch(e => {
                        console.error('[CloudPrintListener] Fetch failed:', e);
                        return null;
                    });

                    if (res && res.ok) {
                        // Mark as printed in Firestore
                        await updateDoc(doc(db, 'print_jobs', jobDoc.id), {
                            status: 'PRINTED',
                            printedAt: serverTimestamp()
                        });
                        showToast(`Impressão remota concluída: ${jobDoc.id.slice(-4)}`, 'info');
                    } else {
                        console.error('[CloudPrintListener] Job failed at agent:', jobDoc.id);
                    }
                } catch (err) {
                    console.error('[CloudPrintListener] Error printing job:', err);
                }
            }
        }, (error: Error) => {
            console.error('[CloudPrintListener] Subscription error:', error);
        });

        return () => unsubscribe();
    }, [tenantId, showToast]);

    return null; // This component doesn't render anything
};

export default CloudPrintListener;
