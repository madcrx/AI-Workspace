'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockWidgetProps {
  settings?: {
    symbols?: string[];
  };
}

export function StockWidget({ settings }: StockWidgetProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultSymbols = settings?.symbols || ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

  useEffect(() => {
    // Mock data - replace with real API in production
    const mockStocks: StockData[] = defaultSymbols.map(symbol => ({
      symbol,
      price: Math.random() * 500 + 100,
      change: Math.random() * 20 - 10,
      changePercent: Math.random() * 4 - 2,
    }));

    setStocks(mockStocks);
    setLoading(false);

    const interval = setInterval(() => {
      setStocks(prev => prev.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() * 2 - 1),
        change: stock.change + (Math.random() * 0.5 - 0.25),
        changePercent: stock.changePercent + (Math.random() * 0.1 - 0.05),
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [defaultSymbols.join(',')]);

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="pt-4 pb-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-2">
            {stocks.map((stock) => (
              <div key={stock.symbol} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{stock.symbol}</span>
                  {stock.change >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">${stock.price.toFixed(2)}</div>
                  <div className={`text-xs ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
