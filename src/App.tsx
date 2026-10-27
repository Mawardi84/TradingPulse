import React, { useState, useMemo } from 'react';
import { Candle } from './types/market';
import { INITIAL_MARKET_NEWS, ECONOMIC_EVENTS, generateHistoricalCandles } from './data/marketData';
import { useRealTimeMarket } from './hooks/useRealTimeMarket';
import { TradingChartCanvas } from './components/TradingChartCanvas';
import { TechnicalAnalysisPanel } from './components/TechnicalAnalysisPanel';
import { FundamentalAnalysisView } from './components/FundamentalAnalysisView';
import { EconomicCalendarView } from './components/EconomicCalendarView';
import { MarketNewsView } from './components/MarketNewsView';
import { ScreenerView } from './components/ScreenerView';
import { TradingBotManager } from './components/TradingBotManager';
import { MacroFormulasView } from './components/MacroFormulasView';
import { WatchlistTickerBar } from './components/WatchlistTickerBar';
import { ChartTradingWidget } from './components/ChartTradingWidget';
import { TradingChatPanel } from './components/TradingChatPanel';
import { Radio, Pause, Play, RefreshCw, Zap } from 'lucide-react';

export function App() {
  const [activeSection, setActiveSection] = useState<
    'chart' | 'chat' | 'fundamental' | 'calendar' | 'macro' | 'news' | 'screener' | 'bot'
  >('chart');

  // Real-time market state hook with live Binance WS & Interbank rates
  const {
    instruments,
    selectedSymbol,
    setSelectedSymbol,
    selectedInstrument,
    timeframe,
    setTimeframe,
    candles,
    isLoadingCandles,
    recentTicks,
    connectionStatus,
    togglePause,
  } = useRealTimeMarket('BTCUSDT', '15m');

  const candlesBySymbol = useMemo(() => {
    const map: Record<string, Candle[]> = {};
    instruments.forEach((i) => {
      map[i.symbol] =
        i.symbol === selectedSymbol && candles.length > 0
          ? candles
          : generateHistoricalCandles(i, timeframe, 60);
    });
    return map;
  }, [instruments, selectedSymbol, candles, timeframe]);

  const navItems = [
    { id: 'chart', label: 'Chart & Trading' },
    { id: 'chat', label: 'Chat Trading & Sinyal' },
    { id: 'fundamental', label: 'Fundamental' },
    { id: 'calendar', label: 'Kalender Ekonomi' },
    { id: 'macro', label: 'Rumus Kuantitatif Makro' },
    { id: 'news', label: 'Berita Pasar' },
    { id: 'screener', label: 'Screener Multi-Aset' },
    { id: 'bot', label: 'Bot Trading MT5' },
  ];

  const handleJumpToChart = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveSection('chart');
  };

  const handleJumpToFundamental = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveSection('fundamental');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-3 sm:p-5">
      {/* Header with Live Engine Status & Controls */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
              AV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">AstraView TradePulse Pro</h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                  v3.4 REAL-LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Terminal Analisis Multi-Asset & Kuantitatif Makro</p>
            </div>
          </div>

          {/* Mobile Live Feed Indicator */}
          <div className="lg:hidden flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-mono font-semibold">LIVE</span>
          </div>
        </div>

        {/* Live Engine Header Badge & Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#111722] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-400 font-bold">LIVE STREAM ACTIVE</span>
            </div>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>{connectionStatus.tickCount.toLocaleString()} ticks</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400">{connectionStatus.ping}ms ping</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 truncate max-w-[210px] text-[11px] text-slate-300">
              {connectionStatus.source}
            </span>

            <button
              type="button"
              onClick={togglePause}
              title={connectionStatus.isPaused ? 'Lanjutkan Stream' : 'Jeda Stream'}
              className={`p-1 rounded ml-1 transition-colors ${
                connectionStatus.isPaused
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {connectionStatus.isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full bg-[#111722] p-1 rounded-lg border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeSection === item.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Chart Section */}
      {activeSection === 'chart' && (
        <div className="space-y-4">
          {/* Real-time Multi-Asset Watchlist Bar with Live Flash */}
          <WatchlistTickerBar
            instruments={instruments}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            recentTicks={recentTicks}
            connectionStatus={connectionStatus}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <TradingChartCanvas
                instrument={selectedInstrument}
                candles={candles}
                timeframe={timeframe}
                onTimeframeChange={setTimeframe}
                liveSource={connectionStatus.source}
              />

              {/* Chart Trading & Order Execution Terminal with Live PnL */}
              <ChartTradingWidget
                instrument={selectedInstrument}
                allInstruments={instruments}
              />
            </div>

            <div className="space-y-4">
              <TechnicalAnalysisPanel instrument={selectedInstrument} candles={candles} />

              {/* Quick Chat Trading Preview */}
              <TradingChatPanel
                currentInstrument={selectedInstrument}
                onJumpToAsset={handleJumpToChart}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Chat Trading & Signal Room */}
      {activeSection === 'chat' && (
        <div className="space-y-4">
          <WatchlistTickerBar
            instruments={instruments}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
            recentTicks={recentTicks}
            connectionStatus={connectionStatus}
          />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <TradingChatPanel
                currentInstrument={selectedInstrument}
                onJumpToAsset={handleJumpToChart}
              />
            </div>
            <div>
              <TechnicalAnalysisPanel instrument={selectedInstrument} candles={candles} />
            </div>
          </div>
        </div>
      )}

      {/* Fundamental View */}
      {activeSection === 'fundamental' && (
        <FundamentalAnalysisView
          selectedInstrument={selectedInstrument}
          allInstruments={instruments}
          onSelectInstrument={setSelectedSymbol}
          onJumpToChart={handleJumpToChart}
        />
      )}

      {/* Economic Calendar View */}
      {activeSection === 'calendar' && (
        <EconomicCalendarView
          events={ECONOMIC_EVENTS}
          onSimulateRelease={() => {}}
          onJumpToAsset={handleJumpToChart}
        />
      )}

      {/* Macro Formulas View */}
      {activeSection === 'macro' && <MacroFormulasView />}

      {/* Market News View */}
      {activeSection === 'news' && (
        <MarketNewsView
          news={INITIAL_MARKET_NEWS}
          instruments={instruments}
          isRefreshing={false}
          onRefreshNews={() => {}}
          onJumpToAsset={handleJumpToChart}
        />
      )}

      {/* Screener View */}
      {activeSection === 'screener' && (
        <ScreenerView
          instruments={instruments}
          candlesBySymbol={candlesBySymbol}
          onJumpToChart={handleJumpToChart}
          onJumpToFundamental={handleJumpToFundamental}
        />
      )}

      {/* Bot Manager View */}
      {activeSection === 'bot' && <TradingBotManager />}
    </div>
  );
}

export default App;
