import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CandlestickChart } from 'lucide-react';

const SYMBOLS: { label: string; tv: string }[] = [
  { label: 'BTC / USD', tv: 'BINANCE:BTCUSDT' },
  { label: 'ETH / USD', tv: 'BINANCE:ETHUSDT' },
  { label: 'EUR / USD', tv: 'FX:EURUSD' },
  { label: 'GBP / USD', tv: 'FX:GBPUSD' },
  { label: 'USD / JPY', tv: 'FX:USDJPY' },
  { label: 'XAU / USD (Or)', tv: 'OANDA:XAUUSD' },
  { label: 'NAS100', tv: 'OANDA:NAS100USD' },
  { label: 'US30', tv: 'OANDA:US30USD' },
  { label: 'SP500', tv: 'OANDA:SPX500USD' },
];

const INTERVALS: { label: string; value: string }[] = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1J', value: 'D' },
  { label: '1S', value: 'W' },
];

interface Props {
  height?: number;
  defaultSymbol?: string;
}

const MarketChart = ({ height = 560, defaultSymbol = 'BINANCE:BTCUSDT' }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [interval, setIntervalValue] = useState('60');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';
    container.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'fr',
      backgroundColor: 'rgba(18, 18, 18, 1)',
      gridColor: 'rgba(255, 255, 255, 0.06)',
      hide_side_toolbar: false,
      allow_symbol_change: true,
      withdateranges: true,
      details: true,
      hotlist: false,
      calendar: false,
      studies: ['STD;EMA', 'STD;RSI'],
      support_host: 'https://www.tradingview.com',
    });
    container.appendChild(script);

    return () => { container.innerHTML = ''; };
  }, [symbol, interval]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={symbol} onValueChange={setSymbol}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SYMBOLS.map(s => <SelectItem key={s.tv} value={s.tv}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1">
          {INTERVALS.map(i => (
            <Button
              key={i.value}
              size="sm"
              variant={interval === i.value ? 'default' : 'outline'}
              onClick={() => setIntervalValue(i.value)}
              className={interval === i.value
                ? 'gradient-gold text-primary-foreground h-8 px-3'
                : 'border-border text-muted-foreground hover:text-foreground h-8 px-3'}
            >
              {i.label}
            </Button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <CandlestickChart className="w-4 h-4 text-gold" /> Cours en direct — TradingView
        </span>
      </div>

      <div
        ref={containerRef}
        className="tradingview-widget-container rounded-lg border border-border overflow-hidden bg-card"
        style={{ height }}
      />
    </div>
  );
};

export default MarketChart;
