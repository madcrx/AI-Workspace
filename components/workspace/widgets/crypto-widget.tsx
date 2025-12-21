'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CryptoData {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

interface CryptoWidgetProps {
  onSettings?: () => void;
  settings?: {
    coins?: string;
    currency?: string;
  };
}

export function CryptoWidget({ onSettings, settings }: CryptoWidgetProps) {
  const [cryptos, setCryptos] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  const coins = settings?.coins || 'BTC,ETH,BNB';
  const currency = settings?.currency || 'usd';

  // Map abbreviations to full CoinGecko IDs
  const coinAbbreviations: { [key: string]: string } = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'BNB': 'binancecoin',
    'ADA': 'cardano',
    'XRP': 'ripple',
    'SOL': 'solana',
    'DOT': 'polkadot',
    'DOGE': 'dogecoin',
    'MATIC': 'matic-network',
    'AVAX': 'avalanche-2',
    'LINK': 'chainlink',
    'UNI': 'uniswap',
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [coins, currency]);

  const fetchCryptoData = async () => {
    try {
      setLoading(true);
      // Convert abbreviations to full IDs
      const coinIds = coins.split(',').map(c => {
        const trimmed = c.trim().toUpperCase();
        return coinAbbreviations[trimmed] || trimmed.toLowerCase();
      }).join(',');

      // Using CoinGecko API (free, no API key required)
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=${currency}&include_24hr_change=true`
      );
      const data = await response.json();

      const cryptoArray: CryptoData[] = Object.entries(data).map(([id, values]: [string, any]) => {
        // Find the abbreviation for this coin
        const abbr = Object.keys(coinAbbreviations).find(key =>
          coinAbbreviations[key] === id
        ) || id.substring(0, 3).toUpperCase();

        return {
          id,
          symbol: abbr,
          price: values[currency] || 0,
          change24h: values[`${currency}_24h_change`] || 0,
        };
      });

      setCryptos(cryptoArray);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      setLoading(false);
    }
  };

  const currencySymbols: { [key: string]: string } = {
    'usd': '$',
    'eur': '€',
    'gbp': '£',
    'jpy': '¥',
    'aud': 'A$',
    'cad': 'C$',
  };

  const currencySymbol = currencySymbols[currency] || currency.toUpperCase();

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="pt-4 pb-4">
        {loading ? (
          <p className="text-xs text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-2">
            {cryptos.map((crypto) => (
              <div key={crypto.id} className="flex items-center justify-between text-xs">
                <span className="font-medium">{crypto.symbol}</span>
                <div className="flex items-center gap-2">
                  <span>{currencySymbol}{crypto.price.toLocaleString()}</span>
                  <span
                    className={`flex items-center gap-1 ${
                      crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {crypto.change24h >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(crypto.change24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
