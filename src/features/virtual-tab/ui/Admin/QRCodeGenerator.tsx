import { useState } from 'react';
import QRCode from 'qrcode';
import { useAuth } from '@/contexts/AuthContext';

interface QRCodeGeneratorProps {
    tableCount: number;
}

export function QRCodeGenerator({ tableCount }: QRCodeGeneratorProps) {
    const { currentUser } = useAuth();
    const [generating, setGenerating] = useState(false);
    const [qrCodes, setQrCodes] = useState<{ tableId: string; dataUrl: string }[]>([]);

    const generateQRCodes = async () => {
        if (!currentUser?.tenantId) return;

        setGenerating(true);
        const codes: { tableId: string; dataUrl: string }[] = [];

        try {
            for (let i = 1; i <= tableCount; i++) {
                const tableId = `table-${i}`;
                const url = `${window.location.origin}/mesa/${tableId}?t=${currentUser.tenantId}`;

                const dataUrl = await QRCode.toDataURL(url, {
                    width: 300,
                    margin: 2,
                    color: {
                        dark: '#FF6B00', // Orange
                        light: '#FFFFFF',
                    },
                });

                codes.push({ tableId, dataUrl });
            }

            setQrCodes(codes);
        } catch (err) {
            console.error('Error generating QR codes:', err);
        } finally {
            setGenerating(false);
        }
    };

    const downloadQRCode = (tableId: string, dataUrl: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${tableId}-qrcode.png`;
        link.click();
    };

    const downloadAllQRCodes = () => {
        qrCodes.forEach(({ tableId, dataUrl }) => {
            setTimeout(() => downloadQRCode(tableId, dataUrl), 100);
        });
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Gerador de QR Codes
            </h2>

            <p className="text-slate-600 dark:text-slate-400 mb-6">
                Gere QR Codes para suas {tableCount} mesas. Os clientes poderão escanear e fazer pedidos diretamente.
            </p>

            {qrCodes.length === 0 ? (
                <button
                    onClick={generateQRCodes}
                    disabled={generating}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                    {generating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Gerando QR Codes...
                        </>
                    ) : (
                        <>
                            📱 Gerar {tableCount} QR Codes
                        </>
                    )}
                </button>
            ) : (
                <>
                    <div className="mb-4">
                        <button
                            onClick={downloadAllQRCodes}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        >
                            💾 Baixar Todos os QR Codes
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                        {qrCodes.map(({ tableId, dataUrl }) => (
                            <div
                                key={tableId}
                                className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 text-center"
                            >
                                <img
                                    src={dataUrl}
                                    alt={`QR Code ${tableId}`}
                                    className="w-full h-auto mb-2 rounded"
                                />
                                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                    Mesa {tableId.replace('table-', '')}
                                </p>
                                <button
                                    onClick={() => downloadQRCode(tableId, dataUrl)}
                                    className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded transition-colors"
                                >
                                    Baixar
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
