import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- ENV LOADING (Simple Parser) ---
// We do this BEFORE importing firebase client so process.env is populated
const loadEnv = () => {
    try {
        const __dir = path.dirname(fileURLToPath(import.meta.url));
        let envPath = path.resolve(__dir, '../../.env');

        // Fallback to CWD
        if (!fs.existsSync(envPath)) {
            envPath = path.resolve(process.cwd(), '.env');
        }
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf-8');
            content.split('\n').forEach(line => {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) {
                    const key = match[1].trim();
                    const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
                    process.env[key] = value;
                }
            });
            console.log('✅ Loaded .env variables');
        } else {
            console.warn('⚠️ .env file not found at:', envPath);
        }
    } catch (e) {
        console.error('Error loading .env:', e);
    }
};

loadEnv();

// --- IMPORTS ---
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where, doc, updateDoc } from '@firebase/firestore';
import { ProductSchema, IngredientSchema } from '@/lib/schemas';
import { z } from 'zod';

export const auditData = async (tenantId: string, fix: boolean = false) => {
    console.log(`\n🔍 STARTING DATA AUDIT FOR TENANT: ${tenantId}`);

    // --- 1. Audit Products ---
    console.log('\n📦 Auditing Products...');
    const productsRef = collection(db, 'products');
    const qProducts = query(productsRef, where('tenantId', '==', tenantId));
    const prodSnap = await getDocs(qProducts);

    let invalidProducts = 0;

    for (const d of prodSnap.docs) {
        const data = d.data();
        const result = ProductSchema.safeParse({ id: d.id, ...data });

        if (!result.success) {
            invalidProducts++;
            console.error(`❌ Product [${d.id}] "${data.name}": Invalid`);
            result.error.errors.forEach(e => console.log(`   - ${e.path.join('.')}: ${e.message}`));

            if (fix) {
                // AUTO-FIX: Apply defaults for common missing fields
                const updates: any = {};

                // Fix missing arrays
                if (!data.channels) updates.channels = [];
                if (!data.ingredients) updates.ingredients = [];
                if (!data.optionGroupIds) updates.optionGroupIds = [];
                if (data.cost === undefined) updates.cost = 0;

                // Fix malformed channels
                if (data.channels && Array.isArray(data.channels)) {
                    updates.channels = data.channels.map((c: any) => ({
                        channel: c.channel || 'pos',
                        displayName: c.displayName || data.name,
                        price: c.price ?? data.price ?? 0,
                        isAvailable: c.isAvailable ?? true,
                        promotionalPrice: c.promotionalPrice,
                        description: c.description,
                        image: c.image,
                        videoUrl: c.videoUrl,
                        category: c.category,
                        sortOrder: c.sortOrder
                    }));
                } else if (!data.channels) {
                    updates.channels = [
                        { channel: 'pos', price: data.price || 0, isAvailable: true },
                        { channel: 'digital-menu', price: data.price || 0, isAvailable: true }
                    ];
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, 'products', d.id), updates);
                    console.log(`   ✅ Fixed ${Object.keys(updates).join(', ')}`);
                }
            }
        }
    }

    if (invalidProducts === 0) console.log('✅ All products are valid.');

    // --- 2. Audit Ingredients ---
    console.log('\n🥦 Auditing Ingredients...');
    const ingRef = collection(db, 'ingredients');
    const qIng = query(ingRef, where('tenantId', '==', tenantId));
    const ingSnap = await getDocs(qIng);

    let invalidIng = 0;
    for (const d of ingSnap.docs) {
        const data = d.data();
        const result = IngredientSchema.safeParse({ id: d.id, ...data });
        if (!result.success) {
            invalidIng++;
            console.error(`❌ Ingredient [${d.id}] "${data.name}": Invalid`);
            result.error.errors.forEach(e => console.log(`   - ${e.path.join('.')}: ${e.message}`));
        }
    }
    if (invalidIng === 0) console.log('✅ All ingredients are valid.');

    console.log('\n🏁 AUDIT COMPLETE.');
};

// --- RUNNER ---
// Check if running directly via CLI
if (typeof process !== 'undefined' && process.argv[1] && (
    process.argv[1].endsWith('auditData.ts') ||
    process.argv[1].includes('auditData') // Loose match for tsx execution
)) {
    const args = process.argv.slice(2);
    const tenantId = args.find(a => !a.startsWith('--'));
    const fix = args.includes('--fix');

    if (tenantId) {
        auditData(tenantId, fix).then(() => {
            console.log('Done.');
            process.exit(0);
        }).catch(err => {
            console.error(err);
            process.exit(1);
        });
    } else {
        // If loaded as module, do nothing.
    }
}
