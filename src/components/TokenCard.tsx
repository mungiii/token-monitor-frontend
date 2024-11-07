// src/components/TokenCard.tsx

import { Token } from '@/types/token';
import { useRouter } from 'next/navigation';
import MarketCapTable from './MarketCapTable';


interface TokenCardProps {
    token: Token;
}

export default function TokenCard({ token }: TokenCardProps) {
    const router = useRouter();

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

    const formatMinutes = (minutes: number): string => {
        if (!minutes) return 'N/A';
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
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

    const handleViewDetails = () => {
        router.push(`/tokens/${token.token_id}`);
    };

    return (
        <div className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            {/* Basic Information */}
            <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">
                    {token.name || '[name is null]'} ({token.symbol || '[symbol is null]'})
                </h3>
                <p className="text-sm text-gray-600 font-mono">Token ID: {token.token_id}</p>
                <p className="text-sm mt-2">{token.description || ''}</p>
            </div>

            {/* Feature Fields */}
            <div className="p-4 bg-blue-50 border-b border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-3">Feature Fields</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Pre-Acceptance Time</p>
                        <p className="font-medium">{formatMinutes(token.minutes_pre_acceptance_criteria)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Wallets Holding</p>
                        <p className="font-medium">{formatNumber(token.wallets_holding)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Volume</p>
                        <p className="font-medium">{formatSol(token.total_volume)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Bot Wallets</p>
                        <p className="font-medium">{formatNumber(token.suspected_bot_wallets)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Quality Wallets</p>
                        <p className="font-medium">{formatNumber(token.quality_wallets)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Non-Bot Volume</p>
                        <p className="font-medium">{formatSol(token.non_bot_volume)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Creator Balance (SOL)</p>
                        <p className="font-medium">{formatSol(token.creator_sol_balance_usd)}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 border-b">
                <MarketCapTable token={token} formatSol={formatSol} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                {/* Creation and Status Information */}
                <div className="p-4 space-y-2">
                    <h4 className="font-semibold">General Information</h4>
                    <p>Status: {token.status}</p>
                    <p>Creator: {token.creator || '[creator is null]'}</p>
                    <p>Created: {formatDate(token.created_at)}</p>
                </div>

                {/* Market Information */}
                <div className="p-4 space-y-2">
                    <h4 className="font-semibold">Market Information</h4>
                    <p>Initial Market Cap: {formatSol(token.initial_market_cap)}</p>
                    <p>Criteria Accepted: {formatDate(token.criteria_accepted_date)}</p>
                </div>

                {/* Ratios and Other Metrics */}
                <div className="p-4 space-y-2">
                    <h4 className="font-semibold">Additional Metrics</h4>
                    <p>Bot Wallet Ratio: {token.bot_wallet_ratio}</p>
                    <p>Quality/Bot Ratio: {token.quality_to_bot_ratio}</p>
                    <p>Non-Bot Volume %: {token.non_bot_volume_percentage}%</p>
                    <p>Total Transactions: {formatNumber(token.total_transactions)}</p>
                </div>
            </div>

            {/* View Details Button */}
            <div className="p-4 flex justify-end border-t">
                <button
                    onClick={() => router.push(`/tokens/${token.token_id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Token Details
                </button>
            </div>


        </div>
    );
}