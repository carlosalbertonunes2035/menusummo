import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import {
    generateTableQRCodeURL,
    generateQRCodeImage,
    downloadQRCode,
    printQRCode
} from '../../lib/utils/qrCodeGenerator';
import { QrCode, Download, Printer, Plus, Trash2, Eye } from 'lucide-react';

interface TableQRCode {
    tableNumber: string;
    url: string;
    qrCodeImage: string;
}

export function QRCodeManager() {
    const { settings } = useApp();
    const [tables, setTables] = useState<TableQRCode[]>([]);
    const [newTableNumber, setNewTableNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedQR, setSelectedQR] = useState<TableQRCode | null>(null);

    const tenantSlug = settings.slug || 'meu-estabelecimento';

    // Load existing tables from settings or localStorage
    useEffect(() => {
        const savedTables = localStorage.getItem(`qr_tables_${tenantSlug}`);
        if (savedTables) {
            setTables(JSON.parse(savedTables));
        }
    }, [tenantSlug]);

    // Save tables to localStorage
    const saveTables = (updatedTables: TableQRCode[]) => {
        localStorage.setItem(`qr_tables_${tenantSlug}`, JSON.stringify(updatedTables));
        setTables(updatedTables);
    };

    // Add new table
    const handleAddTable = async () => {
        if (!newTableNumber.trim()) return;

        setLoading(true);
        try {
            const url = generateTableQRCodeURL(tenantSlug, newTableNumber);
            const qrCodeImage = await generateQRCodeImage(url);

            const newTable: TableQRCode = {
                tableNumber: newTableNumber,
                url,
                qrCodeImage,
            };

            saveTables([...tables, newTable]);
            setNewTableNumber('');
        } catch (error) {
            console.error('Error adding table:', error);
            alert('Erro ao gerar QR Code');
        } finally {
            setLoading(false);
        }
    };

    // Remove table
    const handleRemoveTable = (tableNumber: string) => {
        if (confirm(`Remover QR Code da Mesa ${tableNumber}?`)) {
            saveTables(tables.filter(t => t.tableNumber !== tableNumber));
        }
    };

    // Download QR Code
    const handleDownload = async (table: TableQRCode) => {
        try {
            await downloadQRCode(table.url, `mesa-${table.tableNumber}.png`);
        } catch (error) {
            console.error('Error downloading QR Code:', error);
            alert('Erro ao baixar QR Code');
        }
    };

    // Print QR Code
    const handlePrint = (table: TableQRCode) => {
        try {
            printQRCode(table.qrCodeImage, table.tableNumber);
        } catch (error) {
            console.error('Error printing QR Code:', error);
            alert('Erro ao imprimir QR Code');
        }
    };

    // Print all QR Codes
    const handlePrintAll = () => {
        if (tables.length === 0) {
            alert('Nenhuma mesa cadastrada');
            return;
        }

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Erro ao abrir janela de impressão');
            return;
        }

        const qrCodesHTML = tables.map(table => `
      <div class="qr-page">
        <h1>Mesa ${table.tableNumber}</h1>
        <img src="${table.qrCodeImage}" alt="QR Code Mesa ${table.tableNumber}" />
        <p>Escaneie para fazer seu pedido</p>
      </div>
    `).join('');

        printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Codes - Todas as Mesas</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
            }
            .qr-page {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              page-break-after: always;
              padding: 40px;
              border: 2px solid #000;
              margin: 20px;
            }
            .qr-page:last-child {
              page-break-after: auto;
            }
            h1 {
              margin: 0 0 20px 0;
              font-size: 48px;
            }
            img {
              max-width: 300px;
              height: auto;
            }
            p {
              margin: 20px 0 0 0;
              font-size: 18px;
            }
            @media print {
              .qr-page {
                margin: 0;
              }
            }
          </style>
        </head>
        <body>
          ${qrCodesHTML}
        </body>
      </html>
    `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Gerenciador de QR Codes
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Gere QR Codes para suas mesas e permita que clientes façam pedidos pelo celular
                </p>
            </div>

            {/* URL Base */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <QrCode className="text-blue-600 dark:text-blue-400" size={20} />
                    <span className="font-semibold text-blue-900 dark:text-blue-200">URL Base:</span>
                </div>
                <code className="text-sm text-blue-700 dark:text-blue-300 break-all">
                    {generateTableQRCodeURL(tenantSlug, '[NUMERO_MESA]')}
                </code>
            </div>

            {/* Add New Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Adicionar Nova Mesa
                </h2>
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Número da mesa (ex: 1, 2, 3...)"
                        value={newTableNumber}
                        onChange={(e) => setNewTableNumber(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTable()}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={handleAddTable}
                        disabled={loading || !newTableNumber.trim()}
                        className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Adicionar
                    </button>
                </div>
            </div>

            {/* Tables List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Mesas Cadastradas ({tables.length})
                    </h2>
                    {tables.length > 0 && (
                        <button
                            onClick={handlePrintAll}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                        >
                            <Printer size={18} />
                            Imprimir Todos
                        </button>
                    )}
                </div>

                {tables.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <QrCode size={48} className="mx-auto mb-4 opacity-50" />
                        <p className="text-lg">Nenhuma mesa cadastrada</p>
                        <p className="text-sm mt-2">Adicione mesas para gerar QR Codes</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tables.map((table) => (
                            <div
                                key={table.tableNumber}
                                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                        Mesa {table.tableNumber}
                                    </h3>
                                    <button
                                        onClick={() => handleRemoveTable(table.tableNumber)}
                                        className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                                    <img
                                        src={table.qrCodeImage}
                                        alt={`QR Code Mesa ${table.tableNumber}`}
                                        className="w-full h-auto"
                                    />
                                </div>

                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3 break-all">
                                    {table.url}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSelectedQR(table)}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Eye size={16} />
                                        Ver
                                    </button>
                                    <button
                                        onClick={() => handleDownload(table)}
                                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Download size={16} />
                                        Baixar
                                    </button>
                                    <button
                                        onClick={() => handlePrint(table)}
                                        className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Printer size={16} />
                                        Imprimir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {selectedQR && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Mesa {selectedQR.tableNumber}
                            </h2>
                            <button
                                onClick={() => setSelectedQR(null)}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-4">
                            <img
                                src={selectedQR.qrCodeImage}
                                alt={`QR Code Mesa ${selectedQR.tableNumber}`}
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-all">
                            <strong>URL:</strong><br />
                            {selectedQR.url}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleDownload(selectedQR)}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                Baixar PNG
                            </button>
                            <button
                                onClick={() => handlePrint(selectedQR)}
                                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                                Imprimir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
