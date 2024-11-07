'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { MarketCapSnapshot } from '@/types/token';
import { fetchTokenMarketCaps } from '@/utils/api';

interface MarketCapData {
    [tokenId: string]: MarketCapSnapshot[];
}

interface MarketCapContextType {
    marketCaps: MarketCapData;
    loadMarketCaps: (tokenId: string) => Promise<void>;
    isLoading: { [tokenId: string]: boolean };
}

const MarketCapContext = createContext<MarketCapContextType | undefined>(undefined);

export function MarketCapProvider({ children }: { children: React.ReactNode }) {
    const [marketCaps, setMarketCaps] = useState<MarketCapData>({});
    const [isLoading, setIsLoading] = useState<{ [tokenId: string]: boolean }>({});

    const loadMarketCaps = async (tokenId: string) => {
        if (marketCaps[tokenId] || isLoading[tokenId]) return;

        try {
            setIsLoading(prev => ({ ...prev, [tokenId]: true }));
            const snapshots = await fetchTokenMarketCaps(tokenId);
            setMarketCaps(prev => ({ ...prev, [tokenId]: snapshots }));
        } catch (error) {
            console.error(`Error loading market caps for token ${tokenId}:`, error);
            setMarketCaps(prev => ({ ...prev, [tokenId]: [] }));
        } finally {
            setIsLoading(prev => ({ ...prev, [tokenId]: false }));
        }
    };

    return (
        <MarketCapContext.Provider value={{ marketCaps, loadMarketCaps, isLoading }}>
            {children}
        </MarketCapContext.Provider>
    );
}

export function useMarketCaps() {
    const context = useContext(MarketCapContext);
    if (context === undefined) {
        throw new Error('useMarketCaps must be used within a MarketCapProvider');
    }
    return context;
}