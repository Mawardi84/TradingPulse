import { getQuote, getCandles } from '@mathieuc/tradingview';

const symbols = [
  'OANDA:XAUUSD',
  'BINANCE:BTCUSDT',
  'FX:EURUSD',
  'NASDAQ:AAPL',
  'IDX:BBCA',
  'TVC:USOIL'
];

async function checkSymbols() {
  for (const sym of symbols) {
    try {
      const q = await getQuote(sym);
      console.log(`[QUOTE OK] ${sym}: lp=${q.lp}, chp=${q.chp}%`);
    } catch (err: any) {
      console.log(`[QUOTE FAIL] ${sym}: ${err.message}`);
    }
  }

  try {
    const candles = await getCandles({ symbol: 'IDX:BBCA', timeframe: '1D' as any, count: 10 });
    console.log(`[CANDLES OK] IDX:BBCA count=${candles.length}, lastClose=${candles[candles.length - 1]?.close}`);
  } catch (err: any) {
    console.log(`[CANDLES FAIL] IDX:BBCA: ${err.message}`);
  }
}

checkSymbols();
