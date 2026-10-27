import React, { useState } from 'react';
import { Instrument } from '../types/market';
import { Building2, TrendingUp, ShieldAlert, DollarSign, BarChart3, Award, ExternalLink } from 'lucide-react';

export const FundamentalAnalysisView: React.FC<{
    selectedInstrument: Instrument;
    allInstruments: Instrument[];
    onSelectInstrument: (symbol: string) => void;
    onJumpToChart: (symbol: string) => void;
}> = ({ selectedInstrument, allInstruments, onSelectInstrument, onJumpToChart }) => {
    const f = selectedInstrument.fundamentals;
    const [selectedTab, setSelectedTab] = useState<'overview' | 'financials' | 'analysts'>('overview');

    return (
        <div className="space-y-6">
            {/* Header / Asset Switcher Bar */}
            <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-base font-mono">
                        {selectedInstrument.displaySymbol.slice(0, 3)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-white">{selectedInstrument.name}</h1>
                            <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono rounded">
                                {selectedInstrument.symbol}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">
                            {f.sector} • {f.industry} • {f.headquarters}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedInstrument.symbol}
                        onChange={(e) => onSelectInstrument(e.target.value)}
                        className="bg-[#0B0F17] border border-slate-800 text-white rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-500"
                    >
                        {allInstruments.map(inst => (
                            <option key={inst.symbol} value={inst.symbol}>
                                {inst.displaySymbol} - {inst.name}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => onJumpToChart(selectedInstrument.symbol)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow"
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Buka Chart</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-800">
                <button
                    onClick={() => setSelectedTab('overview')}
                    className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                        selectedTab === 'overview'
                            ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Valuasi & Rasio Utama
                </button>
                <button
                    onClick={() => setSelectedTab('financials')}
                    className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                        selectedTab === 'financials'
                            ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Kinerja Kuartalan & Neraca
                </button>
                <button
                    onClick={() => setSelectedTab('analysts')}
                    className={`px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                        selectedTab === 'analysts'
                            ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                            : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    Konsensus Analis & Katalis
                </button>
            </div>

            {/* Tab Contents */}
            {selectedTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Valuation */}
                    <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">
                            <DollarSign className="w-4 h-4" />
                            <span>Valuasi Pasar</span>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Market Cap:</span>
                                <span className="text-white font-bold">{f.marketCap}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Enterprise Value:</span>
                                <span className="text-white font-bold">{f.enterpriseValue}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">P/E Ratio (TTM):</span>
                                <span className="text-white font-bold">{f.peRatio ? `${f.peRatio}x` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Forward P/E:</span>
                                <span className="text-white font-bold">{f.forwardPe ? `${f.forwardPe}x` : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Price to Book:</span>
                                <span className="text-white font-bold">{f.pbRatio ? `${f.pbRatio}x` : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Profitability */}
                    <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">
                            <TrendingUp className="w-4 h-4" />
                            <span>Profitabilitas & Margin</span>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">ROE (Return on Equity):</span>
                                <span className="text-emerald-400 font-bold">{f.roe}%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">ROA (Return on Assets):</span>
                                <span className="text-emerald-400 font-bold">{f.roa}%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Gross Margin:</span>
                                <span className="text-white font-bold">{f.grossMargin}%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Operating Margin:</span>
                                <span className="text-white font-bold">{f.operatingMargin}%</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Net Profit Margin:</span>
                                <span className="text-white font-bold">{f.netMargin}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Financial Health */}
                    <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-mono">
                            <Building2 className="w-4 h-4" />
                            <span>Kesehatan Keuangan</span>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Debt to Equity:</span>
                                <span className="text-white font-bold">{f.debtToEquity}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Current Ratio:</span>
                                <span className="text-white font-bold">{f.currentRatio}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Dividend Yield:</span>
                                <span className="text-white font-bold">{f.dividendYield}%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Free Cash Flow:</span>
                                <span className="text-white font-bold">${f.freeCashFlowBase}B</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Saham Beredar:</span>
                                <span className="text-white font-bold">{f.sharesOutstandingBillions}B</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Growth & Outlook */}
                    <div className="bg-[#111722] p-5 border border-slate-800 rounded-lg space-y-4">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider font-mono">
                            <Award className="w-4 h-4" />
                            <span>Pertumbuhan & Target</span>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Rev Growth YoY:</span>
                                <span className="text-emerald-400 font-bold">+{f.revenueGrowthYoY}%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">EPS Growth YoY:</span>
                                <span className="text-emerald-400 font-bold">+{f.epsGrowthYoY}%</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-800/80">
                                <span className="text-slate-400">Target Harga Analis:</span>
                                <span className="text-amber-400 font-bold">${f.analystTargetPrice}</span>
                            </div>
                            <div className="flex justify-between py-1">
                                <span className="text-slate-400">Konsensus:</span>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">
                                    {f.analystConsensus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'financials' && (
                <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg space-y-6">
                    <div>
                        <h3 className="text-md font-bold text-white mb-1">Ikhtisar Bisnis & Profil</h3>
                        <p className="text-slate-300 text-sm leading-relaxed">{f.description}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-6">
                        <h3 className="text-sm font-bold text-white font-mono mb-4 uppercase tracking-wider">Neraca & Kinerja Keuangan Historis</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-xs border-collapse">
                               <thead>
                                 <tr className="bg-[#0B0F17] border-b border-slate-800 text-slate-400">
                                   <th className="p-3">Periode</th>
                                   <th className="p-3 text-right">Pendapatan</th>
                                   <th className="p-3 text-right">Laba Kotor</th>
                                   <th className="p-3 text-right">Laba Operasi</th>
                                   <th className="p-3 text-right">Laba Bersih</th>
                                   <th className="p-3 text-right">EPS</th>
                                   <th className="p-3 text-right">Arus Kas Bebas</th>
                                 </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-800/80 text-slate-200">
                                 {f.quarterlyFinancials.length > 0 ? (
                                   f.quarterlyFinancials.map((q, idx) => (
                                     <tr key={idx} className="hover:bg-slate-800/40">
                                       <td className="p-3 font-bold text-white">{q.period}</td>
                                       <td className="p-3 text-right">${q.revenue}B</td>
                                       <td className="p-3 text-right">${q.grossProfit}B</td>
                                       <td className="p-3 text-right">${q.operatingIncome}B</td>
                                       <td className="p-3 text-right text-emerald-400">${q.netIncome}B</td>
                                       <td className="p-3 text-right font-bold">${q.eps}</td>
                                       <td className="p-3 text-right text-amber-400">${q.freeCashFlow}B</td>
                                     </tr>
                                   ))
                                 ) : (
                                   <tr>
                                     <td colSpan={7} className="p-6 text-center text-slate-500">
                                       Data laporan keuangan kuartalan tersedia untuk saham utama US & IDX.
                                     </td>
                                   </tr>
                                 )}
                               </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'analysts' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Analyst Consensus Breakdown */}
                    <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg space-y-6">
                        <h3 className="text-md font-bold text-white flex items-center gap-2">
                            <Award className="w-4 h-4 text-emerald-400" />
                            Rekomendasi Analis Wall Street ({f.analystConsensus})
                        </h3>

                        <div className="space-y-3 font-mono text-xs">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-emerald-400">Strong Buy</span>
                                    <span className="text-white font-bold">{f.analystBreakdown.strongBuy} Analis</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: `${(f.analystBreakdown.strongBuy / 50) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-blue-400">Buy</span>
                                    <span className="text-white font-bold">{f.analystBreakdown.buy} Analis</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                                    <div className="bg-blue-500 h-full" style={{ width: `${(f.analystBreakdown.buy / 50) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-amber-400">Hold</span>
                                    <span className="text-white font-bold">{f.analystBreakdown.hold} Analis</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                                    <div className="bg-amber-500 h-full" style={{ width: `${(f.analystBreakdown.hold / 50) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-rose-400">Sell</span>
                                    <span className="text-white font-bold">{f.analystBreakdown.sell} Analis</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded overflow-hidden">
                                    <div className="bg-rose-500 h-full" style={{ width: `${(f.analystBreakdown.sell / 50) * 100}%` }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-[#0B0F17] border border-slate-800 rounded-lg">
                            <div className="text-xs font-mono text-slate-400 mb-1 uppercase tracking-wider">Target Harga Konsensus (12 Bulan):</div>
                            <div className="text-2xl font-mono font-bold text-amber-400">${f.analystTargetPrice}</div>
                        </div>
                    </div>

                    {/* Catalysts & Risks */}
                    <div className="bg-[#111722] p-6 border border-slate-800 rounded-lg space-y-6">
                        <div>
                            <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-blue-400" />
                                Katalis Utama (Key Catalysts)
                            </h3>
                            <ul className="space-y-2 font-mono text-xs">
                                {f.keyCatalysts.map((cat, i) => (
                                    <li key={i} className="flex items-center gap-2 p-2.5 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                        <span>{cat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-md font-bold text-white mb-3 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-rose-400" />
                                Risiko Utama (Key Risks)
                            </h3>
                            <ul className="space-y-2 font-mono text-xs">
                                {f.keyRisks.map((risk, i) => (
                                    <li key={i} className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                                        <span>{risk}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
