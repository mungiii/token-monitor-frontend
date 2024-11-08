import React, { useEffect } from 'react';
import { Token } from '@/types/token';
import { useRouter } from 'next/navigation';
import { useMarketCaps } from '@/contexts/MarketCapContext';

interface TokenCardProps {
    token: Token;
}

const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
    const router = useRouter();
    const { marketCaps, loadMarketCaps, isLoading } = useMarketCaps();
    const analytics = token.analytics || {};

    // Parse numeric values from analytics
    const initialMarketCap = parseFloat(analytics.initial_market_cap || '0');
    const totalVolume = parseFloat(analytics.total_volume || '0');
    const nonBotVolume = parseFloat(analytics.non_bot_volume || '0');
    const preAcceptanceTime = analytics.minutes_pre_acceptance_criteria ?? 'N/A';
    const walletsHolding = analytics.wallets_holding ?? 'N/A';
    const qualityWallets = analytics.quality_wallets ?? 'N/A';
    const creatorSolBalance = parseFloat(analytics.creator_sol_balance_usd || '0');
    const creatorSplBalance = parseFloat(analytics.creator_spl_balance_usd || '0');
    const totalParticipatingBalance = parseFloat(analytics.helius_total_value || '0');

    // Format dollar values
    const formatDollarValue = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(value);
    };

    // Get market cap snapshots from context
    const marketCapSnapshots = marketCaps[token.token_id] || [];

    useEffect(() => {
        loadMarketCaps(token.token_id);
    }, [token.token_id, loadMarketCaps]);

    // Function to open token details in a new tab
    const openDetailsInNewTab = () => {
        window.open(`/tokens/${token.token_id}`, '_blank');
    };

    return (
        <div
            onClick={openDetailsInNewTab}
            className="rounded-lg shadow-lg bg-white border border-gray-200 p-6 transition-all hover:shadow-xl hover:scale-105 cursor-pointer"
        >
            <div className="flex gap-4 mb-4">
                {token.image && (
                    <img
                        src={token.image}
                        alt={token.name || 'Token image'}
                        className="w-20 h-20 object-cover rounded-full"
                    />
                )}
                <div>
                    <h3 className="text-xl font-bold text-gray-900">
                        {token.name} (${token.symbol})
                    </h3>
                    <p className="text-sm mt-2 text-gray-700">{token.description || ''}</p>
                </div>
            </div>

            {/* Market Cap Snapshots Section */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-gray-700 font-semibold">
                    Bonded @ {new Date(token.created_at).toLocaleString()}
                </h4>
                {isLoading[token.token_id] ? (
                    <div className="text-center py-2">
                        <span className="text-blue-500">Loading market cap data...</span>
                    </div>
                ) : (
                    <table className="w-full mt-2 text-gray-600">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Initial Market Cap</th>
                                <th className="px-4 py-2 text-left">+5m</th>
                                <th className="px-4 py-2 text-left">+15m</th>
                                <th className="px-4 py-2 text-left">+30m</th>
                                <th className="px-4 py-2 text-left">+1h</th>
                                <th className="px-4 py-2 text-left">+3h</th>
                                <th className="px-4 py-2 text-left">+1d</th>
                                <th className="px-4 py-2 text-left">+3d</th>
                                <th className="px-4 py-2 text-left">+7d</th>
                                <th className="px-4 py-2 text-left">+30d</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="px-4 py-2 border">
                                    ◎ {Math.round(initialMarketCap)}
                                </td>
                                {['5m', '15m', '30m', '1h', '3h', '1d', '3d', '7d', '30d'].map((snapshotType) => {
                                    const snapshot = marketCapSnapshots.find(s => s.snapshot_type === snapshotType);
                                    return (
                                        <td key={snapshotType} className="px-4 py-2 border">
                                            {snapshot ? (
                                                `◎ ${Math.round(snapshot.market_cap)}`
                                            ) : (
                                                <span className="text-gray-400">N/A</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                )}
            </div>

            {/* Feature Fields Section */}
            <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="text-gray-700 font-semibold">Feature Fields</h4>
                <div className="grid grid-cols-2 gap-4 text-gray-600 mt-2">
                    <div>Minutes to Bond: {preAcceptanceTime} mins</div>
                    <div>Holders: {walletsHolding}</div>
                    <div>Total Volume: ◎ {Math.round(totalVolume)}</div>
                    <div>Non-Bot Volume: ◎ {Math.round(nonBotVolume)}</div>
                    <div>Quality Wallets: {qualityWallets}</div>
                    <div>Creator Sol Balance: {formatDollarValue(creatorSolBalance)}</div>
                    <div>Creator SPL Balance: {formatDollarValue(creatorSplBalance)}</div>
                    <div>Total Participating Balance Value: {formatDollarValue(totalParticipatingBalance)}</div>
                </div>
            </div>
        </div>
    );
};

export default TokenCard;