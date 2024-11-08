export interface MarketCapSnapshot {
    token_id: string;
    snapshot_type: '5m' | '15m' | '30m' | '1h' | '3h' | '1d' | '3d' | '7d' | '30d';
    market_cap: number;
    snapshot_date: string;
    created_at: string;
}

export interface WalletStats {
    total_trades: number;
    tokens_traded: number;
    net_sol_volume: number;
    classification_counts: {
        bot: number;
        quality: number;
        unknown: number;
    };
    dominant_classification: 'bot' | 'quality' | 'unknown';
    first_transaction_date: string;
    last_transaction_date: string;
    current_token_balances: Array<{
        token_id: string;
        balance: number;
        last_updated: string;
    }>;
}

export interface Transaction {
    transaction_id: number;
    token_id: string;
    signature: string;
    traderpublickey: string;
    txtype: string;
    tokenamount: string;
    newtokenbalance: string;
    bondingcurvekey: string;
    vtokensinbondingcurve: string;
    vsolinbondingcurve: string;
    marketcapsol: string;
    wallet_type: 'bot' | 'quality' | 'unknown';
    created_at: string;
    sol_volume: number;
    traders_token_balance_at_acceptance: string;
    still_holding_at_acceptance: boolean;
    helius_total_value: string;
}

export interface Token {
    // Initial token data
    token_id: string;
    created_at: string;
    name: string;
    symbol: string;
    uri: string;
    status: 'new' | 'accepted';
    creator: string;
    description?: string;
    image?: string;
    twitter?: string;
    website?: string;
    telegram?: string;

    // Analytics data
    analytics: {
        minutes_pre_acceptance_criteria: number;
        criteria_accepted_date: string;
        initial_market_cap: string;
        total_transacting_wallets: number;
        wallets_holding: number;
        suspected_bot_wallets: number;
        quality_wallets: number;
        total_volume: string;
        bot_volume: string;
        non_bot_volume: string;
        non_bot_volume_percentage: string;
        total_transactions: string;
        bot_transactions: string;
        non_bot_transactions: string;
        bot_wallet_ratio: string;
        quality_to_bot_ratio: string;
        creator_sol_balance_usd: string;
        creator_spl_balance_usd: string;
        helius_total_value: string;
    } | null;
}