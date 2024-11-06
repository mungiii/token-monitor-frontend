// src/app/wallets/[wallet_address]/page.tsx
'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function WalletDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const walletAddress = params.wallet_address as string;
    const fromTokenId = searchParams.get('from_token');

    const handleBack = () => {
        if (fromTokenId) {
            router.push(`/tokens/${fromTokenId}`);
        } else {
            router.push('/');
        }
    };

    return (
        <div className="container mx-auto p-8">
            {/* Back Button */}
            <button 
                onClick={handleBack}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                ← Back to Token Details
            </button>

            {/* Wallet Information */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Wallet Details</h1>
                <p className="font-mono text-lg break-all">{walletAddress}</p>
            </div>
        </div>
    );
}