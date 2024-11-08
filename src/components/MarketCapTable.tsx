import { useEffect } from 'react';
import { useMarketCaps } from '@/contexts/MarketCapContext';
import { Token } from '@/types/token';

interface MarketCapTableProps {
    token: Token;
    formatSol: (value: string | number | null | undefined) => string;
}

const SNAPSHOT_TYPES = ['5m', '15m', '30m', '1h', '3h', '1d', '3d', '7d', '30d'] as const;

export default function MarketCapTable({ token, formatSol }: MarketCapTableProps) {
    const { marketCaps, loadMarketCaps, isLoading } = useMarketCaps();

    useEffect(() => {
        loadMarketCaps(token.token_id);
    }, [token.token_id, loadMarketCaps]);

    const snapshots = marketCaps[token.token_id] || [];

    return (
        <div className="mb-4">
            <h4 className="font-semibold text-blue-800 mb-3">Market Cap Snapshots</h4>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left bg-gray-50">Initial</th>
                            {SNAPSHOT_TYPES.map(type => (
                                <th key={type} className="px-4 py-2 text-left bg-gray-50">
                                    {type}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-2 border">
                                {token.analytics ? formatSol(token.analytics.initial_market_cap) : 'N/A'}
                            </td>
                            {SNAPSHOT_TYPES.map(type => {
                                const snapshot = snapshots.find(s => s.snapshot_type === type);
                                return (
                                    <td key={type} className="px-4 py-2 border">
                                        {snapshot ? formatSol(snapshot.market_cap) : 'N/A'}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}