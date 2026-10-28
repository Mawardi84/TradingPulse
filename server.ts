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
