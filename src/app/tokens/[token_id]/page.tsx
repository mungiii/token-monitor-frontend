'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Token, Transaction } from '@/types/token';
import { fetchAcceptedTokens, fetchTokenTransactions } from '@/utils/api';
import Loader from '@/components/Loader';

interface GroupedTransactions {
    [key: string]: {
        transactions: Transaction[];
        count: number;
    }
}

export default function TokenDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const tokenId = params.token_id as string;

    const [token, setToken] = useState<Token | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const formatRatio = (value: string | number | null | undefined) => {
        if (value == null) return 'N/A';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(numValue) ? 'N/A' : numValue.toFixed(2);
    };

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

    const groupedTransactions = transactions.reduce((groups: GroupedTransactions, transaction) => {
        const key = transaction.traderpublickey || 'unknown';
        if (!groups[key]) {
            groups[key] = {
                transactions: [],
                count: 0
            };
        }
        groups[key].transactions.push(transaction);
        groups[key].count += 1;
        return groups;
    }, {});
    
    const sortedGroups = Object.entries(groupedTransactions).sort(([, a], [, b]) => {
        const aDate = new Date(a.transactions[0].created_at).getTime();
        const bDate = new Date(b.transactions[0].created_at).getTime();
        return aDate - bDate;
    });

    useEffect(() => {
        async function loadTokenDetails() {
            setLoading(true);
            setError(null);
            try {
                const allTokens = await fetchAcceptedTokens(1, 1000);
                const currentToken = allTokens.find(t => t.token_id === tokenId);
                
                if (!currentToken) {
                    throw new Error('Token not found');
                }
                
                setToken(currentToken);
    
                const txData = await fetchTokenTransactions(tokenId);
                const sortedTransactions = txData.transactions.sort((a, b) => 
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                );
                setTransactions(sortedTransactions);
                
            } catch (err) {
                console.error('Error loading token details:', err);
                setError(err instanceof Error ? err.message : 'Failed to load token details');
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
            <button 
                onClick={() => router.push('/')}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                ← Back to Tokens
            </button>

            <div className="mb-8 border rounded-lg p-6 bg-white shadow-sm">
                <div className="mb-4 border-b pb-4">
                    <h1 className="text-lg font-semibold">
                        {token.name || '[name is null]'} ({token.symbol || '[symbol is null]'})
                    </h1>
                    <p className="text-sm text-gray-600 font-mono">Token ID: {token.token_id}</p>
                    <p className="text-sm mt-2">{token.description || ''}</p>
                </div>

                {token.analytics && (
                    <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-800 mb-3">Feature Fields</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Minutes Pre-Acceptance</p>
                                <p className="font-medium">
                                    {token.analytics.minutes_pre_acceptance_criteria 
                                        ? `${token.analytics.minutes_pre_acceptance_criteria} minutes`
                                        : '[null]'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Wallets Holding</p>
                                <p className="font-medium">{formatNumber(token.analytics.wallets_holding)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Volume</p>
                                <p className="font-medium">{formatSol(token.analytics.total_volume)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Bot Wallets</p>
                                <p className="font-medium">{formatNumber(token.analytics.suspected_bot_wallets)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Quality Wallets</p>
                                <p className="font-medium">{formatNumber(token.analytics.quality_wallets)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Non-Bot Volume</p>
                                <p className="font-medium">{formatSol(token.analytics.non_bot_volume)}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <h4 className="font-semibold">General Information</h4>
                        <p>Status: {token.status}</p>
                        <p>Creator: {token.creator || '[creator is null]'}</p>
                        <p>Created: {formatDate(token.created_at)}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold">Market Information</h4>
                        <p>Initial Market Cap: {token.analytics ? formatSol(token.analytics.initial_market_cap) : 'N/A'}</p>
                        <p>Criteria Accepted: {token.analytics ? formatDate(token.analytics.criteria_accepted_date) : 'N/A'}</p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold">Additional Metrics</h4>
                        <p>Bot Wallet Ratio: {token.analytics ? formatRatio(token.analytics.bot_wallet_ratio) : 'N/A'}</p>
                        <p>Quality/Bot Ratio: {token.analytics ? formatRatio(token.analytics.quality_to_bot_ratio) : 'N/A'}</p>
                        <p>Non-Bot Volume %: {token.analytics ? formatRatio(token.analytics.non_bot_volume_percentage) : 'N/A'}%</p>
                        <p>Total Transactions: {token.analytics ? formatNumber(token.analytics.total_transactions) : 'N/A'}</p>
                        <p>Bot Transactions: {token.analytics ? formatNumber(token.analytics.bot_transactions) : 'N/A'}</p>
                        <p>Non-Bot Transactions: {token.analytics ? formatNumber(token.analytics.non_bot_transactions) : 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-white shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Transactions</h2>
                
                {sortedGroups.length > 0 ? (
                    <div className="space-y-6">
                        {sortedGroups.map(([traderAddress, group]) => (
                            <div key={traderAddress} className="border rounded-lg">
                                <div className="bg-gray-50 p-4 rounded-t-lg border-b">
                                    <div className="flex items-center justify-between">
                                        <button
                                            onClick={() => router.push(`/wallets/${traderAddress}?from_token=${token.token_id}`)}
                                            className="text-blue-600 hover:text-blue-800 font-mono text-sm underline"
                                        >
                                            {traderAddress}
                                        </button>
                                        <span className="text-sm text-gray-600">
                                            {group.count} transaction{group.count !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-4 py-2 text-left">Type</th>
                                                <th className="px-4 py-2 text-right">Amount</th>
                                                <th className="px-4 py-2 text-left">Wallet Type</th>
                                                <th className="px-4 py-2 text-left">Created At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.transactions
                                                .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                                                .map((tx) => (
                                                    <tr key={tx.signature} className="border-t">
                                                        <td className="px-4 py-2 capitalize">
                                                            {tx.txtype || 'null'}
                                                        </td>
                                                        <td className="px-4 py-2 text-right">
                                                            {tx.tokenamount 
                                                                ? formatNumber(tx.tokenamount)
                                                                : 'null'}
                                                        </td>
                                                        <td className="px-4 py-2 capitalize">
                                                            {tx.wallet_type || 'null'}
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
                            </div>
                        ))}
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