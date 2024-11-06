'use client';

import { useEffect, useState } from 'react';
import { Token } from '@/types/token';
import { fetchAcceptedTokens } from '@/utils/api';
import TokenCard from '@/components/TokenCard';

export default function Home() {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadTokens() {
            try {
                const data = await fetchAcceptedTokens();
                setTokens(data);
            } catch (err) {
                setError('Failed to load tokens');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        loadTokens();
    }, []);

    if (loading) return <div className="p-8">Loading tokens...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <main className="container mx-auto p-8">
            <h1 className="text-3xl font-bold mb-8">Accepted Tokens</h1>
            <div className="space-y-4">
                {tokens.map((token) => (
                    <TokenCard key={token.token_id} token={token} />
                ))}
            </div>
        </main>
    );
}