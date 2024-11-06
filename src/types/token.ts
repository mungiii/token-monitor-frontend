export interface Token {
    token_id: string;
    created_at: string;
    name: string;
    symbol: string;
    description: string;
    image_url: string;
    creator_address: string;
    status: 'new' | 'accepted';
    source: string;
    filtered_at: string;
    market_cap_at_filter: string;
    last_updated: string;
    metadata: any;
    days_pre_acceptance_criteria: number;
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
    total_transactions: number;
    bot_transactions: number;
    non_bot_transactions: number;
    bot_wallet_ratio: string;
    quality_to_bot_ratio: string;
}

export interface Transaction {
    transaction_id: number;
    token_id: string;
    signature: string;
    trader_address: string;
    tx_type: 'create' | 'buy' | 'sell';
    token_amount: number;
    new_token_balance: number;
    bonding_curve_key: string;
    v_tokens_in_bonding_curve: number;
    v_sol_in_bonding_curve: number;
    market_cap_sol: number;
    wallet_type: 'bot' | 'quality' | 'unknown';
    created_at: string;
    volume_sol: number;
}