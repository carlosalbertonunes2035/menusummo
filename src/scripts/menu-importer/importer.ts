import { collection, doc, writeBatch, serverTimestamp } from '@firebase/firestore';
import { db } from '../../lib/firebase/client';
import { JC_ESPETARIA_DATA } from './jcEspetariaData';
import { Product, Ingredient, OptionGroup, Recipe, RecipeIngredient } from '../../types';

// Define Category interface locally as it's not exported
interface Category {
    id: string;
    tenantId: string;
    name: string;
    order: number;
    active: boolean;
}

export class MenuImporter {
    private tenantId: string;
    private batch: any;
    private batchCount: number = 0;
    private createdIngredients: Map<string, string> = new Map(); // Name -> ID
    private createdProductIds: Map<string, string> = new Map(); // Name -> ID
    private menuData: any;

    constructor(tenantId: string, externalData?: any) {
        this.tenantId = tenantId;
        this.batch = writeBatch(db);
        this.menuData = externalData || JC_ESPETARIA_DATA;
    }

    private async commitBatchIfNeeded() {
        this.batchCount++;
        if (this.batchCount >= 450) { // Firestore limit is 500
            await this.batch.commit();
            this.batch = writeBatch(db);
            this.batchCount = 0;
        }
    }

    private async finalCommit() {
        if (this.batchCount > 0) {
            await this.batch.commit();
        }
    }

    async runImport() {
        console.log(`Starting import for tenant: ${this.tenantId}`);

        // 1. Import Option Groups
        const { ids: optionGroupIds, map: optionGroupIdMap } = await this.importOptionGroups();

        // 2. Import Ingredients (Pre-flight)
        // Extract all unique ingredients from estimated recipes
        await this.importIngredients();

        // 3. Import Categories
        await this.importCategories();

        // 4. Import Products & Recipes
        await this.importProducts(optionGroupIdMap);

        await this.finalCommit();
        console.log('Import completed successfully!');
    }

    private async importOptionGroups() {
        const optionGroupIds: string[] = [];
        const optionGroupIdMap = new Map<string, string>(); // iFood ID -> Firestore ID

        if (!this.menuData?.optionGroups) return { ids: [], map: optionGroupIdMap };

        for (const group of this.menuData.optionGroups) {
            const ref = doc(collection(db, 'option_groups'));
            const data: any = {
                id: ref.id,
                tenantId: this.tenantId,
                title: group.title,
                type: group.type || 'MULTIPLE',
                required: group.required || false,
                min: group.min || 0,
                max: group.max || 10,
                options: (group.options || []).map((opt: any, idx: number) => ({
                    id: opt.id || `opt-${idx}`,
                    name: opt.name,
                    price: opt.price || 0
                })),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.batch.set(ref, data);
            optionGroupIds.push(ref.id);
            optionGroupIdMap.set(group.id, ref.id);
            await this.commitBatchIfNeeded();
        }
        return { ids: optionGroupIds, map: optionGroupIdMap };
    }

    private async importIngredients() {
        // Collect all ingredients
        const ingredientsToCreate = new Map<string, any>();

        if (!this.menuData?.products) return;
        for (const prod of this.menuData.products) {
            if (prod.estimatedRecipe) {
                for (const part of prod.estimatedRecipe.parts) {
                    if (!ingredientsToCreate.has(part.name)) {
                        ingredientsToCreate.set(part.name, {
                            unit: part.unit,
                            cost: part.costPerUnit
                        });
                    }
                }
            }
        }

        // Create them
        for (const [name, info] of ingredientsToCreate) {
            const ref = doc(collection(db, 'ingredients'));
            // Fix: Include isActive instead of active, costPerUnit matching
            const data: any = { // Use any for tenantId
                id: ref.id,
                tenantId: this.tenantId,
                name: name,
                unit: info.unit,
                cost: info.cost, // base cost
                costPerUnit: info.cost, // specific field 
                minStock: 10,
                currentStock: 100,
                isActive: true,
                updatedAt: new Date().toISOString()
            };
            this.batch.set(ref, data);
            this.createdIngredients.set(name, ref.id);
            await this.commitBatchIfNeeded();
        }
    }

    private async importCategories() {
        if (!this.menuData?.categories) return;
        for (const cat of this.menuData.categories) {
            // Check if exists logic could go here, but for now we append/overwrite by ID logic if we wanted fixed IDs
            // For simplicitly, we just create new ones or assume user clears DB first.
            // Let's create proper categories collection items
            const ref = doc(collection(db, 'categories'));
            const data: Category = {
                id: ref.id,
                tenantId: this.tenantId,
                name: cat.name,
                order: cat.order,
                active: true
            };
            this.batch.set(ref, data);
            await this.commitBatchIfNeeded();
        }
    }

    private async importProducts(optionGroupIdMap: Map<string, string>) {
        if (!this.menuData?.products) return;
        for (const prod of this.menuData.products) {
            const prodRef = doc(collection(db, 'products'));
            let recipeId = undefined;

            // 4a. Create Recipe if needed
            if (prod.estimatedRecipe) {
                const recipeRef = doc(collection(db, 'recipes'));
                recipeId = recipeRef.id;

                const ingredients: RecipeIngredient[] = prod.estimatedRecipe.parts.map((part: any) => ({
                    ingredientId: this.createdIngredients.get(part.name)!,
                    quantity: part.quantity,
                    unit: part.unit,
                    cost: part.costPerUnit * part.quantity
                }));

                const totalCost = prod.estimatedRecipe.parts.reduce((acc: number, part: any) => acc + (part.costPerUnit * part.quantity), 0);

                const recipeData: Recipe = {
                    id: recipeRef.id,
                    tenantId: this.tenantId,
                    productId: prodRef.id,
                    name: `Receita: ${prod.name}`,
                    ingredients: ingredients,
                    steps: [],
                    yield: 1,
                    yieldUnit: 'un',
                    totalCost: totalCost,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                this.batch.set(recipeRef, recipeData);
                await this.commitBatchIfNeeded();
            }

            // 4b. Translate iFood optionGroupIds to Firestore IDs
            const productOptionGroups = (prod.optionGroupIds || [])
                .map((ifoodId: string) => optionGroupIdMap.get(ifoodId))
                .filter((id: string | undefined): id is string => !!id);

            // Use iFood image or placeholder
            const image = prod.image || `https://placehold.co/600x400/e2e8f0/1e293b?text=${encodeURIComponent(prod.name)}`;

            const productData: Product = {
                id: prodRef.id,
                tenantId: this.tenantId,
                name: prod.name,
                description: prod.description || '',
                cost: 0,
                tags: [],
                category: prod.category,
                type: prod.type as any,
                image: image,
                imageAlt: prod.imageAlt || `Foto de ${prod.name}`,
                slug: prod.seoSlug || prod.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
                ingredients: [],
                optionGroupIds: productOptionGroups,
                recipeId: recipeId ?? undefined,
                channels: [
                    { channel: 'pos', price: prod.price, isAvailable: true, displayName: prod.name },
                    { channel: 'digital-menu', price: prod.price, isAvailable: true, displayName: prod.name },
                    { channel: 'ifood', price: prod.price * 1.2, isAvailable: true, displayName: prod.name }
                ],
            };

            this.batch.set(prodRef, productData);
            this.createdProductIds.set(prod.name, prodRef.id);
            await this.commitBatchIfNeeded();
        }

        // 5. Link Combos (Post-product creation)
        // Combos need IDs of items they contain. 
        // Logic: Find combo products in JC_DATA, update their 'comboItems' field with real IDs.
        // For this simple importer, we'll try to do it in-pass or post-pass.
        // We'll do a quick pass for COMBO types now that createdProductIds map is populated.

        // (Simplification: The 'products' loop above already created the Combo Product, but without the 'comboConfig'. 
        // We need to update it.)

        if (!this.menuData?.products) return;
        for (const prod of this.menuData.products) {
            if (prod.type === 'COMBO' && prod.comboItems) {
                const prodId = this.createdProductIds.get(prod.name);
                if (prodId) {
                    const comboRef = doc(db, 'products', prodId);
                    const items = prod.comboItems.map((item: any) => ({
                        productId: this.createdProductIds.get(item.productName) || '',
                        quantity: item.quantity
                    })).filter((i: any) => i.productId !== '');

                    // Partial update for comboItems
                    this.batch.update(comboRef, { comboItems: items });
                    await this.commitBatchIfNeeded();
                }
            }
        }

    }
}
