// src/utils/api.ts

import { Token, Transaction, MarketCapSnapshot, WalletStats } from '@/types/token';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

export async function fetchAcceptedTokens(page: number = 1, limit: number = 20): Promise<Token[]> {
    const response = await fetch(
        `${API_URL}/api/tokens`,
        { cache: 'no-store' }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch tokens');
    }

    const allTokens = await response.json();
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return Array.isArray(allTokens)
        ? allTokens.slice(startIndex, endIndex)
        : [];
}

export async function fetchToken(tokenId: string): Promise<Token> {
    const response = await fetch(`${API_URL}/api/tokens/${tokenId}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch token');
    }
    
    return response.json();
}

export async function fetchTokenTransactions(
    tokenId: string,
    page: number = 1,
    limit: number = 50
): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
    net_sol_volume: number;
    latest_token_balance: number;
}> {
    const response = await fetch(
        `${API_URL}/api/tokens/${tokenId}/transactions?page=${page}&limit=${limit}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch transactions');
    }

    return response.json();
}

export async function fetchTokenMarketCaps(
    tokenId: string,
    snapshotType?: string,
    order: 'ASC' | 'DESC' = 'DESC'
): Promise<MarketCapSnapshot[]> {
    const queryParams = new URLSearchParams();
    if (snapshotType) queryParams.append('snapshot_type', snapshotType);
    queryParams.append('order', order);

    const response = await fetch(
        `${API_URL}/api/tokens/${tokenId}/marketcaps?${queryParams}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch market caps');
    }

    return response.json();
}

export async function fetchWalletStats(address: string): Promise<WalletStats> {
    const url = `${API_URL}/api/wallets/${address}/stats`;
    console.log('Fetching wallet stats from:', url);

    const response = await fetch(url);
    
    if (!response.ok) {
        console.error('Wallet stats response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.url
        });
        
        if (response.status === 404) {
            throw new Error(`Wallet ${address} not found`);
        }
        throw new Error('Failed to fetch wallet stats');
    }
    
    return response.json();
}