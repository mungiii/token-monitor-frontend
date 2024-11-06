import { useState } from 'react';
import { Token, Transaction } from '@/types/token';
import { fetchTokenTransactions } from '@/utils/api';

interface TokenCardProps {
    token: Token;
}

export default function TokenCard({ token }: TokenCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Enhanced number formatting functions
    const formatNumber = (value: string | number | null | undefined, options: {
        decimals?: number;
        useCommas?: boolean;
        prefix?: string;
    } = {}) => {
        const { decimals = 0, useCommas = true, prefix = '' } = options;
        
        if (value == null) return 'N/A';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        
        if (isNaN(numValue)) return 'N/A';
        
        // Format with specified decimal places
        const formatted = numValue.toFixed(decimals);
        
        // Add commas if requested
        const withCommas = useCommas 
            ? parseInt(formatted).toLocaleString('en-US')
            : formatted;
            
        return `${prefix}${withCommas}`;
    };

    // Format ratio numbers specifically
    const formatRatio = (value: string | number | null | undefined) => {
        if (value == null) return 'N/A';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(numValue) ? 'N/A' : numValue.toFixed(2);
    };

    // Format SOL values
    const formatSol = (value: string | number | null | undefined) => {
        return formatNumber(value, { decimals: 2, useCommas: true, prefix: '◎ ' });
    };

    async function loadTransactions() {
        if (!isExpanded || transactions.length > 0) return;
        
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTokenTransactions(token.token_id);
            setTransactions(data.transactions);
        } catch (err) {
            setError('Failed to load transactions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function handleExpand() {
        setIsExpanded(!isExpanded);
        if (!isExpanded) {
            loadTransactions();
        }
    }

    return (
        <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center cursor-pointer" onClick={handleExpand}>
                <div>
                    <h3 className="text-lg font-semibold">{token.name || 'Unnamed'} ({token.symbol || 'N/A'})</h3>
                    <p className="text-sm text-gray-600">ID: {token.token_id}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm">Market Cap: {formatSol(token.market_cap_at_filter)}</p>
                    <p className="text-sm">Quality/Bot Ratio: {formatRatio(token.quality_to_bot_ratio)}</p>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <h4 className="font-semibold">Volume Stats</h4>
                            <p>Total Volume: {formatSol(token.total_volume)}</p>
                            <p>Bot Volume: {formatSol(token.bot_volume)}</p>
                            <p>Non-Bot Volume: {formatSol(token.non_bot_volume)}</p>
                            <p>Non-Bot %: {formatRatio(token.non_bot_volume_percentage)}%</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Wallet Stats</h4>
                            <p>Total Wallets: {formatNumber(token.total_transacting_wallets)}</p>
                            <p>Bot Wallets: {formatNumber(token.suspected_bot_wallets)}</p>
                            <p>Quality Wallets: {formatNumber(token.quality_wallets)}</p>
                            <p>Bot Wallet Ratio: {formatRatio(token.bot_wallet_ratio)}</p>
                        </div>
                    </div>

                    <h4 className="font-semibold mb-2">Transactions</h4>
                    {loading && <p>Loading transactions...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {transactions.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">Amount</th>
                                        <th className="px-4 py-2">Volume</th>
                                        <th className="px-4 py-2">Wallet Type</th>
                                        <th className="px-4 py-2">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.signature} className="border-t">
                                            <td className="px-4 py-2 capitalize">{tx.tx_type}</td>
                                            <td className="px-4 py-2">{formatNumber(tx.token_amount)}</td>
                                            <td className="px-4 py-2">{formatSol(tx.volume_sol)}</td>
                                            <td className="px-4 py-2 capitalize">{tx.wallet_type}</td>
                                            <td className="px-4 py-2">
                                                {new Date(tx.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}