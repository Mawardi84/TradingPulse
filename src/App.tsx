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
  Menu,
  X,
  Sliders,
  Bot,
  Calendar,
  Newspaper,
  Code2,
  Calculator,
  Compass,
  FlaskConical,
  Grid,
} from 'lucide-react';
import { useVoiceCommand } from './hooks/useVoiceCommand';

export function App() {
  const { user, loading: authLoading } = useFirebase();

  const [activeSection, setActiveSection] = useState<
    'chart' | 'chat' | 'fundamental' | 'calendar' | 'macro' | 'news' | 'screener' | 'bot' | 'phase4' | 'quant' | 'portfolio' | 'system' | 'roadmap'
  >('chart');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    { id: 'chart', label: 'Chart & Trading', icon: LayoutDashboard, category: 'Trading' },
    { id: 'portfolio', label: 'Cloud Portfolio', icon: WalletIcon, category: 'Trading' },
    { id: 'screener', label: 'Screener Multi-Aset', icon: Sliders, category: 'Analisis' },
    { id: 'fundamental', label: 'Fundamental', icon: Building2, category: 'Analisis' },
    { id: 'calendar', label: 'Kalender & FOMC', icon: Calendar, category: 'Analisis' },
    { id: 'macro', label: 'Rumus Kuantitatif Makro', icon: Calculator, category: 'Analisis' },
    { id: 'news', label: 'Berita Pasar', icon: Newspaper, category: 'Informasi' },
    { id: 'chat', label: 'Chat & Sinyal AI', icon: MessageSquare, category: 'AI & Bot' },
    { id: 'bot', label: 'Bot Trading MT5', icon: Bot, category: 'AI & Bot' },
    { id: 'quant', label: 'Quant Script Editor', icon: Code2, category: 'Kuantitatif' },
    { id: 'phase4', label: 'Phase 4: Lab & Bridge', icon: FlaskConical, category: 'Kuantitatif' },
    { id: 'system', label: 'System Status', icon: ActivityIcon, category: 'System' },
    { id: 'roadmap', label: 'Roadmap & Docs', icon: Compass, category: 'System' },
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

        {/* Navigation - Desktop Horizontal Tabs */}
        <nav className="hidden lg:flex items-center gap-0 border-l border-zinc-800 pl-2 overflow-x-auto scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id as any)}
              className={`px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors border-r border-zinc-800 whitespace-nowrap flex items-center gap-1.5 ${
                activeSection === item.id
                  ? 'bg-yellow-500 text-black font-extrabold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <item.icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Navigation - Mobile & Tablet Quick Dropdown */}
        <div className="flex lg:hidden items-center gap-1">
          <select
            value={activeSection}
            onChange={(e) => handleNavClick(e.target.value as any)}
            className="bg-zinc-900 text-yellow-400 font-bold border border-zinc-700 px-2 py-1 text-[10px] uppercase rounded-none focus:outline-none focus:border-yellow-400 max-w-[160px] sm:max-w-[220px]"
          >
            {navItems.map((item) => (
              <option key={item.id} value={item.id} className="bg-zinc-950 text-white">
                [{item.category}] {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="px-2 py-1 bg-yellow-500 text-black font-extrabold text-[10px] uppercase flex items-center gap-1 border border-black cursor-pointer hover:bg-yellow-400"
            title="Buka semua 13 modul terminal"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">MODUL</span>
          </button>
        </div>

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

        {/* Full 13-Module Mobile Navigation Modal Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col p-4 font-mono text-xs overflow-y-auto animate-in fade-in duration-200">
            <div className="max-w-2xl w-full mx-auto space-y-5 my-auto">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500 text-black font-bold flex items-center justify-center text-[10px]">AV</div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    NAVIGASI MODUL TERMINAL (13)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-yellow-400 font-bold border border-zinc-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      handleNavClick(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`p-3 text-left border flex items-center gap-3 transition-all cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-yellow-500 text-black border-yellow-400 font-extrabold shadow-lg'
                        : 'bg-zinc-950 text-white border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900'
                    }`}
                  >
                    <div className={`p-2 rounded-none ${activeSection === item.id ? 'bg-black text-yellow-400' : 'bg-zinc-900 text-zinc-400'}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-normal">
                        [{item.category}]
                      </span>
                      <span className="text-xs uppercase tracking-wider font-bold">
                        {item.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-[10px] text-zinc-500">
                <span>Pilih modul untuk langsung berpindah tampilan.</span>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-1.5 bg-zinc-900 text-zinc-300 hover:text-white uppercase font-bold border border-zinc-700 cursor-pointer"
                >
                  Tutup Menu
                </button>
              </div>
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
            onClick={() => setActiveSection('screener')}
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${activeSection === 'screener' ? 'text-yellow-400 font-bold' : 'text-zinc-500'}`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[8px] uppercase">Screener</span>
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${isMobileMenuOpen ? 'text-yellow-400 font-bold' : 'text-yellow-500 hover:text-yellow-400'}`}
          >
            <Grid className="w-5 h-5" />
            <span className="text-[8px] uppercase font-bold">Modul (13)</span>
          </button>
        </nav>

        {/* Padding for Bottom Nav on Mobile */}
        <div className="h-14 lg:hidden bg-black shrink-0" />
      </ErrorBoundary>
    </div>
  );
}

export default App;
