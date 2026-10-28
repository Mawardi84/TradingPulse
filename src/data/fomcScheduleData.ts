import { FomcMeeting } from '../types/market';

export interface FedWatchOption {
  targetRange: string;
  changeBps: number;
  label: string;
  probability: number;
  priorDayProb: number;
  priorWeekProb: number;
}

export interface FomcAssetReaction {
  symbol: string;
  name: string;
  dovishReaction: string;
  hawkishReaction: string;
  keyLevelToWatch: string;
}

export const CURRENT_FED_FUNDS_RATE = '4.75% - 5.00%';
export const NEXT_FOMC_DATE_TIMESTAMP = '2026-11-06T01:00:00+07:00';

export const FOMC_MEETINGS_2026: FomcMeeting[] = [
  {
    id: 'fomc-2026-01',
    meetingDates: '28 - 29 Januari 2026',
    decisionDateLabel: 'Kamis, 30 Jan 2026',
    decisionTimeWIB: '02:00 WIB',
    pressConferenceTimeWIB: '02:30 WIB',
    hasSEP: false,
    status: 'completed',
    rateBefore: '5.25% - 5.50%',
    rateAfterOrExpected: '5.25% - 5.50%',
    decisionOrExpectation: 'TETAP (Hold 5.50%)',
    fedWatchCutProb: 12.0,
    fedWatchHoldProb: 88.0,
    notes: 'The Fed mempertahankan suku bunga untuk memastikan momentum disinflasi tidak berbalik arah.',
    affectedAssets: ['XAUUSD', 'EURUSD', 'BTCUSDT', 'USDJPY'],
  },
  {
    id: 'fomc-2026-03',
    meetingDates: '18 - 19 Maret 2026',
    decisionDateLabel: 'Kamis, 20 Mar 2026',
    decisionTimeWIB: '01:00 WIB',
    pressConferenceTimeWIB: '01:30 WIB',
    hasSEP: true,
    status: 'completed',
    rateBefore: '5.25% - 5.50%',
    rateAfterOrExpected: '5.00% - 5.25%',
    decisionOrExpectation: 'CUT 25 bps (5.25%)',
    fedWatchCutProb: 91.5,
    fedWatchHoldProb: 8.5,
    notes: 'Pemangkasan suku bunga perdana 2026 dengan rilis Dot Plot yang memproyeksikan total cut 75 bps tahun 2026.',
    affectedAssets: ['XAUUSD', 'EURUSD', 'BTCUSDT', 'SPY'],
  },
  {
    id: 'fomc-2026-04',
    meetingDates: '29 - 30 April 2026',
    decisionDateLabel: 'Kamis, 1 Mei 2026',
    decisionTimeWIB: '01:00 WIB',
    pressConferenceTimeWIB: '01:30 WIB',
    hasSEP: false,
    status: 'completed',
    rateBefore: '5.00% - 5.25%',
    rateAfterOrExpected: '5.00% - 5.25%',
    decisionOrExpectation: 'TETAP (Hold 5.25%)',
    fedWatchCutProb: 24.2,
    fedWatchHoldProb: 75.8,
    notes: 'Jeda sementara sambil mengevaluasi transmisi pelonggaran Maret ke sektor perumahan dan kredit.',
    affectedAssets: ['USDJPY', 'EURUSD', 'NVDA'],
  },
  {
    id: 'fomc-2026-06',
    meetingDates: '17 - 18 Juni 2026',
    decisionDateLabel: 'Kamis, 19 Jun 2026',
    decisionTimeWIB: '01:00 WIB',
    pressConferenceTimeWIB: '01:30 WIB',
    hasSEP: true,
    status: 'completed',
    rateBefore: '5.00% - 5.25%',
    rateAfterOrExpected: '5.00% - 5.25%',
    decisionOrExpectation: 'TETAP (Hold 5.25%)',
    fedWatchCutProb: 38.0,
    fedWatchHoldProb: 62.0,
    notes: 'Dot Plot median mempertahankan proyeksi penurunan lanjutan di semester kedua menyusul pendinginan upah.',
    affectedAssets: ['XAUUSD', 'BTCUSDT', 'EURUSD'],
  },
  {
    id: 'fomc-2026-07',
    meetingDates: '29 - 30 Juli 2026',
    decisionDateLabel: 'Kamis, 31 Jul 2026',
    decisionTimeWIB: '01:00 WIB',
    pressConferenceTimeWIB: '01:30 WIB',
    hasSEP: false,
    status: 'completed',
    rateBefore: '5.00% - 5.25%',
    rateAfterOrExpected: '5.00% - 5.25%',
    decisionOrExpectation: 'TETAP (Hold 5.25%)',
    fedWatchCutProb: 44.5,
    fedWatchHoldProb: 55.5,
    notes: 'Statement memberikan sinyal eksplisit bahwa pemangkasan suku bunga berikutnya siap dilakukan pada pertemuan September.',
    affectedAssets: ['XAUUSD', 'EURUSD', 'USDJPY'],
  },
  {
    id: 'fomc-2026-09',
    meetingDates: '16 - 17 September 2026',
    decisionDateLabel: 'Kamis, 18 Sep 2026',
    decisionTimeWIB: '01:00 WIB',
    pressConferenceTimeWIB: '01:30 WIB',
    hasSEP: true,
    status: 'completed',
    rateBefore: '5.00% - 5.25%',
    rateAfterOrExpected: '4.75% - 5.00%',
    decisionOrExpectation: 'CUT 25 bps (5.00%)',
    fedWatchCutProb: 98.2,
    fedWatchHoldProb: 1.8,
    notes: 'Pemangkasan 25 bps terealisasi. Jerome Powell menegaskan The Fed memasuki fase normalisasi moneter menuju netral (neutral rate).',
    affectedAssets: ['XAUUSD', 'EURUSD', 'BTCUSDT', 'NVDA'],
  },
  {
    id: 'fomc-2026-11',
    meetingDates: '4 - 5 November 2026',
    decisionDateLabel: 'Kamis Dini Hari, 6 Nov 2026',
    decisionTimeWIB: '01:00 WIB',
    pressConferenceTimeWIB: '01:30 WIB',
    hasSEP: false,
    status: 'next',
    rateBefore: '4.75% - 5.00%',
    rateAfterOrExpected: '4.50% - 4.75%',
    decisionOrExpectation: 'KONSENSUS: CUT 25 bps (ke 4.75%)',
    fedWatchCutProb: 94.8,
    fedWatchHoldProb: 5.2,
    notes: 'RAPAT TERDEKAT. Konsensus pasar memprediksi pemangkasan 25 bps berikutnya. Fokus utama pasar tertuju pada konferensi pers Powell mengenai kecepatan pelonggaran di 2027.',
    affectedAssets: ['XAUUSD', 'EURUSD', 'BTCUSDT', 'USDJPY', 'NVDA', 'AAPL', 'BBCA'],
  },
  {
    id: 'fomc-2026-12',
    meetingDates: '16 - 17 Desember 2026',
    decisionDateLabel: 'Kamis Dini Hari, 18 Des 2026',
    decisionTimeWIB: '02:00 WIB',
    pressConferenceTimeWIB: '02:30 WIB',
    hasSEP: true,
    status: 'upcoming',
    rateBefore: '4.50% - 4.75%',
    rateAfterOrExpected: '4.25% - 4.50%',
    decisionOrExpectation: 'EKSPEKTASI: CUT 25 bps + Rilis Dot Plot 2027',
    fedWatchCutProb: 78.4,
    fedWatchHoldProb: 21.6,
    notes: 'Rapat penutup tahun 2026 dilengkapi proyeksi Dot Plot kuartalan (SEP) yang akan menjadi peta jalan (roadmap) suku bunga The Fed untuk 2027-2028.',
    affectedAssets: ['XAUUSD', 'EURUSD', 'BTCUSDT', 'SPY'],
  },
];

export const CME_FEDWATCH_PROBABILITIES: FedWatchOption[] = [
  {
    targetRange: '4.50% - 4.75%',
    changeBps: -25,
    label: 'Pemangkasan Suku Bunga (-25 bps)',
    probability: 94.8,
    priorDayProb: 92.5,
    priorWeekProb: 88.0,
  },
  {
    targetRange: '4.75% - 5.00%',
    changeBps: 0,
    label: 'Pertahankan Suku Bunga (Pause / Hold)',
    probability: 5.2,
    priorDayProb: 7.5,
    priorWeekProb: 12.0,
  },
  {
    targetRange: '4.25% - 4.50%',
    changeBps: -50,
    label: 'Pemangkasan Jumbo (-50 bps)',
    probability: 0.0,
    priorDayProb: 0.0,
    priorWeekProb: 0.0,
  },
];

export const FOMC_ASSET_PLAYBOOK: FomcAssetReaction[] = [
  {
    symbol: 'XAUUSD',
    name: 'Emas Spot (Gold)',
    dovishReaction: '🟢 RALLY KUAT: Penurunan suku bunga & imbal hasil riil US Treasury mengurangi opportunity cost memegang emas non-yielding.',
    hawkishReaction: '🔴 KOREKSI CEPAT: Dolar AS menguat dan imbal hasil obligasi naik menekan harga emas menuju support kunci.',
    keyLevelToWatch: 'Zona Demand $4,010 - $4,028 | Resistance All-Time High $4,075 - $4,090',
  },
  {
    symbol: 'BTCUSDT',
    name: 'Bitcoin (Crypto)',
    dovishReaction: '🟢 RISK-ON PUMP: Likuiditas moneter global melonggar meningkatkan aliran modal ke aset berisiko tinggi dan crypto.',
    hawkishReaction: '🔴 PULLBACK / VOLATILITAS TINGGI: Pengetatan likuiditas memicu aksi profit-taking leverage derivatif.',
    keyLevelToWatch: 'Support Kunci $78,500 | Target Resisten Psikologis $84,000 - $88,000',
  },
  {
    symbol: 'EURUSD',
    name: 'Euro / US Dollar',
    dovishReaction: '🟢 BULLISH REBOUND: Perbedaan suku bunga (rate differential) menyempit terhadap ECB, melemahkan indeks Dolar (DXY).',
    hawkishReaction: '🔴 BEARISH BREAKDOWN: Penguatan Dolar mendorong EUR/USD mendekati level paritas.',
    keyLevelToWatch: 'Support 1.0780 | Resistance 1.0920 - 1.0965',
  },
  {
    symbol: 'USDJPY',
    name: 'US Dollar / Japanese Yen',
    dovishReaction: '🔴 BEARISH DROP: Penurunan yield obligasi AS 10-tahun memicu unwinding carry trade Yen secara masif.',
    hawkishReaction: '🟢 BULLISH SURGE: Gap suku bunga AS-Jepang tetap lebar, mendorong penguatan USD/JPY.',
    keyLevelToWatch: 'Support 150.80 | Resisten 154.50',
  },
  {
    symbol: 'NVDA',
    name: 'Nvidia (Mega-Cap Tech)',
    dovishReaction: '🟢 EXPANSION PE: Suku bunga diskonto DCF lebih rendah melipatgandakan valuasi saham teknologi berorientasi masa depan.',
    hawkishReaction: '🔴 TEKANAN VALUASI: Tekanan rasio P/E dan kenaikan biaya modal bagi rencana ekspansi infrastruktur AI.',
    keyLevelToWatch: 'Support $134.00 | Resistance $146.50',
  },
];
