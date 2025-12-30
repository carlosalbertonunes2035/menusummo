import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'SUMMO - Cardápio Digital',
    description: 'Peça delivery ou retirada com o melhor cardápio digital do Brasil',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
