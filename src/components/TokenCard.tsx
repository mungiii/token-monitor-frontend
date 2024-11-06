// src/components/TokenCard.tsx

import { Token } from '@/types/token';
import { useRouter } from 'next/navigation';

interface TokenCardProps {
    token: Token;
}

export default function TokenCard({ token }: TokenCardProps) {
    const router = useRouter();

    // Keep existing formatting functions
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

    const formatRatio = (value: string | number | null | undefined) => {
        if (value == null) return 'N/A';
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(numValue) ? 'N/A' : numValue.toFixed(2);
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
        <div className="border rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow">
            {/* Basic Information */}
            <div className="mb-4 border-b pb-4">
                <h3 className="text-lg font-semibold">
                    {token.name || '[name is null]'} ({token.symbol || '[symbol is null]'})
                </h3>
                <p className="text-sm text-gray-600 font-mono">Token ID: {token.token_id}</p>
                <p className="text-sm mt-2">{token.description || '[description is null]'}</p>
            </div>

            {/* Feature Fields */}
            <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-3">Feature Fields</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Days Pre-Acceptance</p>
                        <p className="font-medium">{token.days_pre_acceptance_criteria || '[null]'}</p>
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
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Creation and Status Information */}
                <div className="space-y-2">
                    <h4 className="font-semibold">General Information</h4>
                    <p>Status: {token.status}</p>
                    <p>Source: {token.source || '[source is null]'}</p>
                    <p>Creator: {token.creator_address || '[creator is null]'}</p>
                    <p>Created: {formatDate(token.created_at)}</p>
                    <p>Last Updated: {formatDate(token.last_updated)}</p>
                </div>

                {/* Market Information */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Market Information</h4>
                    <p>Initial Market Cap: {formatSol(token.initial_market_cap)}</p>
                    <p>Current Market Cap: {formatSol(token.market_cap_at_filter)}</p>
                    <p>Filtered At: {formatDate(token.filtered_at)}</p>
                    <p>Criteria Accepted: {formatDate(token.criteria_accepted_date)}</p>
                </div>

                {/* Ratios and Other Metrics */}
                <div className="space-y-2">
                    <h4 className="font-semibold">Additional Metrics</h4>
                    <p>Bot Wallet Ratio: {formatRatio(token.bot_wallet_ratio)}</p>
                    <p>Quality/Bot Ratio: {formatRatio(token.quality_to_bot_ratio)}</p>
                    <p>Non-Bot Volume %: {formatRatio(token.non_bot_volume_percentage)}%</p>
                    <p>Total Transactions: {formatNumber(token.total_transactions)}</p>
                    <p>Bot Transactions: {formatNumber(token.bot_transactions)}</p>
                    <p>Non-Bot Transactions: {formatNumber(token.non_bot_transactions)}</p>
                </div>
            </div>

            {/* View Details Button */}
            <div className="mt-4 flex justify-end">
                <button
                    onClick={handleViewDetails}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Token Details
                </button>
            </div>
        </div>
    );
}