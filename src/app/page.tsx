'use client';

import { useEffect, useRef, useState } from 'react';
import { Token } from '@/types/token';
import { fetchAcceptedTokens } from '@/utils/api';
import TokenCard from '@/components/TokenCard';
import Loader from '@/components/Loader';
import { MarketCapProvider } from '@/contexts/MarketCapContext';

const ITEMS_PER_PAGE = 20;

export default function Home() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);
    const loaderRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);

    const loadMoreTokens = async (page: number) => {
        if (loadingRef.current) return;
        
        try {
            loadingRef.current = true;
            setLoading(true);
            
            const newTokens = await fetchAcceptedTokens(page, ITEMS_PER_PAGE);
            console.log(`Loaded ${newTokens.length} tokens for page ${page}`);
            
            if (page === 1) {
                setTokens(newTokens);
            } else {
                setTokens(prevTokens => [...prevTokens, ...newTokens]);
            }
            
            setHasMore(newTokens.length === ITEMS_PER_PAGE);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error loading tokens:', err);
            setError('Failed to load tokens');
        } finally {
            setLoading(false);
            loadingRef.current = false;
            if (initialLoad) setInitialLoad(false);
        }
    };

    useEffect(() => {
        loadMoreTokens(1);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting && hasMore && !loadingRef.current && !initialLoad) {
                    loadMoreTokens(currentPage + 1);
                }
            },
            { threshold: 0.1 }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore, currentPage, initialLoad]);

    return (
        <MarketCapProvider>
            <div className="relative min-h-screen z-10">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">focus</h1>
                        <div className="text-sm text-gray-600">
                            <p>Showing {tokens.length} tokens</p>
                        </div>
                    </div>
                    
                    {initialLoad ? (
                        <div className="py-8">
                            <Loader />
                        </div>
                    ) : error ? (
                        <div className="text-red-500">{error}</div>
                    ) : tokens.length > 0 ? (
                        <div className="space-y-6">
                            {tokens.map((token) => (
                                <TokenCard 
                                    key={token.token_id}
                                    token={token} 
                                />
                            ))}
                            
                            {/* Loader Reference */}
                            <div ref={loaderRef} className="mt-4 py-4">
                                {loading && !initialLoad && <Loader />}
                            </div>

                            {!loading && !hasMore && (
                                <p className="text-center text-gray-500 mt-4">
                                    All tokens loaded
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 mt-4">
                            No tokens found
                        </p>
                    )}
                </div>
            </div>
        </MarketCapProvider>
    );
}