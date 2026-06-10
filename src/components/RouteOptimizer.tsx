import React, { useState } from "react";
import { RouteOptimizationResult } from "../types";
import { REGIONS_AND_CITIES, TRUCK_TYPES, MATERIAL_TYPES } from "../data";
import { 
  Navigation, 
  MapPin, 
  Truck, 
  ShieldAlert, 
  Clock, 
  IndianRupee, 
  Zap, 
  Calculator, 
  ChevronRight, 
  RefreshCw,
  Award
} from "lucide-react";

export default function RouteOptimizer() {
  const [origin, setOrigin] = useState("Mumbai MMR");
  const [destination, setDestination] = useState("Delhi NCR");
  const [truckType, setTruckType] = useState(TRUCK_TYPES[0]);
  const [material, setMaterial] = useState(MATERIAL_TYPES[0]);
  const [weight, setWeight] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteOptimizationResult | null>({
    recommendedFreightRateRange: "₹52,000 - ₹58,000 total",
    totalEstimatedFareINR: 55000,
    estimatedDistanceKm: 1415,
    estimatedDurationHours: 32,
    primaryHighway: "NH48 (Golden Quadrilateral Corridor)",
    majorStops: ["Surat (Gujarat)", "Udaipur (Rajasthan)", "Jaipur (Rajasthan)", "Gurgaon (Haryana)"],
    tollPlazasCount: 18,
    safetyTips: [
      "Monsoon alert: Expect waterlogging on Surat-Ahmedabad bypasses. Keep tarpaulins tightly tensioned.",
      "Ghat driving: Use low-gear brakes when descending the Kasara and Shamlaji curves.",
      "Checkpoints: Keep verified e-way bills and driver KYC ready for the Maharashtra-Gujarat RTO border."
    ],
    optimizedSummary: "This NH48 route connects Mumbai's JNPT port area to Delhi's main warehousing hubs in Bilaspur/Gurgaon. Driving through Gujarat has excellent, wide road conditions, while Rajasthan bypasses have some urban bypass congestion."
  });

  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (origin === destination) {
      setError("Origin and Destination cannot be the same city.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/gemini/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, truckType, weight, material })
      });
      
      if (!response.ok) {
        throw new Error("Logistics route optimization failed. Please try again.");
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while communicating with Gemini API.");
    } finally {
      setLoading(false);
    }
  };

  // Cost calculator variables
  const estimatedFuelCost = result ? Math.round(result.estimatedDistanceKm * 0.12 * 94) : 0; // 12L/100km, ₹94/litre

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl border border-slate-800" id="route-optimizer-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold text-amber-400 flex items-center gap-2">
            <Navigation className="w-6 h-6 text-amber-500 animate-pulse" />
            Gemini AI Route & Rate Optimizer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Calculate accurate distance, fuel costs, toll counts, and genuine market prices across India with zero extra commissions.
          </p>
        </div>
        <div className="bg-emerald-950/80 border border-emerald-800 rounded-lg px-3 py-1.5 mt-3 md:mt-0 flex items-center gap-2 text-xs text-emerald-400">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>Direct & Transparent Deal</span>
        </div>
      </div>

      <form onSubmit={handleOptimize} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 mb-6" id="optimizer-form">
        <div className="md:col-span-1">
          <label className="block text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-red-500" /> Origin City
          </label>
          <select 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500"
          >
            {REGIONS_AND_CITIES.map(city => (
              <option key={`origin-${city}`} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-green-500" /> Destination City
          </label>
          <select 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500"
          >
            {REGIONS_AND_CITIES.map(city => (
              <option key={`dest-${city}`} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
            <Truck className="w-3 h-3 text-blue-400" /> Truck Model
          </label>
          <select 
            value={truckType} 
            onChange={(e) => setTruckType(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500"
          >
            {TRUCK_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="col-span-1 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1">
              Weight (Ton)
            </label>
            <input 
              type="number" 
              value={weight} 
              min={1} 
              max={50}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1">
              Cargo Type
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              {MATERIAL_TYPES.map(mat => (
                <option key={mat} value={mat}>{mat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="md:col-span-1 flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg p-2 text-xs flex items-center justify-center gap-2 transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Planning Route...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Analyze Highway
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl p-4 text-xs mb-6 flex items-center gap-2" id="optimizer-error">
          <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="calculation-results">
          {/* Main Highway Stats and Tolls */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Distance</span>
                  <span className="font-mono text-lg font-semibold text-slate-200">
                    {result.estimatedDistanceKm.toLocaleString()} Km
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Driving Time</span>
                  <span className="font-mono text-lg font-semibold text-slate-200">
                    ~{result.estimatedDurationHours} Hrs
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
                <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Tolls Count</span>
                  <span className="font-mono text-lg font-semibold text-slate-200">
                    {result.tollPlazasCount} Plazas
                  </span>
                </div>
              </div>
            </div>

            {/* Path visualization */}
            <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
                <span>Recommended Path:</span>
                <span className="text-amber-400 font-mono text-sm tracking-normal">{result.primaryHighway}</span>
              </h3>
              
              <div className="relative flex flex-wrap items-center gap-2 pl-2">
                <div className="bg-amber-500/20 text-amber-300 font-mono text-xs font-semibold px-2.5 py-1 rounded-md border border-amber-500/30">
                  {origin}
                </div>
                {result.majorStops.map((stop, i) => (
                  <React.Fragment key={stop}>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                    <div className="bg-slate-900 text-slate-300 text-xs px-2.5 py-1 rounded-md border border-slate-800 hover:border-slate-700 transition duration-150">
                      {stop}
                    </div>
                  </React.Fragment>
                ))}
                <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                <div className="bg-green-500/20 text-green-300 font-mono text-xs font-semibold px-2.5 py-1 rounded-md border border-green-500/30">
                  {destination}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 text-xs text-slate-400 leading-relaxed bg-slate-900/30 p-2.5 rounded-lg border border-slate-900">
                <span className="text-amber-500/90 font-medium">Mitra Guidance:</span> {result.optimizedSummary}
              </div>
            </div>

            {/* Warnings and driver advice */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-amber-950/30">
              <h4 className="text-xs font-semibold text-amber-500/90 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                HIGHWAY CHECKPOINT & SAFETY ADVISORY
              </h4>
              <div className="space-y-2">
                {result.safetyTips.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-800">
                    <span className="text-amber-500 font-mono">#{i + 1}</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Comparison Card */}
          <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <IndianRupee className="w-4 h-4 text-emerald-400" />
                Freight Tariff Rates Comparison
              </h3>

              <div className="text-center bg-slate-900/50 p-4 rounded-xl border border-slate-800 mb-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Genuine Market Freight Rate</p>
                <div className="text-2xl font-mono text-amber-400 font-bold tracking-tight mt-1">
                  {result.recommendedFreightRateRange}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Based on current diesel pricing & returning route traffic indexes.
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Avg. Diesel Fuel Costs (HSD):</span>
                  <span className="font-mono text-slate-300">~₹{estimatedFuelCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Toll FASTag Fees (Est.):</span>
                  <span className="font-mono text-slate-300">~₹{(result.tollPlazasCount * 280).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/80 p-4 rounded-xl text-center">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">LoadMitra Platform</span>
              <div className="text-3xl font-display text-emerald-400 font-black tracking-tight my-1">
                0% <span className="text-sm font-normal text-emerald-500">Service Fee</span>
              </div>
              <p className="text-[11px] text-emerald-300 leading-normal">
                Direct deal between truck owner and shipper. You keep the fully negotiated amount.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
