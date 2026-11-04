export interface MacroAssetImpact {
  asset: string;
  symbol: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  expectedMove: string;
  rationale: string;
}

export interface MacroCalculationResult {
  surprise: number;
  score: number;
  interpretation: string;
  sentimentRating: 'EXTREME_HAWKISH' | 'HAWKISH' | 'NEUTRAL' | 'DOVISH' | 'EXTREME_DOVISH';
  momentumDelta: number;
  assetImpacts: MacroAssetImpact[];
  transmissionSummary: string;
}

export interface MacroFormulaItem {
  key: string;
  name: string;
  title: string;
  formula: string;
  description: string;
  variables: { symbol: string; meaning: string }[];
  marketImpact: string;
  calculate: (actual: number, forecast: number, previous?: number) => MacroCalculationResult;
}

export const MACRO_FORMULAS: Record<string, MacroFormulaItem> = {
  cpi: {
    key: 'cpi',
    name: 'CPI',
    title: 'Consumer Price Index (Indeks Harga Konsumen)',
    formula: 'CPI_YoY = ((CPI_t - CPI_{t-12}) / CPI_{t-12}) * 100%',
    description: 'Mengukur perubahan rata-rata harga dari keranjang barang dan jasa konsumen. Tolok ukur utama inflasi yang menentukan arah suku bunga Fed Funds Rate (FFR) dan yield obligasi.',
    variables: [
      { symbol: 'CPI_t', meaning: 'Indeks CPI bulan berjalan' },
      { symbol: 'CPI_{t-12}', meaning: 'Indeks CPI 12 bulan lalu (YoY)' },
      { symbol: 'Surprise', meaning: '((Actual - Forecast) / |Forecast|) * 100%' },
      { symbol: 'Momentum', meaning: 'Actual - Previous (Akselerasi MoM/YoY)' },
    ],
    marketImpact: 'Jika Actual > Forecast (Inflasi tinggi): The Fed Hawkish -> Yield & DXY Menguat, Emas & Saham Pertumbuhan Terkoreksi.',
    calculate: (actual, forecast, previous = forecast) => {
      const surprise = ((actual - forecast) / Math.abs(forecast || 1)) * 100;
      const momentumDelta = Number((actual - previous).toFixed(2));
      const isHawkish = surprise > 0;
      const score = isHawkish ? 1.5 : surprise < 0 ? -1.5 : 0;
      
      const sentimentRating = surprise >= 5 ? 'EXTREME_HAWKISH' :
        surprise > 0 ? 'HAWKISH' :
        surprise <= -5 ? 'EXTREME_DOVISH' :
        surprise < 0 ? 'DOVISH' : 'NEUTRAL';

      const assetImpacts: MacroAssetImpact[] = [
        {
          asset: 'Emas Spot (XAUUSD)',
          symbol: 'XAUUSD',
          direction: isHawkish ? 'BEARISH' : 'BULLISH',
          expectedMove: isHawkish ? '-1.2% s/d -2.5%' : '+1.5% s/d +3.0%',
          rationale: isHawkish
            ? 'Kenaikan inflasi memicu ekspektasi suku bunga tinggi lebih lama (Higher-for-longer), menaikkan Real Yields US 10Y dan menekan daya tarik aset tanpa imbal hasil seperti emas.'
            : 'Inflasi mendingin menurunkan tekanan yield US Treasuries dan melemahkan USD, memicu reli safe haven pada emas.'
        },
        {
          asset: 'US Dollar Index',
          symbol: 'DXY',
          direction: isHawkish ? 'BULLISH' : 'BEARISH',
          expectedMove: isHawkish ? '+0.6% s/d +1.2%' : '-0.7% s/d -1.4%',
          rationale: isHawkish
            ? 'Peluang penundaan pemotongan suku bunga memikat arus modal masuk (carry trade) ke aset berdenominasi USD.'
            : 'Pasar memprice-in pemangkasan suku bunga acuan Fed, menekan indeks dolar.'
        },
        {
          asset: 'Euro vs US Dollar',
          symbol: 'EURUSD',
          direction: isHawkish ? 'BEARISH' : 'BULLISH',
          expectedMove: isHawkish ? '-40 s/d -80 pips' : '+50 s/d +95 pips',
          rationale: isHawkish
            ? 'Pelebaran diferensial suku bunga antara Fed dan ECB menekan nilai tukar mata uang tunggal Eropa.'
            : 'Pelemahan greenback memberi ruang apresiasi bagi pasangan mata uang major.'
        },
        {
          asset: 'Bitcoin & Kripto',
          symbol: 'BTCUSDT',
          direction: isHawkish ? 'BEARISH' : 'BULLISH',
          expectedMove: isHawkish ? '-2.5% s/d -4.0%' : '+3.0% s/d +6.5%',
          rationale: isHawkish
            ? 'Kondisi likuiditas makro mengetat; aset beta tinggi berisiko mengalami deleveraging.'
            : 'Likuiditas longgar memicu gelombang risk-on masuk ke aset kripto.'
        }
      ];

      return {
        surprise,
        score,
        momentumDelta,
        sentimentRating,
        assetImpacts,
        interpretation: isHawkish
          ? 'Hawkish / Inflasi Lebih Tinggi dari Perkiraan (Tekanan Suku Bunga Naik)'
          : surprise < 0
          ? 'Dovish / Inflasi Jinak (Membuka Ruang Pelonggaran Kebijakan Moneter)'
          : 'Netral / Inflasi Sesuai Konsensus Pasar',
        transmissionSummary: `Transmisi Moneter: Inflasi tercatat ${actual}% vs konsensus ${forecast}% (Deviasi: ${surprise > 0 ? '+' : ''}${surprise.toFixed(2)}%). Mengubah ekspektasi kurva imbal hasil Fed Funds futures.`
      };
    }
  },
  ppi: {
    key: 'ppi',
    name: 'PPI',
    title: 'Producer Price Index (Indeks Harga Produsen)',
    formula: 'Pipeline_PassThrough = alpha + beta * (PPI_YoY) + epsilon',
    description: 'Mengukur perubahan harga di tingkat produsen grosir sebelum sampai ke konsumen akhir. Menjadi indikator leading primer bagi inflasi CPI 1-3 bulan ke depan.',
    variables: [
      { symbol: 'PPI_YoY', meaning: 'Pertumbuhan harga produsen tahunan' },
      { symbol: 'beta', meaning: 'Koefisien transmisi biaya ke konsumen (~0.65)' },
      { symbol: 'Margin_Squeeze', meaning: 'CPI_YoY - PPI_YoY (Kompresi Margin Laba Korporat jika negatif)' },
      { symbol: 'Surprise', meaning: '((Actual - Forecast) / |Forecast|) * 100%' }
    ],
    marketImpact: 'PPI tinggi menandakan tekanan margin korporasi dan sinyal bahwa kenaikan biaya input akan segera diteruskan ke CPI konsumen.',
    calculate: (actual, forecast, previous = forecast) => {
      const surprise = ((actual - forecast) / Math.abs(forecast || 1)) * 100;
      const momentumDelta = Number((actual - previous).toFixed(2));
      const isUp = surprise > 0;
      const score = isUp ? 1.2 : -1.2;

      const assetImpacts: MacroAssetImpact[] = [
        {
          asset: 'US Dollar Index',
          symbol: 'DXY',
          direction: isUp ? 'BULLISH' : 'BEARISH',
          expectedMove: isUp ? '+0.4% s/d +0.8%' : '-0.5% s/d -0.9%',
          rationale: isUp ? 'Sinyal tekanan inflasi hulu mendorong yield obligasi naik.' : 'Biaya grosir melandai mengurangi beban inflasi.'
        },
        {
          asset: 'Emas Spot',
          symbol: 'XAUUSD',
          direction: isUp ? 'BEARISH' : 'BULLISH',
          expectedMove: isUp ? '-0.8% s/d -1.5%' : '+1.0% s/d +2.0%',
          rationale: isUp ? 'Kenaikan ekspektasi biaya suku bunga menahan laju emas.' : 'Peredaan biaya produsen mendukung penguatan emas.'
        }
      ];

      return {
        surprise,
        score,
        momentumDelta,
        sentimentRating: isUp ? 'HAWKISH' : 'DOVISH',
        assetImpacts,
        interpretation: isUp
          ? 'Tekanan Biaya Produsen Meningkat (Kenaikan Harga Lanjutan Menuju CPI)'
          : 'Biaya Produsen Stabil / Terkendali (Dekompresi Tekanan Inflasi Pabrik)',
        transmissionSummary: `Pass-Through Produsen: Rilis PPI ${actual}% vs konsensus ${forecast}%. Estimasi transmisi biaya ke indeks harga konsumen berada pada koefisien ~0.65.`
      };
    }
  },
  nfp: {
    key: 'nfp',
    name: 'NFP',
    title: 'Non-Farm Payrolls (Ketenagakerjaan Non-Pertanian AS)',
    formula: 'NFP_Surprise = Actual_Jobs (k) - Forecast_Jobs (k)',
    description: 'Jumlah pekerja bergaji baru di AS di luar sektor agrikultur. Merupakan indikator kesehatan ketenagakerjaan dan daya beli domestik terpenting bagi mandat ganda The Fed.',
    variables: [
      { symbol: 'Actual_Jobs', meaning: 'Jumlah penambahan tenaga kerja baru (ribuan / k)' },
      { symbol: 'Forecast_Jobs', meaning: 'Perkiraan konsensus ekonom Wall Street (k)' },
      { symbol: 'Sahm_Rule', meaning: '3M MA Unemployment - 13M Low >= 0.5% (Ambang batas resesi)' },
    ],
    marketImpact: 'NFP Kuat (> Forecast) -> USD Menguat, Yield Naik, Emas Tertekan. NFP Lemah (< Forecast) -> Ekspektasi Rate Cut Melesat, Emas & Obligasi Reli.',
    calculate: (actual, forecast, previous = forecast) => {
      const surprise = actual - forecast;
      const momentumDelta = Number((actual - previous).toFixed(1));
      const isStrong = surprise > 0;
      const score = isStrong ? 1.4 : -1.4;

      const assetImpacts: MacroAssetImpact[] = [
        {
          asset: 'Emas Spot (XAUUSD)',
          symbol: 'XAUUSD',
          direction: isStrong ? 'BEARISH' : 'BULLISH',
          expectedMove: isStrong ? '-1.5% s/d -3.0%' : '+1.8% s/d +3.5%',
          rationale: isStrong
            ? 'Pertumbuhan pekerjaan yang kuat menurunkan urgensi The Fed memangkas suku bunga acuan, menekan emas secara tajam.'
            : 'Data payrolls yang meleset jauh dari konsensus memicu spekulasi resesi dan pemangkasan darurat suku bunga, mengalirkan dana ke emas.'
        },
        {
          asset: 'US Dollar (USDJPY)',
          symbol: 'USDJPY',
          direction: isStrong ? 'BULLISH' : 'BEARISH',
          expectedMove: isStrong ? '+70 s/d +140 pips' : '-80 s/d -160 pips',
          rationale: isStrong
            ? 'Diferensial imbal hasil US-Japan melebar seiring lonjakan yield 2-tahun AS.'
            : 'Penurunan yield US 2Y memicu likuidasi posisi carry trade dan penguatan Yen.'
        },
        {
          asset: 'S&P 500 / Nasdaq',
          symbol: 'SPX500',
          direction: isStrong ? 'BULLISH' : 'BEARISH',
          expectedMove: isStrong ? '+0.8% s/d +1.5%' : '-1.2% s/d -2.2%',
          rationale: isStrong
            ? 'Ekonomi AS terbukti resilien (Soft/No Landing narrative) menopang estimasi laba korporat (EPS).'
            : 'Data tenaga kerja rapuh memicu ketakutan perlambatan ekonomi dan resesi tajam.'
        }
      ];

      return {
        surprise,
        score,
        momentumDelta,
        sentimentRating: isStrong ? 'HAWKISH' : 'DOVISH',
        assetImpacts,
        interpretation: isStrong
          ? 'Pasar Tenaga Kerja Ketat (Ekonomi Solid / Tekanan Upah Hawkish)'
          : 'Pasar Tenaga Kerja Mendingin (Peluang Pemangkasan Suku Bunga Terbuka)',
        transmissionSummary: `Ketenagakerjaan: Penambahan pekerjaan tercatat ${actual}k vs konsensus ${forecast}k (Surprise: ${surprise > 0 ? '+' : ''}${surprise}k tenaga kerja).`
      };
    }
  },
  fomc: {
    key: 'fomc',
    name: 'FOMC',
    title: 'FOMC Rate Decision (Keputusan Suku Bunga The Fed)',
    formula: 'Implied_Probability = (Current_Rate - Effective_Rate) / Step_Size',
    description: 'Keputusan tingkat suku bunga acuan (Fed Funds Target Rate) oleh dewan gubernur The Fed. Ditentukan berdasarkan proyeksi inflasi 2% dan penyerapan tenaga kerja maksimal.',
    variables: [
      { symbol: 'FFR', meaning: 'Federal Funds Target Rate Range (%)' },
      { symbol: 'Step_Size', meaning: 'Perubahan standar suku bunga (25 bps / 0.25%)' },
      { symbol: 'Dot_Plot', meaning: 'Median proyeksi suku bunga jangka panjang dewan FOMC' },
    ],
    marketImpact: 'Kenaikan suku bunga / Sikap Hawkish -> DXY Melonjak, Yield Melejit, Crypto & Aset Berisiko Turun. Pemotongan suku bunga -> Likuiditas Ekspansif.',
    calculate: (actual, forecast, previous = forecast) => {
      const surprise = (actual - forecast) * 100; // basis points
      const momentumDelta = Number(((actual - previous) * 100).toFixed(0));
      const isHawkish = surprise > 0;
      const score = isHawkish ? 2.0 : -2.0;

      const assetImpacts: MacroAssetImpact[] = [
        {
          asset: 'Emas Spot (XAUUSD)',
          symbol: 'XAUUSD',
          direction: isHawkish ? 'BEARISH' : 'BULLISH',
          expectedMove: isHawkish ? '-2.0% s/d -4.0%' : '+2.5% s/d +5.0%',
          rationale: isHawkish
            ? 'Biaya kesempatan (opportunity cost) memegang emas batangan melonjak tajam seiring suku bunga tinggi.'
            : 'Pemotongan suku bunga acuan melemahkan imbal hasil obligasi kas dan memicu reli institusional pada emas fisik.'
        },
        {
          asset: 'Bitcoin (BTCUSDT)',
          symbol: 'BTCUSDT',
          direction: isHawkish ? 'BEARISH' : 'BULLISH',
          expectedMove: isHawkish ? '-4.0% s/d -7.5%' : '+5.0% s/d +10.0%',
          rationale: isHawkish
            ? 'Pengetatan moneter mengeringkan likuiditas M2 global yang sangat sensitif bagi valuasi crypto.'
            : 'Injeksi likuiditas dan pelemahan suku bunga bank sentral menjadi katalis bull run aset kripto.'
        }
      ];

      return {
        surprise,
        score,
        momentumDelta,
        sentimentRating: isHawkish ? 'EXTREME_HAWKISH' : 'EXTREME_DOVISH',
        assetImpacts,
        interpretation: isHawkish
          ? 'Sikap Kebijakan Lebih Hawkish dari Konsensus Pasar (Suku Bunga Dipertahankan Tinggi)'
          : 'Sikap Kebijakan Dovish (Pelonggaran Moneter / Rate Cut Siklikal)',
        transmissionSummary: `Keputusan Moneter Fed: Suku bunga acuan ${actual.toFixed(2)}% vs proyeksi ${forecast.toFixed(2)}% (Deviasi: ${surprise > 0 ? '+' : ''}${surprise.toFixed(0)} bps).`
      };
    }
  },
  yield: {
    key: 'yield',
    name: 'Yield',
    title: 'US Treasury Yield Curve (Kurva Imbal Hasil Obligasi AS 10Y & 2Y)',
    formula: 'Yield_Spread = Yield_10Y - Yield_2Y (Inversi jika < 0)',
    description: 'Selisih antara yield obligasi jangka panjang 10 tahun dan jangka pendek 2 tahun. Inversi kurva merupakan indikator historis paling andal dalam memprediksi resesi ekonomi AS.',
    variables: [
      { symbol: 'Yield_10Y', meaning: 'Imbal hasil obligasi AS tenor 10 Tahun (Benchmark suku bunga jangka panjang)' },
      { symbol: 'Yield_2Y', meaning: 'Imbal hasil obligasi AS tenor 2 Tahun (Sensitif terhadap kebijakan Fed)' },
      { symbol: 'Spread', meaning: 'Selisih 10Y - 2Y (Negatif = Kurva Terinversi)' },
      { symbol: 'Real_Yield', meaning: 'Yield 10Y Nominal dikurangi Ekspektasi Inflasi Breakeven' }
    ],
    marketImpact: 'Lonjakan Yield 10Y menaikkan biaya modal korporasi dan menekan rasio valuasi saham tech P/E tinggi.',
    calculate: (actual, forecast, previous = forecast) => {
      const surprise = ((actual - forecast) / Math.abs(forecast || 1)) * 100;
      const momentumDelta = Number((actual - previous).toFixed(2));
      const isYieldRising = surprise > 0;
      const score = isYieldRising ? 1.3 : -1.3;

      const assetImpacts: MacroAssetImpact[] = [
        {
          asset: 'Saham Teknologi / Growth (NAS100)',
          symbol: 'NAS100',
          direction: isYieldRising ? 'BEARISH' : 'BULLISH',
          expectedMove: isYieldRising ? '-1.0% s/d -2.0%' : '+1.2% s/d +2.5%',
          rationale: isYieldRising
            ? 'Discount rate dalam rumus DCF meningkat tajam, menekan present value arus kas masa depan saham teknologi.'
            : 'Penurunan cost of capital melonggarkan valuasi saham pertumbuhan.'
        },
        {
          asset: 'Emas Spot (XAUUSD)',
          symbol: 'XAUUSD',
          direction: isYieldRising ? 'BEARISH' : 'BULLISH',
          expectedMove: isYieldRising ? '-1.0% s/d -2.2%' : '+1.2% s/d +2.8%',
          rationale: isYieldRising
            ? 'Real yield obligasi pemerintah yang menarik memindahkan alokasi manajer investasi dari emas ke obligasi bebas risiko (risk-free Treasury).'
            : 'Real yield yang turun mendorong pembelian lindung nilai pada emas.'
        }
      ];

      return {
        surprise,
        score,
        momentumDelta,
        sentimentRating: isYieldRising ? 'HAWKISH' : 'DOVISH',
        assetImpacts,
        interpretation: isYieldRising
          ? 'Yield Menguat (Cost of Capital Naik, Valuasi Aset Terdiskon)'
          : 'Yield Melandai (Kondisi Keuangan Melonggar, Multiples Valuasi Membaik)',
        transmissionSummary: `Obligasi Pemerintah AS: Yield saat ini ${actual.toFixed(2)}% vs acuan ${forecast.toFixed(2)}% (Delta: ${surprise > 0 ? '+' : ''}${surprise.toFixed(2)}%).`
      };
    }
  },
  gdp: {
    key: 'gdp',
    name: 'GDP',
    title: 'Gross Domestic Product (Pertumbuhan Produk Domestik Bruto)',
    formula: 'GDP_Annualized = ((GDP_t / GDP_{t-1})^4 - 1) * 100%',
    description: 'Total nilai moneter seluruh barang dan jasa akhir yang diproduksi suatu negara. Ukuran terlengkap output ekonomi nasional dan siklus ekspansi/kontraksi.',
    variables: [
      { symbol: 'GDP_t', meaning: 'Nilai PDB riil kuartal berjalan' },
      { symbol: 'GDP_{t-1}', meaning: 'Nilai PDB riil kuartal sebelumnya' },
      { symbol: 'Surprise', meaning: '((Actual - Forecast) / |Forecast|) * 100%' },
    ],
    marketImpact: 'GDP Kuat -> Sentimen Risk-On, Penguatan Mata Uang Domestik, Laba Korporasi Solid. GDP Negatif 2 Kuartal -> Definisi Teknis Resesi.',
    calculate: (actual, forecast, previous = forecast) => {
      const surprise = ((actual - forecast) / Math.abs(forecast || 1)) * 100;
      const momentumDelta = Number((actual - previous).toFixed(2));
      const isStrong = surprise > 0;
      const score = isStrong ? 1.5 : -1.5;

      const assetImpacts: MacroAssetImpact[] = [
        {
          asset: 'Ekuitas Global (SPX500, IDX)',
          symbol: 'SPX500',
          direction: isStrong ? 'BULLISH' : 'BEARISH',
          expectedMove: isStrong ? '+1.0% s/d +2.0%' : '-1.5% s/d -3.0%',
          rationale: isStrong
            ? 'Ekspansi ekonomi menopang pertumbuhan pendapatan dan laba bersih emiten korporat.'
            : 'Perlambatan pertumbuhan memangkas proyeksi margin keuntungan dan arus kas.'
        },
        {
          asset: 'US Dollar (DXY)',
          symbol: 'DXY',
          direction: isStrong ? 'BULLISH' : 'BEARISH',
          expectedMove: isStrong ? '+0.5% s/d +1.0%' : '-0.6% s/d -1.2%',
          rationale: isStrong
            ? 'Kekuatan ekonomi relatif AS (US Exceptionalism) menarik modal portofolio global.'
            : 'Penurunan output memicu aliran keluar modal dan pelonggaran likuiditas.'
        }
      ];

      return {
        surprise,
        score,
        momentumDelta,
        sentimentRating: isStrong ? 'HAWKISH' : 'DOVISH',
        assetImpacts,
        interpretation: isStrong
          ? 'Ekspansi Ekonomi Solid (Aktivitas Bisnis Berkelanjutan)'
          : 'Perlambatan Pertumbuhan Ekonomi (Peringatan Kontraksi / Resesi)',
        transmissionSummary: `Pertumbuhan Ekonomi: GDP kuartalan tercatat ${actual.toFixed(1)}% vs konsensus ${forecast.toFixed(1)}% (Deviasi: ${surprise > 0 ? '+' : ''}${surprise.toFixed(2)}%).`
      };
    }
  }
};
