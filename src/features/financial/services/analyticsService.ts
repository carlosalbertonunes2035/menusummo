

import { Order, Product, OrderStatus, OrderItem } from '@/types';

export interface BostonMetrics {
    productId: string;
    productName: string;
    totalSold: number; // Y axis (Popularidade)
    averageMargin: number; // X axis (Lucratividade %)
    revenue: number;
    cost: number;
    quadrant: 'STAR' | 'CASH_COW' | 'PUZZLE' | 'DOG';
    recommendation: string;
}

export interface BostonAnalysisResult {
    metrics: BostonMetrics[];
    thresholds: {
        avgPopularity: number;
        avgMargin: number;
    };
}

/**
 * Calcula a Matriz de Boston (Engenharia de Cardápio)
 * Baseado em:
 * - Popularidade: Volume de vendas vs Média de vendas do mix
 * - Lucratividade: Margem de contribuição vs Média de margem do mix
 */
export const calculateMenuEngineering = (orders: Order[], products: Product[]): BostonAnalysisResult => {
    // 1. Filtrar pedidos válidos (Concluídos ou Prontos)
    const validOrders = orders.filter(o =>
        o.status === OrderStatus.COMPLETED ||
        o.status === OrderStatus.READY ||
        o.status === OrderStatus.DELIVERING
    );

    // 2. Agregar Vendas por Produto
    const salesMap = new Map<string, { qty: number }>();
    let totalShopQty = 0;

    validOrders.forEach(order => {
        order.items.forEach((item: OrderItem) => {
            const current = salesMap.get(item.productId) || { qty: 0 };
            salesMap.set(item.productId, {
                qty: current.qty + item.quantity
            });
            totalShopQty += item.quantity;
        });
    });

    // 3. Calcular Métricas Individuais
    const metrics: BostonMetrics[] = [];
    let productsWithSalesCount = 0;
    let weightedMarginSum = 0;

    products.forEach(product => {
        const stats = salesMap.get(product.id) || { qty: 0 };

        // @FIX: Access price from channel configuration.
        const posChannel = product.channels.find((c: any) => c.channel === 'pos') || product.channels[0];
        const price = posChannel?.price || 0;

        // Margem % = (Preço - Custo) / Preço
        // Se custo não estiver definido, assume margem 100% (erro de cadastro, mas evita crash)
        const cost = product.cost || 0;
        const marginPercent = price > 0 ? ((price - cost) / price) * 100 : 0;

        if (stats.qty > 0) {
            productsWithSalesCount++;
            // Para a média ponderada da loja
            weightedMarginSum += marginPercent * stats.qty;
        }

        metrics.push({
            productId: product.id,
            productName: product.name,
            totalSold: stats.qty,
            averageMargin: marginPercent,
            revenue: stats.qty * price,
            cost: stats.qty * cost,
            quadrant: 'DOG', // Placeholder
            recommendation: ''
        });
    });

    // 4. Calcular Linhas de Corte (Médias Globais)
    // Média de Popularidade = Total de Itens Vendidos / Número de Produtos Diferentes Vendidos
    // (Isso evita que produtos parados puxem a média muito para baixo, focando no mix ativo)
    const avgPopularity = productsWithSalesCount > 0 ? totalShopQty / productsWithSalesCount : 0;

    // Média de Margem (Ponderada pelo volume de vendas)
    // Isso reflete a "Margem Média Real" da operação
    const avgMargin = totalShopQty > 0 ? weightedMarginSum / totalShopQty : 0;

    // 5. Classificar Quadrantes
    metrics.forEach(m => {
        const highSales = m.totalSold >= avgPopularity;
        const highMargin = m.averageMargin >= avgMargin;

        if (highSales && highMargin) {
            m.quadrant = 'STAR';
            m.recommendation = 'Manter qualidade e padrão. Não alterar preço drasticamente.';
        } else if (highSales && !highMargin) {
            m.quadrant = 'CASH_COW';
            m.recommendation = 'Aumentar levemente o preço ou reduzir custo (CMV) para migrar para Estrela.';
        } else if (!highSales && highMargin) {
            m.quadrant = 'PUZZLE';
            m.recommendation = 'Investir em Marketing, fotos melhores ou destaque no cardápio.';
        } else {
            m.quadrant = 'DOG';
            m.recommendation = 'Avaliar remoção do cardápio ou reformulação completa.';
        }
    });

    return { metrics, thresholds: { avgPopularity, avgMargin } };
};
