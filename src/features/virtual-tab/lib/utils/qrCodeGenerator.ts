import QRCode from 'qrcode';

/**
 * Generate table QR Code URL
 */
export function generateTableQRCodeURL(
    tenantSlug: string,
    tableNumber: string
): string {
    const baseUrl = import.meta.env.VITE_APP_URL || 'https://summo.app';
    return `${baseUrl}/m/${tenantSlug}/mesa/${tableNumber}`;
}

/**
 * Generate QR Code image as Data URL
 */
export async function generateQRCodeImage(
    url: string,
    options?: {
        width?: number;
        margin?: number;
        color?: {
            dark?: string;
            light?: string;
        };
    }
): Promise<string> {
    try {
        const dataUrl = await QRCode.toDataURL(url, {
            width: options?.width || 300,
            margin: options?.margin || 2,
            color: {
                dark: options?.color?.dark || '#000000',
                light: options?.color?.light || '#FFFFFF',
            },
        });
        return dataUrl;
    } catch (error) {
        console.error('Error generating QR Code:', error);
        throw new Error('Failed to generate QR Code');
    }
}

/**
 * Generate QR Code as Canvas element
 */
export async function generateQRCodeCanvas(
    url: string,
    canvasElement: HTMLCanvasElement
): Promise<void> {
    try {
        await QRCode.toCanvas(canvasElement, url, {
            width: 300,
            margin: 2,
        });
    } catch (error) {
        console.error('Error generating QR Code canvas:', error);
        throw new Error('Failed to generate QR Code canvas');
    }
}

/**
 * Download QR Code as PNG
 */
export async function downloadQRCode(
    url: string,
    filename: string
): Promise<void> {
    const dataUrl = await generateQRCodeImage(url);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Generate PDV payment code
 */
export function generatePDVCode(tableNumber: string): string {
    const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
    return `M${tableNumber}-${timestamp}`;
}

/**
 * Print QR Code
 */
export function printQRCode(qrCodeDataUrl: string, tableNumber: string): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('Failed to open print window');
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>QR Code - Mesa ${tableNumber}</title>
        <style>
          body {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
          }
          .qr-container {
            text-align: center;
            padding: 40px;
            border: 2px solid #000;
            border-radius: 10px;
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
            body {
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="qr-container">
          <h1>Mesa ${tableNumber}</h1>
          <img src="${qrCodeDataUrl}" alt="QR Code Mesa ${tableNumber}" />
          <p>Escaneie para fazer seu pedido</p>
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}
