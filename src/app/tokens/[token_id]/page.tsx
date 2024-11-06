// src/app/tokens/[token_id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Token, Transaction } from '@/types/token';
import { fetchAcceptedTokens, fetchTokenTransactions } from '@/utils/api';

export default function TokenDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const tokenId = params.token_id as string;

    const [token, setToken] = useState<Token | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Format functions (same as TokenCard)
    const formatNumber = (value: string | number | null | undefined, options: {
        decimals?: number;
        useCommas?: boolean;
        prefix?: string;
    } = {}) => {
        const { decimals = 0, useCommas = true, prefix = '' } = options;
        
        if (value == null) return 'N/A';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isNaN(numValue)) return 'N/A';
        
        const formatted = numValue.toFixed(decimals);
        const withCommas = useCommas 
            ? parseInt(formatted).toLocaleString('en-US')
            : formatted;
            
        return `${prefix}${withCommas}`;
    };

    const formatSol = (value: string | number | null | undefined) => {
        return formatNumber(value, { decimals: 2, useCommas: true, prefix: '◎ ' });
    };

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '[date is null]';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        async function loadTokenDetails() {
            setLoading(true);
            setError(null);
            try {
                // Fetch token details
                const tokens = await fetchAcceptedTokens();
                const currentToken = tokens.find(t => t.token_id === tokenId);
                
                if (!currentToken) {
                    throw new Error('Token not found');
                }
                
                setToken(currentToken);

                // Fetch transactions
                const txData = await fetchTokenTransactions(tokenId);
                setTransactions(txData.transactions.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                ));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load token details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        if (tokenId) {
            loadTokenDetails();
        }
    }, [tokenId]);

    if (loading) return (
        <div className="container mx-auto p-8">
            <div className="text-center">Loading token details...</div>
        </div>
    );

    if (error) return (
        <div className="container mx-auto p-8">
            <div className="text-red-500">{error}</div>
            <button 
                onClick={() => router.push('/')}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                Back to Tokens
            </button>
        </div>
    );

    if (!token) return null;

    return (
        <div className="container mx-auto p-8">
            {/* Back Button */}
            <button 
                onClick={() => router.push('/')}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                ← Back to Tokens
            </button>

            {/* Token Information */}
            <div className="mb-8 border rounded-lg p-6 bg-white shadow-sm">
                <h1 className="text-3xl font-bold mb-6">
                    {token.name || '[name is null]'} ({token.symbol || '[symbol is null]'})
                </h1>
                
                {/* Re-use the same token information layout from TokenCard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Basic Information */}
                    <div className="space-y-2">
                        <h2 className="font-semibold">General Information</h2>
                        <p>Status: {token.status}</p>
                        <p>Source: {token.source || '[source is null]'}</p>
                        <p>Creator: {token.creator_address || '[creator is null]'}</p>
                        <p>Created: {formatDate(token.created_at)}</p>
                        <p>Last Updated: {formatDate(token.last_updated)}</p>
                    </div>

                    {/* Market Information */}
                    <div className="space-y-2">
                        <h2 className="font-semibold">Market Information</h2>
                        <p>Initial Market Cap: {formatSol(token.initial_market_cap)}</p>
                        <p>Current Market Cap: {formatSol(token.market_cap_at_filter)}</p>
                        <p>Filtered At: {formatDate(token.filtered_at)}</p>
                        <p>Criteria Accepted: {formatDate(token.criteria_accepted_date)}</p>
                    </div>

                    {/* Volume Information */}
                    <div className="space-y-2">
                        <h2 className="font-semibold">Volume Information</h2>
                        <p>Total Volume: {formatSol(token.total_volume)}</p>
                        <p>Bot Volume: {formatSol(token.bot_volume)}</p>
                        <p>Non-Bot Volume: {formatSol(token.non_bot_volume)}</p>
                    </div>
                </div>
            </div>

            {/* Transactions Section */}
            <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Transactions</h2>
                
                {transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-2 text-left">Trader Address</th>
                                    <th className="px-4 py-2 text-left">Type</th>
                                    <th className="px-4 py-2 text-right">Amount</th>
                                    <th className="px-4 py-2 text-left">Wallet Type</th>
                                    <th className="px-4 py-2 text-right">Volume (SOL)</th>
                                    <th className="px-4 py-2 text-left">Created At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.signature} className="border-t">
                                        <td className="px-4 py-2 font-mono text-sm">
                                            {tx.trader_address || 'null'}
                                        </td>
                                        <td className="px-4 py-2 capitalize">
                                            {tx.tx_type || 'null'}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {tx.token_amount !== null && tx.token_amount !== undefined 
                                                ? formatNumber(tx.token_amount)
                                                : 'null'}
                                        </td>
                                        <td className="px-4 py-2 capitalize">
                                            {tx.wallet_type || 'null'}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {tx.volume_sol !== null && tx.volume_sol !== undefined 
                                                ? formatSol(tx.volume_sol)
                                                : 'null'}
                                        </td>
                                        <td className="px-4 py-2">
                                            {tx.created_at 
                                                ? formatDate(tx.created_at)
                                                : 'null'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        No transactions found for this token.
                    </div>
                )}
            </div>
        </div>
    );
}