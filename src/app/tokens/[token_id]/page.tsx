// src/app/tokens/[token_id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Token, Transaction } from '@/types/token';
import { fetchAcceptedTokens, fetchTokenTransactions } from '@/utils/api';
import TokenCard from '@/components/TokenCard';
import Loader from '@/components/Loader';

interface WalletGroup {
    transactions: Transaction[];
    count: number;
    walletType: string;
    balanceAtAcceptance: string | null;
    currentBalance: string | null;
}

interface GroupedTransactions {
    [key: string]: WalletGroup;
}

export default function TokenDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const tokenId = params.token_id as string;

    const [token, setToken] = useState<Token | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return '[date is null]';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: undefined  // Remove timezone to keep the format clean
        });
    };

    const formatNumber = (value: string | number | null | undefined) => {
        if (!value) return '0';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
    };

    const groupedTransactions = transactions.reduce((groups: GroupedTransactions, transaction) => {
        const key = transaction.traderpublickey || 'unknown';
        if (!groups[key]) {
            groups[key] = {
                transactions: [],
                count: 0,
                walletType: transaction.wallet_type,
                balanceAtAcceptance: transaction.traders_token_balance_at_acceptance,
                currentBalance: null
            };
        }
        groups[key].transactions.push(transaction);
        groups[key].count += 1;

        // Update current balance to the latest newtokenbalance
        if (transaction.newtokenbalance) {
            groups[key].currentBalance = transaction.newtokenbalance;
        }
        return groups;
    }, {});
    
    const sortedGroups = Object.entries(groupedTransactions).sort(([, a], [, b]) => {
        const aDate = new Date(a.transactions[0].created_at).getTime();
        const bDate = new Date(b.transactions[0].created_at).getTime();
        return bDate - aDate; // Changed to show newest first
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
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime() // Changed to show newest first
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

    return (
        <div className="container mx-auto p-8">
            <button 
                onClick={() => router.push('/')}
                className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
                ← Back to Tokens
            </button>

            {loading ? (
                <div className="text-center">
                    <Loader />
                </div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : token ? (
                <div className="space-y-8">
                    <TokenCard token={token} hideDetailsButton={true} />

                    <div className="border rounded-lg p-6 bg-white shadow-sm">
                        <h2 className="text-2xl font-bold mb-4">Transactions</h2>
                        
                        {sortedGroups.length > 0 ? (
                            <div className="space-y-6">
                                {sortedGroups.map(([traderAddress, group]) => (
                                    <div key={traderAddress} className="border rounded-lg">
                                        <div className="bg-gray-50 p-4 rounded-t-lg border-b">
                                            <div className="flex flex-col space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => router.push(`/wallets/${traderAddress}?from_token=${token.token_id}`)}
                                                            className="text-blue-600 hover:text-blue-800 font-mono text-sm underline"
                                                        >
                                                            {traderAddress}
                                                        </button>
                                                        <span className={`text-sm px-2 py-1 rounded-full ${
                                                            group.walletType === 'quality' ? 'bg-green-100 text-green-800' :
                                                            group.walletType === 'bot' ? 'bg-red-100 text-red-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {group.walletType || 'unknown'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {group.count} transaction{group.count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-gray-600">Total Wallet Balance at Time of Acceptance: </span>
                                                        <span className="font-medium">
                                                            {formatNumber(group.balanceAtAcceptance)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600"> Tokens Held at Time of Acceptance </span>
                                                        <span className="font-medium">
                                                            {formatNumber(group.currentBalance)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="min-w-full">
                                                <thead>
                                                    <tr className="bg-gray-50">
                                                        <th className="px-4 py-2 text-left">Type</th>
                                                        <th className="px-4 py-2 text-right">Amount</th>
                                                        <th className="px-4 py-2 text-left">Created At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.transactions
                                                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
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
                                                                <td className="px-4 py-2">
                                                                    {formatDate(tx.created_at)}
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
            ) : null}
        </div>
    );
}