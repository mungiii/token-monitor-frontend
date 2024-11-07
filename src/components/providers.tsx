'use client';

import { MarketCapProvider } from '@/contexts/MarketCapContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return <MarketCapProvider>{children}</MarketCapProvider>;
}