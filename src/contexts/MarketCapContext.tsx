'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
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

    const loadMarketCaps = useCallback(async (tokenId: string) => {
        // Debug logging
        console.log('Loading market caps for token:', tokenId);
        console.log('Current market caps state:', marketCaps);
        console.log('Current loading state:', isLoading);

        // Only fetch if we don't have the data and aren't currently loading
        if (!marketCaps[tokenId] && !isLoading[tokenId]) {
            try {
                setIsLoading(prev => ({ ...prev, [tokenId]: true }));
                console.log('Fetching market caps from API...');
                const snapshots = await fetchTokenMarketCaps(tokenId);
                console.log('Received snapshots:', snapshots);
                
                setMarketCaps(prev => {
                    const updated = { ...prev, [tokenId]: snapshots };
                    console.log('Updated market caps state:', updated);
                    return updated;
                });
            } catch (error) {
                console.error(`Error loading market caps for token ${tokenId}:`, error);
                setMarketCaps(prev => ({ ...prev, [tokenId]: [] }));
            } finally {
                setIsLoading(prev => ({ ...prev, [tokenId]: false }));
            }
        }
    }, [marketCaps, isLoading]);

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