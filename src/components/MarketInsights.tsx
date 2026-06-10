import React, { useState } from "react";
import { MarketInsightResult } from "../types";
import { REGIONS_AND_CITIES } from "../data";
import { 
  BarChart, 
  Sparkles, 
  TrendingUp, 
  ShieldAlert, 
  Droplet, 
  MapPin, 
  Activity, 
  RefreshCw,
  Award
} from "lucide-react";

export default function MarketInsights() {
  const [region, setRegion] = useState("Maharashtra");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [insight, setInsight] = useState<MarketInsightResult | null>({
    marketStatus: "Monsoon Surge (Peak Demand)",
    regionalIndexScore: 82,
    dieselPriceStatus: "₹92.10 - ₹94.15 per litre (excise stable)",
    seasonalImpact: "Heavy downpours on Western Ghats highways (Kasara/Karjat) slowing general dispatches. Agricultural outbound wheat and foodstuff dispatches from Vidarbha reaching steady premiums.",
    busyCorridors: [
      "Mumbai to Delhi (NH48) - FMCG/Auto parts",
      "Pune to Bengaluru - Industrial Machinery",
      "Nagpur to Chennai - Agricultural Produce"
    ],
    marketAdvice: "Avoid holding out too long for return loads on Western routes; negotiate double tarpaulin rain cover loading bonuses to secure 10-15% surplus premiums in the coming 2 weeks."
  });

  const handleFetchInsights = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/market-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region })
      });

      if (!response.ok) {
        throw new Error("Unable to contact market intelligence server. Using cached baseline indexing.");
      }

      const data = await response.json();
      setInsight(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred with Gemini.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="market-insights-tab-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6 gap-4">
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500 animate-pulse" />
            Indian Freight Corridor Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Consult Gemini AI server reviews regarding real-time state taxation updates, agricultural harvest cycles, monsoons, and industrial demand spikes.
          </p>
        </div>
        
        {/* State select header */}
        <form onSubmit={handleFetchInsights} className="flex gap-2 w-full md:w-auto" id="insights-form">
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-sans"
          >
            {["Maharashtra", "National Corridor (All India)", "Delhi-NCR Hub", "Tamil Nadu / South Corridor", "West Bengal", "Gujarat Corridor", "Punjab / Haryana"].map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1 text-xs rounded-lg flex items-center gap-1 transition disabled:opacity-50 cursor-pointer text-nowrap"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3 animate-spin" />
                fetching...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Analyze Corridor
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800 text-red-200 rounded-lg p-3 text-xs mb-6 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {insight && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" id="insights-content">
          {/* Outbound Corridors list */}
          <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-500" /> Highly Active Outbound lanes
            </h3>
            
            <div className="space-y-3">
              {insight.busyCorridors.map((c, i) => (
                <div key={i} className="flex gap-2 text-xs text-slate-300 font-medium">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0" />
                  <span>{c}</span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-900 text-[11px] text-slate-400 leading-relaxed font-sans">
              <strong>Corridor Note:</strong> Outbound lanes specify corridors experiencing truck capacity shortages. Drivers can easily request premium pricing margins on these specific pipelines.
            </div>
          </div>

          {/* Core Analytics parameters */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Active Demand index</span>
                <span className="text-lg font-bold text-amber-400 mt-1 block">{insight.marketStatus}</span>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold">Traffic Volume Score</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-xl font-bold font-mono text-slate-200">{insight.regionalIndexScore}</span>
                  <span className="text-xs text-slate-500 font-mono">/100</span>
                </div>
              </div>
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 col-span-2 md:col-span-1">
                <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold flex items-center gap-1">
                  <Droplet className="w-3.5 h-3.5 text-blue-400 shrink-0" /> Diesel (HSD) Price
                </span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block leading-normal">{insight.dieselPriceStatus}</span>
              </div>
            </div>

            {/* Weather / Seasonal commentary */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-semibold text-amber-500/90 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                Seasonal Agricultural & Weather Forecasts
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{insight.seasonalImpact}</p>
            </div>

            {/* Mitra Recommendation advice */}
            <div className="bg-emerald-950/30 border border-emerald-800/80 p-5 rounded-xl">
              <h4 className="text-xs font-bold text-emerald-400 mb-1.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                MITRA STRATEGIC TRANSPORT ADVISORY
              </h4>
              <span className="text-xs text-emerald-300 font-sans leading-relaxed block font-medium">
                {insight.marketAdvice}
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
