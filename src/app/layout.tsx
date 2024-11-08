import './globals.css';
import { MarketCapProvider } from '@/contexts/MarketCapContext';

export const metadata = {
    title: 'Your App Title',
    description: 'Your App Description',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className="h-full scroll-smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link 
                    rel="preconnect" 
                    href="https://fonts.gstatic.com" 
                    crossOrigin="anonymous" 
                />
                <link 
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" 
                    rel="stylesheet" 
                />
            </head>
            <body className="h-full font-sans overflow-y-scroll">
                {/* Background Layer with Blur Effect */}
                <div className="fixed inset-0 z-0 animated-gradient"></div>
                
                {/* Main Content Layer */}
                <MarketCapProvider>
                    <main className="relative z-10">
                        {children}
                    </main>
                </MarketCapProvider>
            </body>
        </html>
    );
}