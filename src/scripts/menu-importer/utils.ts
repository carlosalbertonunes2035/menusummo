export const mapIFoodToSummo = (ifoodData: any) => {
    const categories: any[] = [];
    const products: any[] = [];
    const optionGroups: any[] = ifoodData.optionGroups || [];

    if (!ifoodData.categories) return { categories: [], products: [], optionGroups: [] };

    const restaurant = ifoodData.restaurant || 'Restaurante';
    const city = ifoodData.city || 'cidade';

    ifoodData.categories.forEach((cat: any, index: number) => {
        categories.push({
            name: cat.name,
            order: index + 1
        });

        cat.items.forEach((item: any) => {
            // Basic Reverse Engineering rules based on name
            const estimatedRecipe = deduceRecipe(item.name, item.description);

            // SEO-optimized image info
            const seoSlug = generateSeoSlug(item.name, restaurant, city);
            const altText = generateAltText(item.name, restaurant);

            products.push({
                name: item.name,
                description: item.description || "",
                price: item.price,
                category: cat.name,
                type: item.type || "SIMPLE",
                image: item.image,
                imageOriginal: item.imageOriginal,
                seoSlug: seoSlug,
                imageAlt: altText,
                optionGroupIds: item.optionGroupIds || [],
                estimatedRecipe
            });
        });
    });

    return {
        categories,
        products,
        optionGroups
    };
};

/**
 * Generate SEO-friendly slug for images
 * Example: "Espeto de Picanha" + "JC Espetaria" + "rio-preto" -> "espeto-picanha-jc-espetaria-rio-preto"
 */
export function generateSeoSlug(productName: string, storeName: string, city: string): string {
    const slugify = (str: string) => str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${slugify(productName)}-${slugify(storeName)}-${slugify(city)}`;
}

/**
 * Generate SEO alt text for accessibility
 * Example: "Foto de Espeto de Picanha Premium - JC Espetaria"
 */
export function generateAltText(productName: string, storeName: string): string {
    return `Foto de ${productName} - ${storeName}`;
}

/**
 * Enhanced AI-like logic to deduce ingredients from product name
 */
function deduceRecipe(name: string, description: string) {
    const parts: any[] = [];
    const lowerName = name.toLowerCase();
    const lowerDesc = (description || '').toLowerCase();
    const combined = `${lowerName} ${lowerDesc}`;

    // Rule-based deduction with expanded keywords
    if (combined.includes("picanha")) {
        parts.push({ name: "Picanha", unit: "kg", costPerUnit: 75.00, quantity: 0.150 });
        parts.push({ name: "Espeto de Bambu", unit: "un", costPerUnit: 0.10, quantity: 1 });
    } else if (combined.includes("alcatra")) {
        parts.push({ name: "Alcatra", unit: "kg", costPerUnit: 55.00, quantity: 0.150 });
        parts.push({ name: "Espeto de Bambu", unit: "un", costPerUnit: 0.10, quantity: 1 });
    } else if (combined.includes("linguiça") || combined.includes("linguica")) {
        parts.push({ name: "Linguiça Artesanal", unit: "kg", costPerUnit: 28.00, quantity: 0.100 });
        parts.push({ name: "Espeto de Bambu", unit: "un", costPerUnit: 0.10, quantity: 1 });
    } else if (combined.includes("espeto") || combined.includes("carne")) {
        parts.push({ name: "Corte Bovino Selecionado", unit: "kg", costPerUnit: 45.00, quantity: 0.150 });
        parts.push({ name: "Espeto de Bambu", unit: "un", costPerUnit: 0.10, quantity: 1 });
    } else if (combined.includes("frango") || combined.includes("coração") || combined.includes("coracão")) {
        parts.push({ name: "Frango/Ave", unit: "kg", costPerUnit: 18.00, quantity: 0.150 });
        parts.push({ name: "Espeto de Bambu", unit: "un", costPerUnit: 0.10, quantity: 1 });
    } else if (combined.includes("bacon")) {
        parts.push({ name: "Bacon Defumado", unit: "kg", costPerUnit: 55.00, quantity: 0.080 });
        parts.push({ name: "Espeto de Bambu", unit: "un", costPerUnit: 0.10, quantity: 1 });
    } else if (combined.includes("queijo")) {
        parts.push({ name: "Queijo Coalho", unit: "kg", costPerUnit: 42.00, quantity: 0.100 });
        parts.push({ name: "Espeto de Bambu", unit: "un", costPerUnit: 0.10, quantity: 1 });
    } else if (combined.includes("coca") || combined.includes("guaraná") || combined.includes("refrigerante") || combined.includes("fanta")) {
        parts.push({ name: "Refrigerante Lata", unit: "un", costPerUnit: 2.50, quantity: 1 });
    } else if (combined.includes("cerveja") || combined.includes("heineken") || combined.includes("brahma") || combined.includes("skol")) {
        parts.push({ name: "Cerveja Long Neck", unit: "un", costPerUnit: 4.00, quantity: 1 });
    } else if (combined.includes("suco")) {
        parts.push({ name: "Suco Natural", unit: "un", costPerUnit: 3.00, quantity: 1 });
    } else if (combined.includes("água") || combined.includes("agua")) {
        parts.push({ name: "Água Mineral", unit: "un", costPerUnit: 1.50, quantity: 1 });
    } else if (combined.includes("batata") || combined.includes("fritas")) {
        parts.push({ name: "Batata Congelada", unit: "kg", costPerUnit: 14.00, quantity: 0.400 });
        parts.push({ name: "Óleo de Fritura", unit: "L", costPerUnit: 8.00, quantity: 0.050 });
        parts.push({ name: "Embalagem Porção", unit: "un", costPerUnit: 0.80, quantity: 1 });
    } else if (combined.includes("mandioca") || combined.includes("aipim")) {
        parts.push({ name: "Mandioca", unit: "kg", costPerUnit: 8.00, quantity: 0.500 });
        parts.push({ name: "Embalagem Porção", unit: "un", costPerUnit: 0.80, quantity: 1 });
    } else if (combined.includes("porção") || combined.includes("porcao")) {
        parts.push({ name: "Insumo Base Porção", unit: "kg", costPerUnit: 12.00, quantity: 0.400 });
        parts.push({ name: "Embalagem Porção", unit: "un", costPerUnit: 0.80, quantity: 1 });
    } else if (combined.includes("combo") || combined.includes("jantinha")) {
        parts.push({ name: "Combo Base", unit: "un", costPerUnit: 15.00, quantity: 1 });
    }

    // Add seasoning for meat items
    if (parts.length > 0 && (combined.includes("espeto") || combined.includes("carne") || combined.includes("frango"))) {
        parts.push({ name: "Tempero/Sal Grosso", unit: "kg", costPerUnit: 5.00, quantity: 0.010 });
    }

    if (parts.length === 0) return null;

    return { parts };
}

