import { Token, Transaction } from '@/types/token';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined');
}

export async function fetchAcceptedTokens(): Promise<Token[]> {
    const response = await fetch(`${API_URL}/api/tokens`);
    if (!response.ok) {
        throw new Error('Failed to fetch tokens');
    }
    return response.json();
}

export async function fetchTokenTransactions(tokenId: string, page: number = 1): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
}> {
    const response = await fetch(`${API_URL}/api/tokens/${tokenId}/transactions?page=${page}`);
    if (!response.ok) {
        throw new Error('Failed to fetch transactions');
    }
    return response.json();
}