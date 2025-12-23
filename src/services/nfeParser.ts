
/**
 * Serviço para parsear XML de Nota Fiscal Eletrônica (NFe) no navegador.
 * Padrão: SEFAZ NFe v4.00
 */

interface NFeItem {
    rawName: string;
    quantity: number;
    totalCost: number;
    unit: string;
    ean?: string; // Código de barras
}

export const parseNFeXML = async (file: File): Promise<NFeItem[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const xmlText = e.target?.result as string;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xmlText, "text/xml");
                
                // Verifica se é uma NFe válida
                const infNFe = xmlDoc.getElementsByTagName("infNFe")[0];
                if (!infNFe) {
                    throw new Error("Arquivo XML inválido ou não é uma NFe.");
                }

                const items: NFeItem[] = [];
                const dets = xmlDoc.getElementsByTagName("det");

                for (let i = 0; i < dets.length; i++) {
                    const prod = dets[i].getElementsByTagName("prod")[0];
                    
                    if (prod) {
                        const xProd = prod.getElementsByTagName("xProd")[0]?.textContent || "Item Desconhecido";
                        const qCom = parseFloat(prod.getElementsByTagName("qCom")[0]?.textContent || "0");
                        const vProd = parseFloat(prod.getElementsByTagName("vProd")[0]?.textContent || "0");
                        const uCom = prod.getElementsByTagName("uCom")[0]?.textContent || "UN";
                        const cEAN = prod.getElementsByTagName("cEAN")[0]?.textContent || "";

                        // Ignora serviços ou itens zerados
                        if (qCom > 0) {
                            items.push({
                                rawName: xProd,
                                quantity: qCom,
                                totalCost: vProd,
                                unit: uCom,
                                ean: cEAN
                            });
                        }
                    }
                }
                resolve(items);

            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
};
