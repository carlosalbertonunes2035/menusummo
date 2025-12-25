export const JC_ESPETARIA_DATA = {
    categories: [
        { name: "Espetos Tradicionais", order: 1 },
        { name: "Espetos Especiais", order: 2 },
        { name: "Acompanhamentos & Porções", order: 3 },
        { name: "Bebidas", order: 4 },
        { name: "Combos da Casa", order: 0 }
    ],
    optionGroups: [
        {
            title: "Ponto da Carne",
            type: "SINGLE",
            required: true,
            options: [
                { name: "Ao Ponto", price: 0 },
                { name: "Mal Passado", price: 0 },
                { name: "Bem Passado", price: 0 }
            ]
        },
        {
            title: "Adicionais do Espeto",
            type: "MULTIPLE",
            required: false,
            options: [
                { name: "Farinha Especial", price: 0 },
                { name: "Molho de Alho", price: 2.00 },
                { name: "Pimenta da Casa", price: 0 }
            ]
        }
    ],
    products: [
        // ESPETOS TRADICIONAIS
        {
            name: "Espeto de Carne",
            description: "Suculento espeto de alcatra selecionada, temperado com sal grosso.",
            price: 12.00,
            category: "Espetos Tradicionais",
            type: "SIMPLE",
            imageParams: "bbq beef skewer",
            estimatedRecipe: {
                parts: [
                    { name: "Alcatra Bovina", unit: "kg", costPerUnit: 45.00, quantity: 0.150 },
                    { name: "Sal Grosso", unit: "kg", costPerUnit: 2.00, quantity: 0.005 },
                    { name: "Espeto de Madeira", unit: "un", costPerUnit: 0.08, quantity: 1 }
                ]
            }
        },
        {
            name: "Espeto de Frango",
            description: "Cubos de peito de frango marinados em ervas finas.",
            price: 10.00,
            category: "Espetos Tradicionais",
            type: "SIMPLE",
            imageParams: "chicken skewer bbq",
            estimatedRecipe: {
                parts: [
                    { name: "Peito de Frango", unit: "kg", costPerUnit: 18.00, quantity: 0.150 },
                    { name: "Marinada de Ervas", unit: "L", costPerUnit: 10.00, quantity: 0.010 },
                    { name: "Espeto de Madeira", unit: "un", costPerUnit: 0.08, quantity: 1 }
                ]
            }
        },
        {
            name: "Espeto de Linguiça",
            description: "Linguiça toscana artesanal assada na brasa.",
            price: 10.00,
            category: "Espetos Tradicionais",
            type: "SIMPLE",
            imageParams: "sausage skewer bbq",
            estimatedRecipe: {
                parts: [
                    { name: "Linguiça Toscana", unit: "kg", costPerUnit: 22.00, quantity: 0.150 },
                    { name: "Espeto de Madeira", unit: "un", costPerUnit: 0.08, quantity: 1 }
                ]
            }
        },
        {
            name: "Pão de Alho",
            description: "Pão baguete recheado com creme de alho especial e queijo.",
            price: 9.00,
            category: "Espetos Tradicionais",
            type: "SIMPLE",
            imageParams: "garlic bread bbq",
            estimatedRecipe: {
                parts: [
                    { name: "Pão de Alho (Unidade)", unit: "un", costPerUnit: 3.50, quantity: 1 }
                ]
            }
        },

        // ESPETOS ESPECIAIS
        {
            name: "Espeto de Picanha",
            description: "Corte nobre de picanha, macia e suculenta.",
            price: 22.00,
            category: "Espetos Especiais",
            type: "SIMPLE",
            imageParams: "picanha skewer bbq",
            estimatedRecipe: {
                parts: [
                    { name: "Picanha Importada", unit: "kg", costPerUnit: 89.00, quantity: 0.150 },
                    { name: "Sal de Parrilla", unit: "kg", costPerUnit: 15.00, quantity: 0.005 },
                    { name: "Espeto de Madeira", unit: "un", costPerUnit: 0.08, quantity: 1 }
                ]
            }
        },
        {
            name: "Medalhão de Frango",
            description: "Peito de frango envolto em bacon defumado.",
            price: 16.00,
            category: "Espetos Especiais",
            type: "SIMPLE",
            imageParams: "bacon wrapped chicken skewer",
            estimatedRecipe: {
                parts: [
                    { name: "Peito de Frango", unit: "kg", costPerUnit: 18.00, quantity: 0.120 },
                    { name: "Bacon Fatiado", unit: "kg", costPerUnit: 35.00, quantity: 0.040 },
                    { name: "Espeto de Madeira", unit: "un", costPerUnit: 0.08, quantity: 1 }
                ]
            }
        },

        // PORÇÕES
        {
            name: "Batata Frita Especial",
            description: "Batatas crocantes com cheddar e bacon.",
            price: 28.00,
            category: "Acompanhamentos & Porções",
            type: "SIMPLE",
            imageParams: "french fries cheddar bacon",
            estimatedRecipe: {
                parts: [
                    { name: "Batata Congelada", unit: "kg", costPerUnit: 12.00, quantity: 0.400 },
                    { name: "Cheddar Cremoso", unit: "kg", costPerUnit: 40.00, quantity: 0.050 },
                    { name: "Bacon em Cubos", unit: "kg", costPerUnit: 35.00, quantity: 0.030 },
                    { name: "Embalagem Porção", unit: "un", costPerUnit: 0.80, quantity: 1 }
                ]
            }
        },
        {
            name: "Mandioca Frita",
            description: "Mandioca amarela frita, macia por dentro e crocante por fora.",
            price: 22.00,
            category: "Acompanhamentos & Porções",
            type: "SIMPLE",
            imageParams: "fried cassava mandioca",
            estimatedRecipe: {
                parts: [
                    { name: "Mandioca", unit: "kg", costPerUnit: 8.00, quantity: 0.400 },
                    { name: "Embalagem Porção", unit: "un", costPerUnit: 0.80, quantity: 1 }
                ]
            }
        },

        // BEBIDAS
        {
            name: "Coca-Cola 350ml",
            description: "Lata gelada.",
            price: 6.00,
            category: "Bebidas",
            type: "SIMPLE",
            imageParams: "coca cola can",
            estimatedRecipe: {
                parts: [
                    { name: "Coca-Cola Lata", unit: "un", costPerUnit: 2.50, quantity: 1 }
                ]
            }
        },
        {
            name: "Heineken Long Neck",
            description: "330ml.",
            price: 10.00,
            category: "Bebidas",
            type: "SIMPLE",
            imageParams: "heineken bottle",
            estimatedRecipe: {
                parts: [
                    { name: "Heineken LN", unit: "un", costPerUnit: 5.50, quantity: 1 }
                ]
            }
        },

        // COMBOS
        {
            name: "Combo Casal Raiz",
            description: "4 Espetos Tradicionais + 1 Pão de Alho + 1 Porção de Mandioca + 2 Bebidas.",
            price: 85.00,
            category: "Combos da Casa",
            type: "COMBO",
            imageParams: "bbq feast combo table",
            comboItems: [
                { productName: "Espeto de Carne", quantity: 2 },
                { productName: "Espeto de Frango", quantity: 2 },
                { productName: "Pão de Alho", quantity: 1 },
                { productName: "Mandioca Frita", quantity: 1 },
                { productName: "Coca-Cola 350ml", quantity: 2 }
            ]
        }
    ]
};
