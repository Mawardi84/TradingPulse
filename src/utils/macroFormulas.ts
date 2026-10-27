export interface MacroFormulaItem {
  key: string;
  name: string;
  title: string;
  formula: string;
  description: string;
  variables: { symbol: string; meaning: string }[];
  marketImpact: string;
  calculate: (actual: number, forecast: number, previous: number) => {
    surprise: number;
    score: number;
    interpretation: string;
  };
}

export const MACRO_FORMULAS: Record<string, MacroFormulaItem> = {
  cpi: {
    key: 'cpi',
    name: 'CPI',
    title: 'Consumer Price Index (Indeks Harga Konsumen)',
    formula: 'CPI_YoY = ((CPI_t - CPI_{t-12}) / CPI_{t-12}) * 100%',
    description: 'Mengukur perubahan rata-rata harga dari keranjang barang dan jasa yang dikonsumsi rumah tangga dari waktu ke waktu. Menjadi tolok utama inflasi dan kebijakan suku bunga The Fed.',
    variables: [
      { symbol: 'CPI_t', meaning: 'Indeks CPI bulan berjalan' },
      { symbol: 'CPI_{t-12}', meaning: 'Indeks CPI 12 bulan lalu (YoY)' },
      { symbol: 'Surprise', meaning: '((Actual - Forecast) / |Forecast|) * 100%' }
    ],
    marketImpact: 'Jika Actual > Forecast (Inflasi tinggi): Hawkish Fed -> Yield Naik, USD Menguat, Emas/Saham Koreksi.',
    calculate: (actual, forecast, previous) => {
      const surprise = ((actual - forecast) / Math.abs(forecast || 1)) * 100;
      const score = surprise > 0 ? 1.5 : surprise < 0 ? -1.5 : 0;
      return {
        surprise,
        score,
        interpretation: surprise > 0 ? 'Hawkish / Inflasi Lebih Tinggi dari Perkiraan' : 'Dovish / Inflasi Jinak'
      };
    }
  },
  ppi: {
    key: 'ppi',
    name: 'PPI',
    title: 'Producer Price Index (Indeks Harga Produsen)',
    formula: 'Pipeline_PassThrough = alpha + beta * (PPI_YoY) + epsilon',
    description: 'Mengukur perubahan rata-rata harga jual yang diterima produsen domestik untuk output mereka. PPI adalah indikator leading bagi CPI karena biaya produsen yang naik akan diteruskan ke konsumen.',
    variables: [
      { symbol: 'PPI_YoY', meaning: 'Pertumbuhan harga produsen tahunan' },
      { symbol: 'beta', meaning: 'Koefisien transmisi biaya ke konsumen (~0.65)' },
      { symbol: 'Margin_Squeeze', meaning: 'CPI_YoY - PPI_YoY (Negatif = Kompresi Margin Laba Korporat)' }
    ],
    marketImpact: 'PPI tinggi menandakan tekanan inflasi lanjutan pada sektor manufaktur dan komoditas.',
    calculate: (actual, forecast) => {
      const surprise = ((actual - forecast) / Math.abs(forecast || 1)) * 100;
      return {
        surprise,
        score: surprise > 0 ? 1.2 : -1.2,
        interpretation: surprise > 0 ? 'Tekanan Biaya Produsen Meningkat (Kenaikan Harga Lanjutan)' : 'Biaya Produsen Stabil'
      };
    }
  },
  nfp: {
    key: 'nfp',
    name: 'NFP',
    title: 'Non-Farm Payrolls (Ketenagakerjaan Sektor Non-Pertanian AS)',
    formula: 'NFP_Surprise = Actual_Jobs (k) - Forecast_Jobs (k)',
    description: 'Mengukur jumlah pekerja bergaji di AS di luar sektor pertanian. Bersama tingkat pengangguran dan pertumbuhan upah rata-rata (Average Hourly Earnings), menjadi mandat ketenagakerjaan utama The Fed.',
    variables: [
      { symbol: 'Actual_Jobs', meaning: 'Jumlah penambahan tenaga kerja baru (ribuan)' },
      { symbol: 'Sahm_Rule', meaning: '3M MA Unemployment - 13M Low >= 0.5% (Indikator Resesi)' }
    ],
    marketImpact: 'NFP Kuat (> Forecast) -> USD & Yield Menguat, Emas Tertekan. NFP Lemah -> Potongan Suku Bunga (Rate Cut) Dipricing Market.',
    calculate: (actual, forecast) => {
      const surprise = actual - forecast;
      return {
        surprise,
        score: surprise > 0 ? 1.4 : -1.4,
        interpretation: surprise > 0 ? 'Pasar Tenaga Kerja Ketat (Ekonomi Solid)' : 'Pasar Tenaga Kerja Mendingin'
      };
    }
  },
  fomc: {
    key: 'fomc',
    name: 'FOMC',
    title: 'FOMC Rate Decision (Keputusan Suku Bunga & Dot Plot The Fed)',
    formula: 'Implied_Probability = (Current_Rate - Effective_Rate) / Step_Size',
    description: 'Keputusan suku bunga acuan Federal Reserve (FFR). Model kuantitatif menggunakan analisis Dot Plot proyeksi pejabat Fed dan probabilitas Fed Fund Futures untuk menghitung pergeseran suku bunga.',
    variables: [
      { symbol: 'FFR', meaning: 'Federal Funds Target Rate (%)' },
      { symbol: 'Dot_Plot', meaning: 'Median proyeksi suku bunga jangka panjang FOMC' }
    ],
    marketImpact: 'Kenaikan suku bunga / Hawkish Statement -> Penguatan DXY, Tekanan pada Crypto & Saham Growth.',
    calculate: (actual, forecast) => {
      const surprise = (actual - forecast) * 100; // basis points
      return {
        surprise,
        score: surprise > 0 ? 2.0 : -2.0,
        interpretation: surprise > 0 ? 'Sikap Kebijakan Lebih Hawkish dari Konsensus' : 'Sikap Kebijakan Dovish'
      };
    }
  },
  yield: {
    key: 'yield',
    name: 'Yield',
    title: 'US Treasury Yield Curve (Imbal Hasil Obligasi Pemerintah AS 10Y & 2Y)',
    formula: 'Yield_Spread = Yield_10Y - Yield_2Y (Inversi jika < 0)',
    description: 'Imbal hasil obligasi pemerintah AS. Kurva imbal hasil (Yield Curve) adalah prediktor resesi paling akurat ketika terjadi inversi (2Y > 10Y). Real Yield = Nominal Yield 10Y - Inflasi Breakeven.',
    variables: [
      { symbol: 'Spread', meaning: 'Selisih Yield 10 Tahun dan 2 Tahun' },
      { symbol: 'Real_Yield', meaning: 'Nominal Yield 10Y - Expected Inflation (Penting untuk Emas/USD)' }
    ],
    marketImpact: 'Yield Melonjak -> Valuasi Saham Tech & Emas Terkoreksi. Yield Turun -> Likuiditas Longgar.',
    calculate: (actual, forecast) => {
      const surprise = ((actual - forecast) / Math.abs(forecast || 1)) * 100;
      return {
        surprise,
        score: surprise > 0 ? 1.3 : -1.3,
        interpretation: surprise > 0 ? 'Yield Menguat (Cost of Capital Naik)' : 'Yield Melandai'
      };
    }
  }
};
