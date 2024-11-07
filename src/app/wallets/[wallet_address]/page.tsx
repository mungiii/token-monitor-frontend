// src/app/wallets/[wallet_address]/page.tsx

'use client';

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { WalletStats } from '@/types/token';
import { fetchWalletStats } from '@/utils/api';
import Loader from '@/components/Loader';

export default function WalletDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const walletAddress = params.wallet_address as string;
    const fromTokenId = searchParams.get('from_token');

    const [stats, setStats] = useState<WalletStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatNumber = (value: number | null | undefined, decimals: number = 2) => {
        if (value == null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        async function loadWalletStats() {
            setLoading(true);
            try {
                const data = await fetchWalletStats(walletAddress);
                setStats(data);
                setError(null);
            } catch (err) {
                console.error('Error loading wallet stats:', err);
                setStats(null);
                setError(err instanceof Error ? err.message : 'Failed to load wallet stats');
            } finally {
                setLoading(false);
            }
        }

        loadWalletStats();
    }, [walletAddress]);

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
                ← Back
            </button>

            {/* Basic Info */}
            <div className="mb-8 bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold mb-2">Wallet Details</h1>
                    <div className="flex items-center space-x-2">
                        <p className="font-mono text-gray-600 break-all">{walletAddress}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="p-6">
                        <Loader />
                    </div>
                ) : error ? (
                    <div className="p-6">
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                            <h2 className="text-lg font-medium text-yellow-800 mb-2">Wallet Statistics Unavailable</h2>
                            <p className="text-yellow-700">
                                {error.includes("not found") 
                                    ? "This wallet hasn't made any transactions yet."
                                    : "There was an error loading the wallet statistics."}
                            </p>
                        </div>
                    </div>
                ) : stats ? (
                    <>
                        {/* Trading Activity */}
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold mb-4">Trading Activity</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">Total Trades</p>
                                    <p className="text-lg font-medium">{formatNumber(stats.total_trades, 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Tokens Traded</p>
                                    <p className="text-lg font-medium">{formatNumber(stats.tokens_traded, 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Net SOL Volume</p>
                                    <p className="text-lg font-medium">◎ {formatNumber(stats.net_sol_volume)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Classification */}
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold mb-4">Classification</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">Dominant Type</p>
                                    <p className="text-lg font-medium capitalize">{stats.dominant_classification}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Bot Transactions</p>
                                    <p className="text-lg font-medium">{formatNumber(stats.classification_counts.bot, 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Quality Transactions</p>
                                    <p className="text-lg font-medium">{formatNumber(stats.classification_counts.quality, 0)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Unknown Transactions</p>
                                    <p className="text-lg font-medium">{formatNumber(stats.classification_counts.unknown, 0)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="p-6 border-b">
                            <h2 className="text-xl font-semibold mb-4">Timeline</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-600">First Transaction</p>
                                    <p className="text-lg font-medium">{formatDate(stats.first_transaction_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Last Transaction</p>
                                    <p className="text-lg font-medium">{formatDate(stats.last_transaction_date)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Current Token Balances */}
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Current Token Balances</h2>
                            {stats.current_token_balances.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.current_token_balances.map((balance) => (
                                                <tr key={balance.token_id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => router.push(`/tokens/${balance.token_id}`)}
                                                            className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                                                        >
                                                            {balance.token_id}
                                                        </button>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        {formatNumber(balance.balance)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {formatDate(balance.last_updated)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500">No current token balances</p>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}