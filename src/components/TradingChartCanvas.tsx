import React, { useState, useRef, useMemo } from 'react';
import {
  Candle,
  ChartDrawing,
  DrawingTool,
  Instrument,
  Timeframe,
} from '../types/market';
import {
  calculateBollingerBands,
  calculateEMA,
  calculateMACD,
  calculatePivotPoints,
  calculateRSI,
  findSupplyDemandZones,
} from '../utils/indicators';
import {
  Crosshair,
  TrendingUp,
  Minus,
  Layers,
  Trash2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Activity,
} from 'lucide-react';

interface TradingChartCanvasProps {
  instrument: Instrument;
  candles: Candle[];
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
  liveSource: string;
}

type ChartStyle = 'candlestick' | 'area' | 'heikin_ashi';
type SubIndicator = 'rsi' | 'macd' | 'none';

export const TradingChartCanvas: React.FC<TradingChartCanvasProps> = ({
  instrument,
  candles,
  timeframe,
  onTimeframeChange,
  liveSource,
}) => {
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showPivots, setShowPivots] = useState(false);
  const [showSD, setShowSD] = useState(true);
  const [subIndicator, setSubIndicator] = useState<SubIndicator>('rsi');
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [pendingPoint, setPendingPoint] = useState<{ index: number; price: number } | null>(null);
  const [visibleCount, setVisibleCount] = useState(72);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverYRatio, setHoverYRatio] = useState<number | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const displayCandles = useMemo(() => {
    const sliced = candles.slice(Math.max(0, candles.length - visibleCount));
    if (chartStyle !== 'heikin_ashi') return sliced;
    const ha: Candle[] = [];
    for (let i = 0; i < sliced.length; i++) {
      const c = sliced[i];
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = i === 0 ? (c.open + c.close) / 2 : (ha[i - 1].open + ha[i - 1].close) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);
      ha.push({
        time: c.time,
        open: Number(haOpen.toFixed(instrument.decimals)),
        high: Number(haHigh.toFixed(instrument.decimals)),
        low: Number(haLow.toFixed(instrument.decimals)),
        close: Number(haClose.toFixed(instrument.decimals)),
        volume: c.volume,
      });
    }
    return ha;
  }, [candles, visibleCount, chartStyle, instrument.decimals]);

  const ema20Full = useMemo(() => calculateEMA(candles, 20), [candles]);
  const ema50Full = useMemo(() => calculateEMA(candles, 50), [candles]);
  const bbFull = useMemo(() => calculateBollingerBands(candles, 20, 2), [candles]);
  const rsiFull = useMemo(() => calculateRSI(candles, 14), [candles]);
  const macdFull = useMemo(() => calculateMACD(candles, 12, 26, 9), [candles]);
  const zones = useMemo(() => findSupplyDemandZones(candles), [candles]);

  const offset = Math.max(0, candles.length - visibleCount);
  const ema20 = ema20Full.slice(offset);
  const ema50 = ema50Full.slice(offset);
  const bb = bbFull.slice(offset);
  const rsi = rsiFull.slice(offset);
  const macd = macdFull.slice(offset);

  const pivots = useMemo(() => {
    if (displayCandles.length === 0) return null;
    return calculatePivotPoints(displayCandles[displayCandles.length - 1], instrument.decimals);
  }, [displayCandles, instrument.decimals]);

  // SVG coordinate dimensions
  const width = 920;
  const mainHeight = subIndicator === 'none' ? 420 : 300;
  const subHeight = subIndicator === 'none' ? 0 : 115;
  const totalHeight = mainHeight + subHeight + 28;
  const padLeft = 12;
  const padRight = 76;
  const padTop = 18;
  const padBottom = 14;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = mainHeight - padTop - padBottom;

  const { minPrice, maxPrice, maxVol } = useMemo(() => {
    if (displayCandles.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVol: 1000 };
    }
    let min = Infinity;
    let max = -Infinity;
    let mVol = 0;

    displayCandles.forEach((c, i) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
      if (c.volume > mVol) mVol = c.volume;
      if (showBollinger && bb[i]) {
        if (bb[i].lower !== null && (bb[i].lower as number) < min) min = bb[i].lower as number;
        if (bb[i].upper !== null && (bb[i].upper as number) > max) max = bb[i].upper as number;
      }
    });

    const padding = (max - min) * 0.08 || max * 0.01 || 1;
    return {
      minPrice: min - padding,
      maxPrice: max + padding,
      maxVol: mVol || 1,
    };
  }, [displayCandles, showBollinger, bb]);

  const priceToY = (p: number) => {
    const ratio = (p - minPrice) / Math.max(0.000001, maxPrice - minPrice);
    return padTop + plotHeight * (1 - ratio);
  };

  const yToPrice = (y: number) => {
    const clampedY = Math.max(padTop, Math.min(padTop + plotHeight, y));
    const ratio = 1 - (clampedY - padTop) / plotHeight;
    return Number((minPrice + ratio * (maxPrice - minPrice)).toFixed(instrument.decimals));
  };

  const indexToX = (idx: number) => {
    const count = Math.max(1, displayCandles.length);
    const step = plotWidth / count;
    return padLeft + idx * step + step / 2;
  };

  const activeCandleIndex =
    hoverIndex !== null && hoverIndex >= 0 && hoverIndex < displayCandles.length
      ? hoverIndex
      : Math.max(0, displayCandles.length - 1);

  const activeCandle = displayCandles[activeCandleIndex] || {
    time: Math.floor(Date.now() / 1000),
    open: instrument.price,
    high: instrument.high24h,
    low: instrument.low24h,
    close: instrument.price,
    volume: instrument.volume24h,
  };

  const activeEma20 = ema20[activeCandleIndex];
  const activeEma50 = ema50[activeCandleIndex];
  const activeRsi = rsi[activeCandleIndex];
  const activeMacd = macd[activeCandleIndex];

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || displayCandles.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * width;
    const relY = ((e.clientY - rect.top) / rect.height) * totalHeight;

    if (relX < padLeft || relX > width - padRight) {
      setHoverIndex(null);
      setHoverYRatio(null);
      return;
    }

    const idx = Math.min(
      displayCandles.length - 1,
      Math.max(0, Math.floor(((relX - padLeft) / plotWidth) * displayCandles.length))
    );
    setHoverIndex(idx);
    setHoverYRatio(relY);
  };

  const handleChartClick = () => {
    if (hoverIndex === null || hoverYRatio === null) return;
    if (activeTool === 'cursor' || activeTool === 'crosshair') return;

    const clickedPrice = yToPrice(hoverYRatio);

    if (activeTool === 'horizontal') {
      setDrawings((prev) => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: 'horizontal',
          p1: { index: hoverIndex, price: clickedPrice },
          p2: { index: displayCandles.length - 1, price: clickedPrice },
          color: '#38BDF8',
        },
      ]);
      return;
    }

    if (!pendingPoint) {
      setPendingPoint({ index: hoverIndex, price: clickedPrice });
    } else {
      setDrawings((prev) => [
        ...prev,
        {
          id: `draw-${Date.now()}`,
          type: activeTool === 'fib' ? 'fib' : 'trendline',
          p1: pendingPoint,
          p2: { index: hoverIndex, price: clickedPrice },
          color: activeTool === 'fib' ? '#F59E0B' : '#3B82F6',
        },
      ]);
      setPendingPoint(null);
    }
  };

  const buildLinePath = (values: (number | null)[]) => {
    let d = '';
    values.forEach((v, i) => {
      if (v === null) return;
      const x = indexToX(i);
      const y = priceToY(v);
      d += d === '' ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    });
    return d;
  };

  const timeframes: Timeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D'];
  const priceLevels = Array.from({ length: 6 }, (_, i) =>
    minPrice + ((maxPrice - minPrice) * (5 - i)) / 5
  );

  const isUp = activeCandle.close >= activeCandle.open;

  return (
    <div className="flex flex-col bg-[#0B0F17] border border-slate-800/90 rounded-sm overflow-hidden shadow-2xl">
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 bg-[#111722] border-b border-slate-800/90">
        {/* Left: Timeframe & Chart Type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-[#0B0F17] p-0.5 rounded border border-slate-800" role="group" aria-label="Timeframe Selector">
            {timeframes.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => onTimeframeChange(tf)}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

          <div className="flex items-center bg-[#0B0F17] p-0.5 rounded border border-slate-800" role="group" aria-label="Chart Type">
            <button
              type="button"
              onClick={() => setChartStyle('candlestick')}
              className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 ${
                chartStyle === 'candlestick'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Candles
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('area')}
              className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 ${
                chartStyle === 'area'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setChartStyle('heikin_ashi')}
              className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 ${
                chartStyle === 'heikin_ashi'
                  ? 'bg-slate-800 text-slate-100 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Heikin-Ashi
            </button>
          </div>
        </div>

        {/* Middle: Technical Overlays & Subpane Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowSD((v) => !v)}
            className={`px-3 py-1 text-xs font-bold rounded border transition-all whitespace-nowrap shrink-0 shadow-sm ${
              showSD
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {showSD ? 'S&D Zones: AKTIF' : 'S&D Zones: OFF'}
          </button>
          <button
            type="button"
            onClick={() => setShowEma20((v) => !v)}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
              showEma20
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            EMA 20
          </button>
          <button
            type="button"
            onClick={() => setShowEma50((v) => !v)}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
              showEma50
                ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            EMA 50
          </button>
          <button
            type="button"
            onClick={() => setShowBollinger((v) => !v)}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
              showBollinger
                ? 'bg-purple-500/15 border-purple-500/40 text-purple-300'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            BB (20, 2)
          </button>
          <button
            type="button"
            onClick={() => setShowPivots((v) => !v)}
            className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
              showPivots
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Pivot S/R
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-0.5 hidden sm:block" />

          <button
            type="button"
            onClick={() => setSubIndicator((s) => (s === 'rsi' ? 'macd' : s === 'macd' ? 'none' : 'rsi'))}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border bg-[#0B0F17] border-slate-800 text-slate-300 hover:border-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Oscillator: {subIndicator.toUpperCase()}</span>
          </button>
        </div>

        {/* Right: Drawing Tools & Zoom */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Crosshair Tool"
            title="Crosshair"
            onClick={() => {
              setActiveTool('crosshair');
              setPendingPoint(null);
            }}
            className={`p-1.5 rounded border transition-colors ${
              activeTool === 'crosshair'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Draw Trendline"
            title="Trendline"
            onClick={() => {
              setActiveTool('trendline');
              setPendingPoint(null);
            }}
            className={`p-1.5 rounded border transition-colors ${
              activeTool === 'trendline'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Draw Horizontal Support/Resistance"
            title="Garis Horizontal S/R"
            onClick={() => {
              setActiveTool('horizontal');
              setPendingPoint(null);
            }}
            className={`p-1.5 rounded border transition-colors ${
              activeTool === 'horizontal'
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Draw Fibonacci Retracement"
            title="Fibonacci Retracement"
            onClick={() => {
              setActiveTool('fib');
              setPendingPoint(null);
            }}
            className={`p-1.5 rounded border transition-colors ${
              activeTool === 'fib'
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          {drawings.length > 0 && (
            <button
              type="button"
              aria-label="Hapus Gambar Chart"
              title="Hapus semua garis"
              onClick={() => {
                setDrawings([]);
                setPendingPoint(null);
              }}
              className="p-1.5 rounded border bg-[#0B0F17] border-slate-800 text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label="Zoom In Chart"
            title="Perbesar Chart"
            onClick={() => setVisibleCount((c) => Math.max(30, c - 16))}
            className="p-1.5 rounded border bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Zoom Out Chart"
            title="Perkecil Chart"
            onClick={() => setVisibleCount((c) => Math.min(110, c + 16))}
            className="p-1.5 rounded border bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Reset Zoom"
            title="Reset Zoom"
            onClick={() => setVisibleCount(72)}
            className="p-1.5 rounded border bg-[#0B0F17] border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* OHLCV & Active Indicator Readout Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#0B0F17] border-b border-slate-800/80 text-xs font-mono tabular-nums">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-sans font-semibold text-slate-200">
            {instrument.displaySymbol} · {timeframe} · {instrument.exchange}
          </span>
          <span className="text-slate-400">
            O <strong className={isUp ? 'text-emerald-400' : 'text-rose-400'}>{(activeCandle?.open ?? instrument.price).toFixed(instrument.decimals)}</strong>
          </span>
          <span className="text-slate-400">
            H <strong className={isUp ? 'text-emerald-400' : 'text-rose-400'}>{(activeCandle?.high ?? instrument.price).toFixed(instrument.decimals)}</strong>
          </span>
          <span className="text-slate-400">
            L <strong className={isUp ? 'text-emerald-400' : 'text-rose-400'}>{(activeCandle?.low ?? instrument.price).toFixed(instrument.decimals)}</strong>
          </span>
          <span className="text-slate-400">
            C <strong className={isUp ? 'text-emerald-400' : 'text-rose-400'}>{(activeCandle?.close ?? instrument.price).toFixed(instrument.decimals)}</strong>
          </span>
          <span className="text-slate-400">
            Vol <strong className="text-slate-300">{((activeCandle?.volume ?? 0) / 1000).toFixed(1)}K</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {showEma20 && typeof activeEma20 === 'number' && !isNaN(activeEma20) && (
            <span className="text-amber-400">EMA20: {activeEma20.toFixed(instrument.decimals)}</span>
          )}
          {showEma50 && typeof activeEma50 === 'number' && !isNaN(activeEma50) && (
            <span className="text-sky-400">EMA50: {activeEma50.toFixed(instrument.decimals)}</span>
          )}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-sans font-semibold">LIVE</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-sans">{liveSource}</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Multi-Pane Canvas */}
      <div className="relative w-full select-none bg-[#0B0F17]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${totalHeight}`}
          className="w-full h-[380px] sm:h-[430px] block cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoverIndex(null);
            setHoverYRatio(null);
          }}
          onClick={handleChartClick}
          data-testid="trading-chart-svg"
        >
          {/* Horizontal Price Grid Lines & Right Axis Labels */}
          {priceLevels.map((lvl, idx) => {
            const y = priceToY(lvl);
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#1E293B"
                  strokeDasharray="2 3"
                  strokeWidth="1"
                />
                <text
                  x={width - padRight + 6}
                  y={y + 4}
                  fill="#64748B"
                  fontSize="10.5"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {lvl.toFixed(instrument.decimals)}
                </text>
              </g>
            );
          })}

          {/* Supply & Demand Zones Overlay */}
          {showSD && zones.map((z) => {
            const xStart = indexToX(Math.max(0, z.startIndex - offset));
            const xEnd = indexToX(Math.min(displayCandles.length - 1, z.endIndex - offset));
            const yTop = priceToY(z.top);
            const yBottom = priceToY(z.bottom);
            
            if (xStart > width - padRight || xEnd < padLeft) return null;
            
            return (
              <rect 
                key={z.id} 
                x={xStart} 
                y={Math.min(yTop, yBottom)} 
                width={Math.max(1, xEnd - xStart)} 
                height={Math.max(1, Math.abs(yBottom - yTop))} 
                fill={z.type === 'supply' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)'} 
                stroke={z.type === 'supply' ? 'rgb(244, 63, 94)' : 'rgb(16, 185, 129)'} 
                strokeWidth="1"
                pointerEvents="none"
              />
            );
          })}

          {/* Volume Histogram */}
          {displayCandles.map((c, idx) => {
            const x = indexToX(idx);
            const barW = Math.max(2, (plotWidth / displayCandles.length) * 0.65);
            const volRatio = c.volume / maxVol;
            const volH = volRatio * (plotHeight * 0.22);
            const volY = padTop + plotHeight - volH;
            const up = c.close >= c.open;
            return (
              <rect
                key={`vol-${c.time}`}
                x={x - barW / 2}
                y={volY}
                width={barW}
                height={Math.max(1, volH)}
                fill={up ? 'rgba(16, 185, 129, 0.16)' : 'rgba(244, 63, 94, 0.16)'}
              />
            );
          })}

          {/* Bollinger Bands Overlay */}
          {showBollinger && (
            <g>
              <path
                d={buildLinePath(bb.map((b) => b.upper))}
                fill="none"
                stroke="rgba(168, 85, 247, 0.65)"
                strokeWidth="1.2"
              />
              <path
                d={buildLinePath(bb.map((b) => b.middle))}
                fill="none"
                stroke="rgba(168, 85, 247, 0.4)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <path
                d={buildLinePath(bb.map((b) => b.lower))}
                fill="none"
                stroke="rgba(168, 85, 247, 0.65)"
                strokeWidth="1.2"
              />
            </g>
          )}

          {/* Pivot Points S1/P/R1 Overlay */}
          {showPivots && pivots && (
            <g>
              {[
                { label: 'R1', val: pivots.r1, color: '#F43F5E' },
                { label: 'P', val: pivots.p, color: '#EAB308' },
                { label: 'S1', val: pivots.s1, color: '#10B981' },
              ].map((pv) => {
                if (pv.val < minPrice || pv.val > maxPrice) return null;
                const y = priceToY(pv.val);
                return (
                  <g key={pv.label}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke={pv.color}
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft + 6}
                      y={y - 4}
                      fill={pv.color}
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      Pivot {pv.label}: {(pv.val ?? 0).toFixed(instrument.decimals)}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Main Series: Area or Candlesticks */}
          {chartStyle === 'area' ? (
            <g>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {displayCandles.length > 1 && (
                <>
                  <path
                    d={`${buildLinePath(displayCandles.map((c) => c.close))} L ${indexToX(
                      displayCandles.length - 1
                    )} ${padTop + plotHeight} L ${indexToX(0)} ${padTop + plotHeight} Z`}
                    fill="url(#areaGrad)"
                  />
                  <path
                    d={buildLinePath(displayCandles.map((c) => c.close))}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </>
              )}
            </g>
          ) : (
            displayCandles.map((c, idx) => {
              const x = indexToX(idx);
              const candleW = Math.max(2.5, (plotWidth / displayCandles.length) * 0.68);
              const up = c.close >= c.open;
              const color = up ? '#10B981' : '#F43F5E';
              const highY = priceToY(c.high);
              const lowY = priceToY(c.low);
              const openY = priceToY(c.open);
              const closeY = priceToY(c.close);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

              return (
                <g key={c.time}>
                  <line
                    x1={x}
                    y1={highY}
                    x2={x}
                    y2={lowY}
                    stroke={color}
                    strokeWidth="1.2"
                  />
                  <rect
                    x={x - candleW / 2}
                    y={bodyTop}
                    width={candleW}
                    height={bodyHeight}
                    fill={color}
                    rx="0.5"
                  />
                </g>
              );
            })
          )}

          {/* EMA 20 & EMA 50 Lines */}
          {showEma20 && (
            <path
              d={buildLinePath(ema20)}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.6"
            />
          )}
          {showEma50 && (
            <path
              d={buildLinePath(ema50)}
              fill="none"
              stroke="#38BDF8"
              strokeWidth="1.6"
            />
          )}

          {/* User Drawings */}
          {drawings.map((d) => {
            const x1 = indexToX(Math.min(displayCandles.length - 1, Math.max(0, d.p1.index)));
            const y1 = priceToY(d.p1.price);
            const x2 = indexToX(Math.min(displayCandles.length - 1, Math.max(0, d.p2.index)));
            const y2 = priceToY(d.p2.price);

            if (d.type === 'horizontal') {
              return (
                <g key={d.id}>
                  <line
                    x1={padLeft}
                    y1={y1}
                    x2={width - padRight}
                    y2={y1}
                    stroke={d.color}
                    strokeWidth="1.5"
                  />
                </g>
              );
            }
            return (
              <g key={d.id}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={d.color} strokeWidth="2" />
              </g>
            );
          })}

          {/* Real-Time Live Market Price Line & Pulsing Axis Badge */}
          {displayCandles.length > 0 && (() => {
            const currentPrice = instrument.price;
            const currentY = Math.max(padTop, Math.min(padTop + plotHeight, priceToY(currentPrice)));
            const lastCandle = displayCandles[displayCandles.length - 1];
            const isUpNow = currentPrice >= lastCandle.open;
            const liveColor = isUpNow ? '#10B981' : '#F43F5E';

            return (
              <g key="live-price-tracker">
                {/* Horizontal Dashed Live Price Line */}
                <line
                  x1={padLeft}
                  y1={currentY}
                  x2={width - padRight}
                  y2={currentY}
                  stroke={liveColor}
                  strokeDasharray="3 3"
                  strokeWidth="1.2"
                  opacity="0.9"
                />

                {/* Pulsing Dot at Chart Edge */}
                <circle
                  cx={width - padRight}
                  cy={currentY}
                  r="3.5"
                  fill={liveColor}
                  opacity="0.8"
                />

                {/* Right Axis Live Price Badge */}
                <rect
                  x={width - padRight + 2}
                  y={currentY - 9}
                  width={padRight - 4}
                  height="18"
                  fill={liveColor}
                  rx="2"
                />
                <text
                  x={width - padRight + 6}
                  y={currentY + 3.5}
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="bold"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {currentPrice.toFixed(instrument.decimals)}
                </text>
              </g>
            );
          })()}

          {/* Sub-Indicator Pane (RSI or MACD) */}
          {subIndicator !== 'none' && (
            <g transform={`translate(0, ${mainHeight})`}>
              <line x1={0} y1={0} x2={width} y2={0} stroke="#1E293B" strokeWidth="1.5" />
              {subIndicator === 'rsi' ? (
                <>
                  <text x={padLeft + 4} y={14} fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
                    RSI (14): {activeRsi !== null && activeRsi !== undefined ? activeRsi.toFixed(2) : '—'}
                  </text>
                  <path
                    d={(() => {
                      let d = '';
                      rsi.forEach((v, i) => {
                        if (v === null) return;
                        const x = indexToX(i);
                        const y = 16 + ((100 - v) / 100) * (subHeight - 24);
                        d += d === '' ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
                      });
                      return d;
                    })()}
                    fill="none"
                    stroke="#A855F7"
                    strokeWidth="1.6"
                  />
                </>
              ) : (
                <text x={padLeft + 4} y={14} fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace">
                  MACD Active
                </text>
              )}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
