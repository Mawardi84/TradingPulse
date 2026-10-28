# AstraView TradePulse Pro (v1.0.0)

> Terminal Analisis Multi-Aset, Kuantiatif Makro & Engine Sinyal Smart Money Concepts (SMC) Tingkat Institusional.

![TradePulse Pro Status](https://img.shields.io/badge/Status-Production--Ready-emerald?style=flat-span)
![Node Version](https://img.shields.io/badge/Node.js-v20%2B-blue?style=flat-span)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-span)

---

## 🌟 Overview & Capabilities

**AstraView TradePulse Pro** adalah platform analisis keuangan kuantitatif dan eksekusi sinyal multi-aset yang dirancang untuk trader profesional, quant analyst, dan investor institusional.

### 📈 Fitur Utama Architecture & Engine
1. **TradingView Chart Engine Live**:
   - Integrasi data live feed Binance Spot WebSocket & Interbank Liquidity Ticks.
   - Indikator otomatis **Supply & Demand Zones**, **Order Blocks (OB)**, **Fair Value Gap (FVG)**, **Pivot Points (Klasik)**, **Moving Averages (EMA 20/50/200)**, dan **RSI (14)**.
   - **Manual S&D Zone Drawer**: Pengguna dapat menggambar dan menyimpan zona kustom sendiri yang secara otomatis ditumpuk (*layered*) di atas indikator otomatis.

2. **AstraBot Quant Analysist**:
   - Asisten AI Senior Quantitative Analyst berstandar riset desk institusional.
   - Analisis berbasis **Smart Money Concepts (SMC)**, **Multi-Timeframe (MTF)**, **Kalkulasi Makro (CPI, NFP, FOMC, Yield Spread)**, dan **Sentimen Fear & Greed**.
   - Bebas mock data — grounded pada feed data pasar nyata dan formula kuantitatif.

3. **Multi-Asset & Macro Terminal**:
   - **Crypto**: BTC/USDT, ETH/USDT, SOL/USDT, BNB/USDT, ADA/USDT, DOGE/USDT (Binance WS).
   - **Forex**: Major, Minor & Exotic pairs (EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/IDR).
   - **Komoditas & Logam**: Gold Spot (XAU/USD via PAXG), Silver (XAG/USD), Brent Oil (USOIL), Copper.
   - **Saham AS & IDX**: NVDA, AAPL, TSLA, MSFT, AMZN, BBCA, BBRI, BMRI, TLKM.

4. **Kuantitatif Makro & Kalender Ekonomi**:
   - Pemodelan kejutan makro (*macro surprise score*) untuk CPI, PPI, NFP, FOMC Rate Decision, dan Yield Curve Spread.
   - Real-time Fear & Greed Index dari Alternative.me API.

---

## 🛠️ Quick Start & Instalasi

### Prasyarat
- Node.js `>= 20.0.0`
- npm `>= 9.0.0`

### Langkah Instalasi

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

3. **Jalankan Unit Test Suite**:
   ```bash
   npm test
   ```

4. **Verifikasi Type Checking**:
   ```bash
   npx tsc --noEmit
   ```

5. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 🧪 Struktur Pengujian & Test Suite

Proyek ini dilengkapi dengan unit test suite komprehensif menggunakan runner bawaan Node.js (`node:test` + `tsx`):

- `test/indicators.test.ts`: Pengujian dekutikasi indikator S&D, filter clutter, dan de-overlapping.
- `test/macroFormulas.test.ts`: Evaluasi akurasi formula kejutan CPI, NFP, FOMC, dan Yield Spread.
- `test/realTimeFeed.test.ts`: Verifikasi websocket subscriber, 10s TTL caching Binance REST, dan fallback rates.
- `test/supplyDemand.test.ts`: Pengujian Fair Value Gaps (FVG), Order Blocks, dan Pivot Points.

---

## 📄 Lisensi

Platform ini dirilis di bawah lisensi [MIT License](LICENSE).
