import React, { useState, useEffect } from 'react';
import { Instrument, Candle } from '../types/market';
import { RecentTickInfo, ConnectionStatus } from '../hooks/useRealTimeMarket';
import { WatchlistTickerBar } from './WatchlistTickerBar';
import { TradingChartCanvas } from './TradingChartCanvas';
import { ChartTradingWidget, PendingOrder } from './ChartTradingWidget';
import { TechnicalAnalysisPanel } from './TechnicalAnalysisPanel';
import { FundamentalSummaryPanel } from './FundamentalSummaryPanel';
import { MarketSentimentPanel } from './MarketSentimentPanel';
import { MultiAssetListPanel } from './MultiAssetListPanel';
import { TradingChatPanel } from './TradingChatPanel';
import { useFirebase } from '../hooks/useFirebase';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { auth } from '../services/firebase';
import {
  GripVertical,
  Maximize2,
  Minimize2,
  RotateCcw,
  Lock,
  Unlock,
  Sliders,
  Columns,
  Rows,
  RefreshCw,
} from 'lucide-react';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // Don't throw for offline/network errors to prevent UI crashes during background sync
  if (message.toLowerCase().includes('offline') || message.toLowerCase().includes('network') || message.toLowerCase().includes('reach cloud firestore')) {
    console.warn('Silent Firestore warning (Offline):', message);
    return;
  }
  
  throw new Error(JSON.stringify(errInfo));
}

interface ChartTradingLayoutManagerProps {
  instruments: Instrument[];
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;
  selectedInstrument: Instrument;
  timeframe: any;
  setTimeframe: (tf: any) => void;
  candles: Candle[];
  connectionStatus: ConnectionStatus;
  recentTicks: Record<string, RecentTickInfo>;
  addCustomInstrument: (sym: string) => void;
  setActiveSection: (sec: any) => void;
  INITIAL_MARKET_NEWS: any[];
  handleJumpToChart: (sym: string) => void;
  handleJumpToFundamental: (sym: string) => void;
  activeIndicators: string[];
}

export interface ChartLayoutConfig {
  chartColumnSpan: number; // e.g. 8 (out of 12)
  analysisColumnSpan: number; // e.g. 4
  orderWidgetHeight: number; // in pixels, e.g. 210
  isLocked: boolean;
  panelOrder: string[]; // e.g. ['watchlist', 'chart', 'order', 'analysis']
}

const STORAGE_KEY = 'astrav_chart_grid_layout_v2';

export const ChartTradingLayoutManager: React.FC<ChartTradingLayoutManagerProps> = ({
  instruments,
  selectedSymbol,
  setSelectedSymbol,
  selectedInstrument,
  timeframe,
  setTimeframe,
  candles,
  connectionStatus,
  recentTicks,
  addCustomInstrument,
  setActiveSection,
  INITIAL_MARKET_NEWS,
  handleJumpToChart,
  handleJumpToFundamental,
  activeIndicators,
}) => {
  const [layout, setLayout] = useState<ChartLayoutConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return {
      chartColumnSpan: 8,
      analysisColumnSpan: 4,
      orderWidgetHeight: 210,
      isLocked: false,
      panelOrder: ['watchlist', 'chart', 'order', 'analysis'],
    };
  });

  const [chartSideTab, setChartSideTab] = useState<
    'technicals' | 'fundamentals' | 'sentiment' | 'multiasset' | 'chat'
  >('technicals');
  const [activePendingOrder, setActivePendingOrder] = useState<PendingOrder | null>(null);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [isResizingColumns, setIsResizingColumns] = useState(false);

  const { user } = useFirebase();
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Load layout from Cloud on mount
  useEffect(() => {
    if (!user) return;
    const path = `users/${user.uid}/settings/terminal`;
    const loadCloudLayout = async () => {
      try {
        const docRef = doc(db, path);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          if (cloudData.layoutConfig) {
            setLayout(JSON.parse(cloudData.layoutConfig));
          }
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, path);
      }
    };
    loadCloudLayout();
  }, [user]);

  // Save layout to LocalStorage and Cloud
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
      
      if (user) {
        const path = `users/${user.uid}/settings/terminal`;
        const syncToCloud = async () => {
          setIsCloudSyncing(true);
          try {
            const docRef = doc(db, path);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
              await setDoc(docRef, {
                userId: user.uid,
                layoutConfig: JSON.stringify(layout),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } else {
              await setDoc(docRef, {
                layoutConfig: JSON.stringify(layout),
                updatedAt: serverTimestamp(),
              }, { merge: true });
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, path);
          } finally {
            setIsCloudSyncing(false);
          }
        };
        const timer = setTimeout(syncToCloud, 2000); // Debounce cloud saves
        return () => clearTimeout(timer);
      }
    } catch {}
  }, [layout, user]);

  const handleResetLayout = () => {
    const defaultLayout: ChartLayoutConfig = {
      chartColumnSpan: 8,
      analysisColumnSpan: 4,
      orderWidgetHeight: 210,
      isLocked: false,
      panelOrder: ['watchlist', 'chart', 'order', 'analysis'],
    };
    setLayout(defaultLayout);
  };

  const movePanel = (index: number, direction: 'up' | 'down') => {
    if (layout.isLocked) return;
    const newOrder = [...layout.panelOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;
    setLayout((prev) => ({ ...prev, panelOrder: newOrder }));
  };

  return (
    <div className="flex flex-col flex-1 h-[calc(100vh-60px)] overflow-hidden bg-black text-white font-mono text-[11px]">
      {/* Grid Layout Customizer Toolbar */}
      <div className="bg-zinc-950 border-b border-white px-3 py-1.5 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400 text-black flex items-center justify-center font-extrabold text-[9px]">
            GL
          </div>
          <span className="font-bold text-white uppercase tracking-wider text-[11px]">
            GRID LAYOUT MANAGER (DRAG & RESIZE)
          </span>
          <span className="text-zinc-400 text-[10px] hidden sm:inline">
            {layout.isLocked ? '• Layout Terkunci' : '• Mode Kustomisasi Aktif'}
          </span>
          {isCloudSyncing && (
            <span className="text-emerald-500 text-[9px] animate-pulse flex items-center gap-1 ml-2">
              <RefreshCw className="w-2.5 h-2.5" /> SINKRONISASI CLOUD...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Column Span Slider (Desktop) */}
          <div className="hidden xl:flex items-center gap-1.5 text-[10px] text-zinc-300 border-r border-zinc-800 pr-2">
            <Columns className="w-3.5 h-3.5 text-yellow-400" />
            <span>Lebar Chart ({layout.chartColumnSpan}/12):</span>
            <input
              type="range"
              min="6"
              max="10"
              value={layout.chartColumnSpan}
              disabled={layout.isLocked}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setLayout((prev) => ({
                  ...prev,
                  chartColumnSpan: val,
                  analysisColumnSpan: 12 - val,
                }));
              }}
              className="w-20 accent-yellow-400 cursor-pointer"
            />
          </div>

          {/* Lock / Unlock Toggle */}
          <button
            type="button"
            onClick={() => setLayout((prev) => ({ ...prev, isLocked: !prev.isLocked }))}
            className={`px-2.5 py-1 text-[10px] uppercase font-bold flex items-center gap-1 border transition-colors cursor-pointer ${
              layout.isLocked
                ? 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
                : 'bg-yellow-400 text-black border-black font-extrabold'
            }`}
            title={layout.isLocked ? 'Buka Kunci Layout' : 'Kunci Layout'}
          >
            {layout.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span>{layout.isLocked ? 'Terkunci' : 'Kustomisasi'}</span>
          </button>

          {/* Reset Layout */}
          <button
            type="button"
            onClick={handleResetLayout}
            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-700 text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset ke Layout Default"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <main className="grid grid-cols-12 gap-0 flex-1 overflow-hidden">
        {/* Left Column: Chart Area */}
        <div
          style={{ gridColumn: `span ${layout.chartColumnSpan} / span ${layout.chartColumnSpan}` }}
          className="col-span-12 xl:col-span-8 flex flex-col h-full overflow-hidden border-b xl:border-b-0 xl:border-r border-zinc-800 bg-black"
        >
          {/* Watchlist Ticker Bar */}
          <div className="border-b border-white shrink-0">
            <WatchlistTickerBar
              instruments={instruments}
              selectedSymbol={selectedSymbol}
              onSelectSymbol={setSelectedSymbol}
              onAddCustomInstrument={addCustomInstrument}
              recentTicks={recentTicks}
              connectionStatus={connectionStatus}
            />
          </div>

          {/* Trading Chart Canvas (Flex-1) */}
          <div className="flex-1 bg-black overflow-hidden relative border-b border-white">
            <TradingChartCanvas
              instrument={selectedInstrument}
              candles={candles}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              liveSource={connectionStatus.source}
              onExecuteTrade={(order) => {
                setActivePendingOrder({
                  type: order.type,
                  price: order.price,
                  sl: order.sl,
                  tp: order.tp,
                  timestamp: Date.now(),
                });
              }}
              onOpenBotManager={() => {
                setActiveSection('bot');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              activeIndicators={activeIndicators}
            />
          </div>

          {/* Order Widget with Resizable Height */}
          <div
            style={{ height: `${layout.orderWidgetHeight}px` }}
            className="bg-black shrink-0 relative border-t border-white flex flex-col"
          >
            {/* Height Resizer Handle */}
            {!layout.isLocked && (
              <div
                className="absolute top-0 inset-x-0 h-1.5 bg-zinc-800 hover:bg-yellow-400 cursor-ns-resize transition-colors z-20 flex items-center justify-center"
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startY = e.clientY;
                  const startHeight = layout.orderWidgetHeight;
                  const onMouseMove = (moveEvent: MouseEvent) => {
                    const diff = startY - moveEvent.clientY; // dragging up increases height
                    const newH = Math.min(450, Math.max(120, startHeight + diff));
                    setLayout((prev) => ({ ...prev, orderWidgetHeight: newH }));
                  };
                  const onMouseUp = () => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                  };
                  window.addEventListener('mousemove', onMouseMove);
                  window.addEventListener('mouseup', onMouseUp);
                }}
                title="Tarik untuk mengubah tinggi widget order"
              >
                <div className="w-8 h-0.5 bg-zinc-500 rounded-full" />
              </div>
            )}

            <div className="flex-1 overflow-y-auto pt-1">
              <ChartTradingWidget
                instrument={selectedInstrument}
                allInstruments={instruments}
                pendingOrder={activePendingOrder}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Panels */}
        <div
          style={{ gridColumn: `span ${12 - layout.chartColumnSpan} / span ${12 - layout.chartColumnSpan}` }}
          className="col-span-12 xl:col-span-4 bg-black border-l-0 xl:border-l border-zinc-800 flex flex-col h-full overflow-hidden"
        >
          {/* Analysis Tab Switcher */}
          <div className="flex items-center gap-0 bg-black border-b border-white p-0 overflow-x-auto text-[10px] font-bold shrink-0">
            {['technicals', 'fundamentals', 'sentiment', 'multiasset', 'chat'].map((tab) => (
              <button
                key={tab}
                onClick={() => setChartSideTab(tab as any)}
                className={`px-2.5 py-1.5 uppercase tracking-wider transition-colors border-r border-white cursor-pointer ${
                  chartSideTab === tab ? 'text-black bg-yellow-400 font-extrabold' : 'text-white hover:bg-zinc-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto bg-black">
            {chartSideTab === 'technicals' && (
              <TechnicalAnalysisPanel instrument={selectedInstrument} candles={candles} />
            )}
            {chartSideTab === 'fundamentals' && (
              <FundamentalSummaryPanel
                instrument={selectedInstrument}
                onOpenFullFundamental={handleJumpToFundamental}
              />
            )}
            {chartSideTab === 'sentiment' && (
              <MarketSentimentPanel
                instrument={selectedInstrument}
                news={INITIAL_MARKET_NEWS}
                onJumpToAsset={handleJumpToChart}
              />
            )}
            {chartSideTab === 'multiasset' && (
              <MultiAssetListPanel
                instruments={instruments}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={setSelectedSymbol}
                recentTicks={recentTicks}
              />
            )}
            {chartSideTab === 'chat' && (
              <TradingChatPanel
                currentInstrument={selectedInstrument}
                candles={candles}
                onJumpToAsset={handleJumpToChart}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
