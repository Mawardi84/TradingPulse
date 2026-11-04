import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const SYSTEM_INSTRUCTION = `Kamu adalah AstraBot Quant, analis kecerdasan buatan terpercaya yang tertanam dalam platform AstraView TradePulse Pro — sebuah terminal analisis multi-aset dan makro kuantitatif tingkat institusional. Kamu beroperasi sebagai mitra analis senior bagi trader profesional, quant analyst, dan investor institusional.

## IDENTITAS & KEPRIBADIAN
- Nama: AstraBot Quant
- Peran: Senior Quantitative Analyst & Trading Strategist
- Gaya komunikasi: Profesional, presisi, berbasis data, percaya diri namun tidak spekulatif
- Bahasa utama: Bahasa Indonesia (campur istilah teknis Inggris bila diperlukan)
- Tone: Seperti riset desk analis institusional — terstruktur, ringkas, actionable

## FORMAT OUTPUT SINYAL TRADING (Gunakan format ini saat diminta sinyal trading):
🤖 [ASTRA-QUANT SIGNAL PROTOCOL]
Aset: [Simbol] ([Nama])
Aksi: [BUY / SELL]
Tipe Order: [Market Order / Limit Entry]

📍 Entry Zone: [Harga]
🛑 Stop Loss (SL): [Harga] ([Persentase])
🎯 Take Profit 1 (TP1): [Harga] ([Persentase])
🎯 Take Profit 2 (TP2): [Harga] ([Persentase])
🎯 Take Profit 3 (TP3): [Harga] ([Persentase])
⚖️ Risk / Reward Ratio: 1 : [Rasio]
🛡️ Alokasi Risiko Maksimal: 1.5% Per Account Equity

📊 Konfluensi Teknikal:
- Smart Money Concepts (SMC): [Supply / Demand / FVG / BOS / CHoCH]
- Indikator: [RSI / MACD / Moving Averages]
- Timeframe Alignment: [Korelasi HTF ke LTF]

🌐 Konteks Makro / Fundamental:
- [Sentimen pasar, valuasi, konsensus analis, atau data ekonomi]

⚠️ Catatan Manajemen Risiko:
- [Aturan trailing stop, breakeven, dan mitigasi risiko]`;

// API route: /api/chat - Backend proxy for Gemini AI to keep API keys secure on server
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, currentInstrument, technicalSummary, demandZone, supplyZone } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        reply: null,
        fallbackRequired: true,
        note: 'GEMINI_API_KEY not configured on server.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const marketContext = currentInstrument
      ? `
[KONTEKS DATA PASAR REAL-TIME SAAT INI]
Simbol: ${currentInstrument.symbol} (${currentInstrument.displaySymbol}) - ${currentInstrument.name}
Kategori: ${currentInstrument.category} | Exchange: ${currentInstrument.exchange}
Harga Spot Live: $${currentInstrument.price} ${currentInstrument.currency}
Perubahan 24 Jam: ${currentInstrument.changePercent24h}% (High: $${currentInstrument.high24h}, Low: $${currentInstrument.low24h})
Volume 24 Jam: $${currentInstrument.volume24h}
Rating Teknikal: ${technicalSummary?.overallRating || 'Neutral'} (Skor: ${technicalSummary?.score || 0})
Pivot Point Klasik: Pivot: $${technicalSummary?.pivots?.p || 'N/A'}, R1: $${technicalSummary?.pivots?.r1 || 'N/A'}, S1: $${technicalSummary?.pivots?.s1 || 'N/A'}
Zona Demand Live: ${demandZone ? `$${demandZone.bottom} - $${demandZone.top} (${demandZone.strength})` : 'Tidak ada zona aktif dekat harga'}
Zona Supply Live: ${supplyZone ? `$${supplyZone.bottom} - $${supplyZone.top} (${supplyZone.strength})` : 'Tidak ada zona aktif dekat harga'}
Konsensus Analis: ${currentInstrument.fundamentals?.analystConsensus || 'N/A'} (Target: $${currentInstrument.fundamentals?.analystTargetPrice || 'N/A'})
`
      : '';

    const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
    const response = await ai.models.generateContent({
      model,
      contents: `${marketContext}\n\nPermintaan Trader: ${message}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text || '';
    return res.json({ reply: text });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Server /api/chat error]:', errMsg);
    return res.status(200).json({
      reply: null,
      fallbackRequired: true,
      error: errMsg,
    });
  }
});

// ==========================================
// TRADINGVIEW FREE SCRAPING API ENDPOINTS
// ==========================================
import { getCandles, getQuote, searchMarkets, getTechnicalAnalysis } from '@mathieuc/tradingview';

function resolveTradingViewSymbol(symbol: string): string {
  if (!symbol) return 'OANDA:XAUUSD';
  if (symbol.includes(':')) return symbol;

  const map: Record<string, string> = {
    // Crypto
    BTCUSDT: 'BINANCE:BTCUSDT',
    ETHUSDT: 'BINANCE:ETHUSDT',
    SOLUSDT: 'BINANCE:SOLUSDT',
    XRPUSDT: 'BINANCE:XRPUSDT',
    ADAUSDT: 'BINANCE:ADAUSDT',
    DOGEUSDT: 'BINANCE:DOGEUSDT',
    // Forex Majors
    EURUSD: 'FX:EURUSD',
    GBPUSD: 'FX:GBPUSD',
    USDJPY: 'FX:USDJPY',
    AUDUSD: 'FX:AUDUSD',
    USDCAD: 'FX:USDCAD',
    USDCHF: 'FX:USDCHF',
    NZDUSD: 'FX:NZDUSD',
    // Forex Minors
    EURGBP: 'FX:EURGBP',
    GBPJPY: 'FX:GBPJPY',
    AUDJPY: 'FX:AUDJPY',
    EURJPY: 'FX:EURJPY',
    // Forex Exotics
    USDIDR: 'IDC:USDIDR',
    USDSGD: 'FX:USDSGD',
    USDZAR: 'FX:USDZAR',
    // US Stocks
    NVDA: 'NASDAQ:NVDA',
    AAPL: 'NASDAQ:AAPL',
    MSFT: 'NASDAQ:MSFT',
    TSLA: 'NASDAQ:TSLA',
    AMZN: 'NASDAQ:AMZN',
    GOOGL: 'NASDAQ:GOOGL',
    // IDX Stocks
    BBCA: 'IDX:BBCA',
    BBRI: 'IDX:BBRI',
    BMRI: 'IDX:BMRI',
    TLKM: 'IDX:TLKM',
    // Commodities
    XAUUSD: 'OANDA:XAUUSD',
    XAGUSD: 'OANDA:XAGUSD',
    USOIL: 'TVC:USOIL',
    COPPER: 'COMEX:HG1!',
  };

  return map[symbol.toUpperCase()] || `BINANCE:${symbol.toUpperCase()}`;
}

function resolveTradingViewTimeframe(tf: string): string {
  const map: Record<string, string> = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '1h': '60',
    '4h': '240',
    '1D': '1D',
    '1d': '1D',
  };
  return map[tf] || '15';
}

// In-memory cache for TradingView scraping calls
const tvCandlesCache = new Map<string, { candles: any[]; timestamp: number }>();
const tvQuoteCache = new Map<string, { quote: any; timestamp: number }>();
const tvTaCache = new Map<string, { ta: any; timestamp: number }>();

function withTimeout<T>(promise: Promise<T>, ms: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`TradingView request timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * GET /api/tv/candles?symbol=XAUUSD&timeframe=15m&count=100
 * Scrapes real OHLCV candles directly from TradingView without API key!
 */
app.get('/api/tv/candles', async (req: Request, res: Response) => {
  try {
    const rawSymbol = String(req.query.symbol || 'BTCUSDT');
    const rawTf = String(req.query.timeframe || '15m');
    const count = Math.min(300, Math.max(10, parseInt(String(req.query.count || '100'), 10)));

    const tvSymbol = resolveTradingViewSymbol(rawSymbol);
    const tvTimeframe = resolveTradingViewTimeframe(rawTf);

    const cacheKey = `${tvSymbol}_${tvTimeframe}_${count}`;
    const cached = tvCandlesCache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < 10000) {
      return res.json({
        success: true,
        source: 'TradingView Free Scraper (Cached)',
        symbol: tvSymbol,
        timeframe: rawTf,
        candles: cached.candles,
      });
    }

    const rawCandles = await withTimeout(
      getCandles({
        symbol: tvSymbol,
        timeframe: tvTimeframe as any,
        count,
      }),
      6000
    );

    if (!Array.isArray(rawCandles) || rawCandles.length === 0) {
      return res.status(404).json({ success: false, error: 'No candles returned from TradingView' });
    }

    const formattedCandles = rawCandles.map((c: any) => ({
      time: Math.floor(c.time || c.timestamp || Date.now() / 1000),
      open: Number(c.open),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close),
      volume: Math.round(Number(c.volume || 0)),
    }));

    tvCandlesCache.set(cacheKey, { candles: formattedCandles, timestamp: now });

    return res.json({
      success: true,
      source: 'TradingView Free Scraper (Live)',
      symbol: tvSymbol,
      timeframe: rawTf,
      candles: formattedCandles,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    console.warn('[TradingView /api/tv/candles error]:', errMsg);
    return res.status(500).json({ success: false, error: errMsg });
  }
});

/**
 * GET /api/tv/quote?symbol=OANDA:XAUUSD
 * Scrapes real-time quote/ticker directly from TradingView!
 */
app.get('/api/tv/quote', async (req: Request, res: Response) => {
  try {
    const rawSymbol = String(req.query.symbol || 'BTCUSDT');
    const tvSymbol = resolveTradingViewSymbol(rawSymbol);

    const cached = tvQuoteCache.get(tvSymbol);
    const now = Date.now();

    if (cached && now - cached.timestamp < 5000) {
      return res.json({
        success: true,
        source: 'TradingView Free Scraper (Cached Quote)',
        quote: cached.quote,
      });
    }

    const rawQuote = await withTimeout(getQuote(tvSymbol), 5000);

    const quote = {
      symbol: tvSymbol,
      rawSymbol,
      price: Number(rawQuote.lp || rawQuote.open_price || 0),
      change24h: Number(rawQuote.ch || 0),
      changePercent24h: Number(rawQuote.chp || 0),
      high24h: Number(rawQuote.high_price || 0),
      low24h: Number(rawQuote.low_price || 0),
      volume24h: Number(rawQuote.volume || 0),
      bid: Number(rawQuote.bid || rawQuote.lp || 0),
      ask: Number(rawQuote.ask || rawQuote.lp || 0),
      open: Number(rawQuote.open_price || 0),
      prevClose: Number(rawQuote.prev_close_price || 0),
      provider: rawQuote.provider_id || 'TradingView',
      type: rawQuote.type || 'market',
      currency: rawQuote.currency_code || 'USD',
      updatedAt: Date.now(),
    };

    tvQuoteCache.set(tvSymbol, { quote, timestamp: now });

    return res.json({
      success: true,
      source: 'TradingView Free Scraper (Live Quote)',
      quote,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    console.warn('[TradingView /api/tv/quote error]:', errMsg);
    return res.status(500).json({ success: false, error: errMsg });
  }
});

/**
 * GET /api/tv/search?q=XAU
 * Free market search across global TradingView symbols
 */
app.get('/api/tv/search', async (req: Request, res: Response) => {
  try {
    const query = String(req.query.q || req.query.query || 'GOLD');
    const results = await withTimeout(searchMarkets(query), 5000);
    return res.json({
      success: true,
      source: 'TradingView Market Search',
      results: results || [],
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    console.warn('[TradingView /api/tv/search error]:', errMsg);
    return res.status(500).json({ success: false, error: errMsg });
  }
});

/**
 * GET /api/tv/ta?symbol=FX:EURUSD
 * Technical analysis ratings scraped from TradingView
 */
app.get('/api/tv/ta', async (req: Request, res: Response) => {
  try {
    const rawSymbol = String(req.query.symbol || 'BTCUSDT');
    const tvSymbol = resolveTradingViewSymbol(rawSymbol);

    const cached = tvTaCache.get(tvSymbol);
    const now = Date.now();

    if (cached && now - cached.timestamp < 30000) {
      return res.json({
        success: true,
        source: 'TradingView Technical Analysis (Cached)',
        ta: cached.ta,
      });
    }

    const ta = await withTimeout(getTechnicalAnalysis(tvSymbol), 6000);
    tvTaCache.set(tvSymbol, { ta, timestamp: now });

    return res.json({
      success: true,
      source: 'TradingView Technical Analysis (Live)',
      ta,
    });
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'Unknown error';
    console.warn('[TradingView /api/tv/ta error]:', errMsg);
    return res.status(500).json({ success: false, error: errMsg });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AstraView TradePulse Pro server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
