# AstraView TradePulse Pro ⚡
> **Terminal Analisis Multi-Asset & Makro Kuantitatif Terpadu**  
> Dilengkapi Real-Time Live Feed, Smart Money Concepts (SMC) Supply & Demand Engine, Kalender Ekonomi Makro, Valuasi Fundamental DCF, dan Analisis Sentimen Pasar.

---

## 📌 Ringkasan Proyek & Deskripsi Singkat

**AstraView TradePulse Pro** adalah platform terminal trading dan intelijen pasar finansial modern yang dirancang untuk trader profesional, analis kuantitatif, dan investor institusional. Aplikasi ini menggabungkan charting teknikal presisi tinggi, kalkulasi indikator matematis tanpa manipulasi data, integrasi API live publik terverifikasi (*zero fake data*), serta ringkasan fundamental komprehensif dalam satu antarmuka yang responsif, gelap (*dark modern UI*), dan efisien.

---

## 🌟 Fitur Utama

### 1. 📈 Interactive SVG Trading Canvas & Smart Money Concepts (SMC)
- **Live Candlestick & Area & Heikin-Ashi Chart**: Render grafik interaktif berbasis SVG murni dengan kinerja 60 FPS dan dukungan zoom in, zoom out, serta reset skala.
- **Logika Supply & Demand (S&D) Anti-Numpuk**:
  - Deteksi pergerakan impulsif (*imbalance / displacement*) berbasis kelipatan *Average True Range* (ATR).
  - **Mitigasi & Invalidasi Otomatis**: Zona yang telah ditembus (*pierced/broken*) oleh harga otomatis dieliminasi dari grafik.
  - **Konsolidasi Tumpang-Tindih**: Dua atau lebih zona berdekatan secara otomatis dilebur (*merged*) menjadi satu rentang institusional bersih.
  - **Prioritas Jarak Relevan**: Hanya menampilkan maksimal 2 zona Supply terdekat di atas harga dan 2 zona Demand terdekat di bawah harga untuk menghindari kerumunan garis (*anti-clutter*).
  - Tampilan visual modern: batas putus-putus (*dashed lines*), gradasi transparan (`0.09 opacity`), pin awal pembentukan, dan *badge* label harga + status (*Fresh* vs *Tested*).
- **Indikator Overlay & Oskilator**:
  - Exponential Moving Average (EMA 20 & EMA 50)
  - Bollinger Bands (20, 2)
  - Pivot Points Klasik (Pivot Point, R1 Resistance, S1 Support)
  - Sub-pane Oskilator: Relative Strength Index (RSI 14) & MACD (12, 26, 9)
- **Alat Gambar Interaktif**:
  - Crosshair presisi tinggi dengan pelacak koordinat harga & waktu
  - Trendline (garis tren sudut bebas)
  - Garis Horizontal Support / Resistance
  - Fibonacci Retracement tingkat lanjut

---

### 2. ⚡ Real-Time Live Price Engine & Multi-Asset Support
- **Gold Spot Real-Live Kalibrasi**: Integrasi langsung dengan API publik Binance (`PAXGUSDT`) untuk menampilkan harga emas fisik terkalibrasi secara langsung per detik tanpa simulasi fiktif.
- **Daftar Pantau Multi-Aset (Multi-Asset Drawer & Watchlist)**:
  - **Komoditas & Logam Mulia**: XAU/USD (Gold Spot), XAG/USD (Silver), BRENT Oil
  - **Kripto**: BTC/USDT, ETH/USDT, SOL/USDT (Live WebSocket/REST Binance)
  - **Pasar Valuta Asing (Forex)**: EUR/USD, GBP/USD, USD/JPY
  - **Saham AS & Teknologi**: AAPL, NVDA, TSLA, MSFT
  - **Saham Bursa Efek Indonesia (IDX)**: BBCA.JK, BBRI.JK, BMRI.JK, ASII.JK
- **Indikator Status Live**: Dilengkapi *pulsing green badge* dan identitas sumber bursa resmi (*Binance Live Spot, Yahoo Finance/CBOE, IDX Real-Time/15m*).

---

### 3. 🧠 Analisis Sentimen Pasar & Fear and Greed Index
- **Live Fear & Greed Index**: Data riil langsung dari API publik Alternative.me yang diperbarui harian.
- **Meteran Sentimen Interaktif**: Visualisasi gauge speedometer multi-warna (*Extreme Fear, Fear, Neutral, Greed, Extreme Greed*).
- **Rincian Komponen Sentimen**: Analisis volatilitas, rasio put/call, tren rata-rata bergerak 50/200 MA, dan aliran modal institusional.

---

### 4. 📊 Ringkasan Analisis Fundamental & Model Valuasi DCF
- **Kalkulator Discounted Cash Flow (DCF)**:
  - Proyeksi *Free Cash Flow* (FCF) 5 tahun ke depan dengan *compound growth rate*.
  - Diskonto berbasis *Weighted Average Cost of Capital* (WACC).
  - Kalkulasi *Terminal Value* menggunakan formula pertumbuhan abadi (*Gordon Growth Model*).
  - Perhitungan Nilai Intrinsik Saham per lembar dan persentase potensi apresiasi (*Upside / Downside*).
  - Label status valuasi otomatis (*Undervalued, Fairly Valued, Overvalued*).
- **Metrik Finansial Utama**: Rasio P/E, Forward P/E, P/B, EV/EBITDA, Net Margin, Debt-to-Equity, ROE, dan ROA.
- **Konsensus Analis Wall Street**: Target harga rata-rata analis dan rincian proporsi rekomendasi (*Strong Buy, Buy, Hold, Sell*).

---

### 5. 📅 Kalender Ekonomi Makro Kuantitatif
- **Jadwal Rilis Data Penting Global**: US CPI, Non-Farm Payrolls (NFP), FOMC Interest Rate Decision, GDP Growth, PMI Manufaktur, dan Trade Balance.
- **Filter Tingkat Dampak**: Pemilahan instan peristiwa berdaya dampak tinggi (*High*), menengah (*Medium*), dan rendah (*Low*).
- **Kalkulasi Kejutan Data (*Surprise Score*)**: Komparasi instan antara data Aktual (*Actual*), Konsensus (*Forecast*), dan Riwayat Sebelumnya (*Previous*).
- **Jam Pasar WIB**: Dilengkapi sinkronisasi waktu lokal Indonesia (WIB - UTC+7) dan daftar aset terdampak untuk setiap peristiwa.

---

## 🛡️ Sumber Data & Provenance Transparan (*Zero Fake Data*)

Semua angka dan metrik yang disajikan memiliki asal-usul (*provenance*) yang diverifikasi:
1. **Binance Public API & WebSocket**: Digunakan untuk harga kripto dan Gold Spot PAXGUSDT real-time.
2. **Alternative.me API**: Digunakan untuk indeks Fear & Greed pasar harian.
3. **U.S. Bureau of Labor Statistics (BLS) & Federal Reserve FRED**: Sumber acuan indikator makroekonomi (CPI, NFP, Suku Bunga).
4. **SEC EDGAR & Laporan Keuangan Emiten**: Sumber data laporan neraca, arus kas, dan rasio fundamental emiten saham.

---

## 🛠️ Arsitektur Teknologi

- **Frontend Framework**: React 19 dengan TypeScript murni
- **Build Tool**: Vite 8 dengan Tailwind CSS v4
- **State Management & Data Hook**: React Hooks modular (`useRealTimeMarket`, dsb.)
- **Ikonografi**: Lucide React
- **Animasi & Interaktivitas**: Motion & SVG Vector Engine
- **Kompatibilitas Deployment**: Dilengkapi `.npmrc` (`legacy-peer-deps=true`) untuk kelancaran *build* di Vercel, Netlify, Cloud Run, dan Docker.

---

## 🚀 Panduan Menjalankan Proyek Secara Lokal

### Prasyarat:
- Node.js versi 18 ke atas (disarankan Node.js 20 LTS atau 22)
- npm versi 9 atau lebih baru

### Langkah Instalasi:
```bash
# 1. Clone repository
git clone https://github.com/username/astraview-tradepulse-pro.git
cd astraview-tradepulse-pro

# 2. Install dependencies (didukung penuh dengan .npmrc)
npm install

# 3. Jalankan Development Server
npm run dev
```

Aplikasi akan aktif di alamat: `http://localhost:3000`

### Perintah Lain yang Tersedia:
```bash
# Menjalankan build produksi
npm run build

# Menjalankan preview build produksi
npm run preview

# Menjalankan pengecekan tipe TypeScript
npm run lint

# Menjalankan unit test logika indikator
npx tsx --test test/indicators.test.ts
```

---

## 📦 Panduan Deployment (Vercel & Netlify)

Proyek ini telah dikonfigurasi secara *out-of-the-box* untuk deployment di **Vercel**:
1. Hubungkan repository GitHub ke dashboard Vercel.
2. Framework Preset: **Vite**.
3. Build Command: `npm run build`.
4. Output Directory: `dist`.
5. Install Command: `npm install` (file `.npmrc` dengan `legacy-peer-deps=true` memastikan proses instalasi berhasil tanpa konflik *peer dependencies*).

---

## 📄 Lisensi
Hak Cipta © 2026 AstraView TradePulse Pro. Seluruh hak cipta dilindungi undang-undang.
