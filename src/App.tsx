import React, { useState, useMemo, useEffect } from 'react';
import { Candle } from './types/market';
import { INITIAL_MARKET_NEWS, ECONOMIC_EVENTS, generateHistoricalCandles } from './data/marketData';
import { useRealTimeMarket } from './hooks/useRealTimeMarket';
import { useFirebase } from './hooks/useFirebase';
import { TradingChartCanvas } from './components/TradingChartCanvas';
import { TechnicalAnalysisPanel } from './components/TechnicalAnalysisPanel';
import { FundamentalAnalysisView } from './components/FundamentalAnalysisView';
import { FundamentalSummaryPanel } from './components/FundamentalSummaryPanel';
import { MarketSentimentPanel } from './components/MarketSentimentPanel';
import { MultiAssetListPanel } from './components/MultiAssetListPanel';
import { EconomicCalendarView } from './components/EconomicCalendarView';
import { MarketNewsView } from './components/MarketNewsView';
import { ScreenerView } from './components/ScreenerView';
import { TradingBotManager } from './components/TradingBotManager';
import { MacroFormulasView } from './components/MacroFormulasView';
import { WatchlistTickerBar } from './components/WatchlistTickerBar';
import { ChartTradingWidget, PendingOrder } from './components/ChartTradingWidget';
import { TradingChatPanel } from './components/TradingChatPanel';
import { ChartTradingLayoutManager } from './components/ChartTradingLayoutManager';
import { Phase4HubView } from './components/Phase4HubView';
import { QuantScriptEditor } from './components/QuantScriptEditor';
import { CloudPortfolioView } from './components/CloudPortfolioView';
import { LandingAuthScreen } from './components/LandingAuthScreen';
import { RoadmapView } from './components/RoadmapView';
import { UserMenu } from './components/UserMenu';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SystemStatusView } from './components/SystemStatusView';
import {
  Radio,
  Pause,
  Play,
  RefreshCw,
  Zap,
  Building2,
  Flame,
  Layers,
  BarChart2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  LayoutDashboard,
  Wallet as WalletIcon,
  Activity as ActivityIcon,
  Mic,
} from 'lucide-react';
import { useVoiceCommand } from './hooks/useVoiceCommand';

export function App() {
  const { user, loading: authLoading } = useFirebase();

  const [activeSection, setActiveSection] = useState<
    'chart' | 'chat' | 'fundamental' | 'calendar' | 'macro' | 'news' | 'screener' | 'bot' | 'phase4' | 'quant' | 'portfolio' | 'system' | 'roadmap'
  >('chart');

  // Chart view side tab selection
  const [chartSideTab, setChartSideTab] = useState<
    'technicals' | 'fundamentals' | 'sentiment' | 'multiasset' | 'chat'
  >('technicals');
  const [showMultiAssetDrawer, setShowMultiAssetDrawer] = useState<boolean>(false);
  const [activePendingOrder, setActivePendingOrder] = useState<PendingOrder | null>(null);
  const [activeIndicators, setActiveIndicators] = useState<string[]>([]);

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
    addCustomInstrument,
  } = useRealTimeMarket('BTCUSDT', '15m');

  const currentCandles = useMemo(() => {
    if (selectedSymbol && candles.length > 0) return candles;
    return generateHistoricalCandles(selectedInstrument, timeframe, 60);
  }, [selectedSymbol, candles, selectedInstrument, timeframe]);

  const navItems = [
    { id: 'chart', label: 'Chart & Trading' },
    { id: 'portfolio', label: 'Cloud Portfolio' },
    { id: 'system', label: 'System Status' },
    { id: 'chat', label: 'Chat Trading & Sinyal' },
    { id: 'fundamental', label: 'Fundamental' },
    { id: 'calendar', label: 'Kalender Ekonomi & FOMC' },
    { id: 'macro', label: 'Rumus Kuantitatif Makro' },
    { id: 'news', label: 'Berita Pasar' },
    { id: 'screener', label: 'Screener Multi-Aset' },
    { id: 'bot', label: 'Bot Trading MT5' },
    { id: 'quant', label: 'Quant Script Editor' },
    { id: 'phase4', label: 'Phase 4: Lab & Bridge' },
    { id: 'roadmap', label: 'Roadmap' },
  ];

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  };

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [activeSection]);

  const handleNavClick = (sectionId: typeof activeSection) => {
    setActiveSection(sectionId);
    scrollToTop();
  };

  const handleJumpToChart = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveSection('chart');
    scrollToTop();
  };

  const handleJumpToFundamental = (symbol: string) => {
    setSelectedSymbol(symbol);
    setActiveSection('fundamental');
    scrollToTop();
  };

  const [commandInput, setCommandInput] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);

  const executeCommand = (cmdText: string) => {
    const cmd = cmdText.trim().toLowerCase();
    if (!cmd) return;

    if (cmd.startsWith('/bug') || cmd.startsWith('/audit') || cmd.startsWith('/health') || cmd.startsWith('/debug') || cmd.startsWith('/system')) {
      setActiveSection('system');
    } else if (cmd.startsWith('/portfolio') || cmd.startsWith('/account')) {
      setActiveSection('portfolio');
    } else if (cmd.startsWith('/chart')) {
      const parts = cmd.split(' ');
      if (parts[1]) {
        const targetSym = parts[1].toUpperCase();
        addCustomInstrument(targetSym);
      }
      setActiveSection('chart');
    } else if (cmd.startsWith('/screener')) {
      setActiveSection('screener');
    } else if (cmd.startsWith('/news')) {
      setActiveSection('news');
    } else if (cmd.startsWith('/calendar') || cmd.startsWith('/fomc')) {
      setActiveSection('calendar');
    } else if (cmd.startsWith('/macro')) {
      setActiveSection('macro');
    } else if (cmd.startsWith('/quant') || cmd.startsWith('/script')) {
      setActiveSection('quant');
    } else if (cmd.startsWith('/bot')) {
      setActiveSection('bot');
    } else if (cmd.startsWith('/chat')) {
      setActiveSection('chat');
    } else if (cmd.startsWith('/fundamental')) {
      setActiveSection('fundamental');
    } else if (cmd.startsWith('/roadmap')) {
      setActiveSection('roadmap');
    } else if (cmd.startsWith('/rsi')) {
      setActiveIndicators(prev => prev.includes('RSI') ? prev : [...prev, 'RSI']);
      setActiveSection('chart');
    } else if (cmd.startsWith('/macd')) {
      setActiveIndicators(prev => prev.includes('MACD') ? prev : [...prev, 'MACD']);
      setActiveSection('chart');
    } else if (cmd.startsWith('/indicator') && cmd.includes('off')) {
      setActiveIndicators([]);
    }
    setCommandInput('');
    scrollToTop();
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(commandInput);
  };

  const { isListening, startListening, error: voiceError } = useVoiceCommand((cmd) => {
    setCommandInput(cmd);
    setTimeout(() => executeCommand(cmd), 800);
  });


  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" />
          <span className="text-zinc-500 text-[10px] uppercase tracking-widest">Inisialisasi Terminal Secure...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingAuthScreen />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono text-[11px] p-0">
      <OfflineIndicator />
      {/* Institutional Terminal Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 px-2 py-1 flex items-center justify-between gap-2 min-h-10">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-6 h-6 bg-yellow-500 border border-black flex items-center justify-center font-bold text-black text-[10px]">AV</div>
          <h1 className="hidden sm:block text-[11px] font-bold text-white tracking-widest uppercase">AstraView Terminal v2.5</h1>
        </div>

        {/* Navigation - Tablet/Desktop */}
        <nav className="hidden lg:flex items-center gap-0 border-l border-zinc-800 pl-2 overflow-x-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as any)}
              className={`px-3 py-1 text-[10px] uppercase tracking-wider transition-colors border-r border-zinc-800 whitespace-nowrap ${
                activeSection === item.id
                  ? 'bg-white text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <UserMenu />
          <PWAInstallButton />
        </div>
      </header>

      {/* Terminal Command Bar */}
      <form onSubmit={handleCommandSubmit} className="bg-black border-b border-white px-2 py-1 text-[10px] flex items-center gap-2">
        <span className="text-yellow-400 font-bold shrink-0">CMD&gt;</span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-yellow-200 placeholder-zinc-700"
          placeholder="Type command... (e.g. /chart XAUUSD, /screener, /bot, /news, /calendar, /macro)"
        />
        <button 
          type="button" 
          onClick={startListening}
          className={`p-1 transition-all ${isListening ? 'text-rose-500 animate-pulse' : 'text-zinc-600 hover:text-white'}`}
          title="Voice Command (Mic)"
        >
          <Mic className="w-3.5 h-3.5" />
        </button>
      </form>

      <ErrorBoundary>
        {activeSection === 'chart' ? (
          <ChartTradingLayoutManager
            instruments={instruments}
            selectedSymbol={selectedSymbol}
            setSelectedSymbol={setSelectedSymbol}
            selectedInstrument={selectedInstrument}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            candles={candles}
            connectionStatus={connectionStatus}
            recentTicks={recentTicks}
            addCustomInstrument={addCustomInstrument}
            setActiveSection={setActiveSection}
            INITIAL_MARKET_NEWS={INITIAL_MARKET_NEWS}
            handleJumpToChart={handleJumpToChart}
            handleJumpToFundamental={handleJumpToFundamental}
            activeIndicators={activeIndicators}
          />
        ) : (
          <main className="p-3 min-h-[calc(100vh-60px)] overflow-y-auto bg-black text-white">
            {activeSection === 'portfolio' && (
              <CloudPortfolioView 
                allInstruments={instruments} 
                onJumpToAsset={handleJumpToChart} 
              />
            )}

            {activeSection === 'system' && <SystemStatusView />}

            {activeSection === 'chat' && (
              <div className="space-y-4">
                <WatchlistTickerBar
                  instruments={instruments}
                  selectedSymbol={selectedSymbol}
                  onSelectSymbol={setSelectedSymbol}
                  onAddCustomInstrument={addCustomInstrument}
                  recentTicks={recentTicks}
                  connectionStatus={connectionStatus}
                />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <TradingChatPanel
                      currentInstrument={selectedInstrument}
                      candles={candles}
                      onJumpToAsset={handleJumpToChart}
                    />
                  </div>
                  <div>
                    <TechnicalAnalysisPanel instrument={selectedInstrument} candles={candles} />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'fundamental' && (
              <FundamentalAnalysisView
                selectedInstrument={selectedInstrument}
                allInstruments={instruments}
                onSelectInstrument={setSelectedSymbol}
                onJumpToChart={handleJumpToChart}
              />
            )}

            {activeSection === 'calendar' && (
              <EconomicCalendarView
                events={ECONOMIC_EVENTS}
                onSimulateRelease={() => {}}
                onJumpToAsset={handleJumpToChart}
                onJumpToMacroFormula={() => {
                  setActiveSection('macro');
                  window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                }}
              />
            )}

            {activeSection === 'macro' && <MacroFormulasView />}

            {activeSection === 'news' && (
              <MarketNewsView
                news={INITIAL_MARKET_NEWS}
                instruments={instruments}
                isRefreshing={false}
                onRefreshNews={() => {}}
                onJumpToAsset={handleJumpToChart}
              />
            )}

            {activeSection === 'screener' && (
              <ScreenerView
                instruments={instruments}
                candlesBySymbol={{}}
                onJumpToChart={handleJumpToChart}
                onJumpToFundamental={handleJumpToFundamental}
              />
            )}

            {activeSection === 'bot' && <TradingBotManager />}

            {activeSection === 'quant' && (
              <QuantScriptEditor currentInstrument={selectedInstrument} />
            )}

            {activeSection === 'phase4' && (
              <Phase4HubView
                instruments={instruments}
                selectedInstrument={selectedInstrument}
                candles={candles}
              />
            )}
            
            {activeSection === 'roadmap' && <RoadmapView />}
          </main>
        )}

        {/* Floating Scroll to Top Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 px-3.5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black border border-black shadow-2xl transition-all flex items-center gap-2 text-xs font-mono font-bold cursor-pointer group"
            title="Kembali ke atas"
            aria-label="Kembali ke atas"
          >
            <ArrowUp className="w-4 h-4 stroke-[2.5] group-hover:-translate-y-0.5 transition-transform" />
            <span className="hidden sm:inline">Kembali ke Atas</span>
          </button>
        )}

        {/* System Health Audit Modal (Legacy /bug command redirect to system) */}
        {showAuditModal && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs">
            <div className="bg-black border border-yellow-400 rounded-none max-w-xl w-full p-5 space-y-4 shadow-2xl text-white">
              <div className="flex items-center justify-between border-b border-white pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-400 animate-ping" />
                  <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                    SYSTEM REDIRECT
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold border border-white"
                >
                  ESC [X]
                </button>
              </div>
              <p className="text-zinc-400">Redirecting to institutional system health monitoring hub...</p>
              <button 
                onClick={() => { setActiveSection('system'); setShowAuditModal(false); }}
                className="w-full py-3 bg-yellow-500 text-black font-extrabold uppercase border border-black hover:bg-yellow-400 transition-colors cursor-pointer"
              >
                Go to System Hub
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-white flex lg:hidden items-center justify-around py-1 pb-safe px-2">
          <button 
            onClick={() => setActiveSection('chart')}
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${activeSection === 'chart' ? 'text-yellow-400 font-bold' : 'text-zinc-500'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[8px] uppercase">Chart</span>
          </button>
          <button 
            onClick={() => setActiveSection('portfolio')}
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${activeSection === 'portfolio' ? 'text-yellow-400 font-bold' : 'text-zinc-500'}`}
          >
            <WalletIcon className="w-5 h-5" />
            <span className="text-[8px] uppercase">Account</span>
          </button>
          <button 
            onClick={() => setActiveSection('news')}
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${activeSection === 'news' ? 'text-yellow-400 font-bold' : 'text-zinc-500'}`}
          >
            <BarChart2 className="w-5 h-5" />
            <span className="text-[8px] uppercase">Market</span>
          </button>
          <button 
            onClick={() => setActiveSection('system')}
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${activeSection === 'system' ? 'text-yellow-400 font-bold' : 'text-zinc-500'}`}
          >
            <ActivityIcon className="w-5 h-5" />
            <span className="text-[8px] uppercase">System</span>
          </button>
        </nav>

        {/* Padding for Bottom Nav on Mobile */}
        <div className="h-14 lg:hidden bg-black shrink-0" />
      </ErrorBoundary>
    </div>
  );
}

export default App;
