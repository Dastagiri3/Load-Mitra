import React, { useState, useEffect } from "react";
import { Load, KYCProfile } from "../types";
import { REGIONS_AND_CITIES, TRUCK_TYPES, MATERIAL_TYPES } from "../data";
import { 
  PackagePlus, 
  Sparkles, 
  ShieldAlert, 
  Calendar, 
  MapPin, 
  Truck, 
  IndianRupee, 
  RefreshCw,
  PlusCircle,
  FileCheck
} from "lucide-react";

interface PostLoadFormProps {
  profile: KYCProfile;
  onPostLoad: (load: Load) => void;
  onSelectTab: (tab: string) => void;
}

export default function PostLoadForm({ profile, onPostLoad, onSelectTab }: PostLoadFormProps) {
  const [origin, setOrigin] = useState("Delhi NCR");
  const [destination, setDestination] = useState("Mumbai MMR");
  const [material, setMaterial] = useState(MATERIAL_TYPES[0]);
  const [weight, setWeight] = useState(12);
  const [truckType, setTruckType] = useState(TRUCK_TYPES[0]);
  const [loadingDate, setLoadingDate] = useState("2026-06-15");
  const [priceProposal, setPriceProposal] = useState(48000);
  const [instructions, setInstructions] = useState("Immediate loading, waterproof tarpaulin required. Direct payment after weight check slip clearance.");

  // AI-assists states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedDesc, setGeneratedDesc] = useState("");
  const [generatedHighlights, setGeneratedHighlights] = useState<string[]>([]);
  const [generatedLabel, setGeneratedLabel] = useState("");

  const handleGenerateAIDesc = async () => {
    if (origin === destination) {
      setAiError("Origin and Destination cannot be the same city for route description.");
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch("/api/gemini/generate-desc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          origin, 
          destination, 
          material, 
          weight, 
          truckType, 
          instructions 
        })
      });

      if (!response.ok) {
        throw new Error("Could not retrieve AI desc from backend. Please configure parameters.");
      }

      const data = await response.json();
      setGeneratedTitle(data.title || `${material} cargo from ${origin}`);
      setGeneratedDesc(data.formattedDescription || "");
      setGeneratedHighlights(data.keyHighlights || []);
      setGeneratedLabel(data.suggestedStatusLabel || "VERIFIED");
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An error occurred with Gemini.");
      // Fallback
      setGeneratedTitle(`Urgent ${material} transport (${weight}T)`);
      setGeneratedDesc(`Direct loading of ${material} from factory floor in ${origin} delivering straight to ${destination}. Required vehicle: ${truckType}. Driver fastag active, regular safety checks. Payment guaranteed on delivery receipt confirmation.`);
      setGeneratedHighlights(["Prompt Factory Loading", "Direct Deal", "Double-Tarp Needed"]);
      setGeneratedLabel("FAST DIRECT");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitLoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !material || !weight || !priceProposal) {
      setAiError("Please fill out route, weight, and freight listing price.");
      return;
    }

    const finalLoad: Load = {
      id: `load_${Date.now()}`,
      origin,
      destination,
      material,
      weight,
      truckType,
      loadingDate,
      priceProposal,
      shipperName: profile.fullName || "Corporate Shipper Mitra",
      shipperPhone: profile.phone || "+91 9900112233",
      isVerified: profile.aadhaarVerified || false,
      status: "active",
      bids: [],
      aiDescription: generatedDesc || `${material} load from ${origin} to ${destination}.`,
      highlights: generatedHighlights.length > 0 ? generatedHighlights : ["Direct Deal", "Direct Transporter Deal"],
      suggestedLabel: generatedLabel || "VERIFIED",
      instructions,
      createdAt: new Date().toISOString()
    };

    onPostLoad(finalLoad);
    
    // reset
    setGeneratedTitle("");
    setGeneratedDesc("");
    setGeneratedHighlights([]);
    setGeneratedLabel("");
    
    // redirect to marketplace board
    onSelectTab("boards-loads");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="post-load-tab-section">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
          <PackagePlus className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
            Post Cargo Freight Load
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Publish your active load to national transporter boards and negotiate prices directly with drivers.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitLoad} className="space-y-6" id="post-load-form">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" /> Pick-up Point (Origin)
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              {REGIONS_AND_CITIES.map(city => (
                <option key={`post-origin-${city}`} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-green-500" /> Drop-off Point (Destination)
            </label>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              {REGIONS_AND_CITIES.map(city => (
                <option key={`post-dest-${city}`} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1">Material Category</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              {MATERIAL_TYPES.map(mat => (
                <option key={`post-mat-${mat}`} value={mat}>{mat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1">Weight (Tons)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1">Date</label>
              <input
                type="date"
                value={loadingDate}
                onChange={(e) => setLoadingDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-blue-400" /> Required Truck Body Type
            </label>
            <select
              value={truckType}
              onChange={(e) => setTruckType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
            >
              {TRUCK_TYPES.map(t => (
                <option key={`post-truck-${t}`} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-medium mb-1 flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-400" /> Target Freight Rate Budget (₹)
            </label>
            <input
              type="number"
              min={100}
              placeholder="Total price in INR"
              value={priceProposal}
              onChange={(e) => setPriceProposal(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500 font-mono font-bold text-emerald-400"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerateAIDesc}
              disabled={aiLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold p-2.5 rounded-lg text-xs flex items-center justify-center gap-1 px-4 cursor-pointer shadow transition duration-200 disabled:opacity-50"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gemini Crafting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current animate-bounce" />
                  Apply Gemini AI Listings
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI-enhanced output card block */}
        {(generatedDesc || aiLoading) && (
          <div className="bg-slate-950/70 border border-amber-500/20 rounded-xl p-5 relative overflow-hidden" id="ai-generator-panel">
            <div className="absolute top-0 right-0 p-3 bg-amber-500/10 text-amber-400 rounded-bl-xl text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Gemini AI Optimized
            </div>

            {aiLoading ? (
              <div className="animate-pulse space-y-4 py-3">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-3/4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-slate-800 rounded w-16"></div>
                  <div className="h-6 bg-slate-800 rounded w-20"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Suggested Directory Title</span>
                  <p className="text-sm font-semibold text-amber-400 mt-1">{generatedTitle}</p>
                </div>

                <div>
                  <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Generated Hinglish Transporter Description</span>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-900 font-sans">
                    {generatedDesc}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Suggested Badges</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {generatedHighlights.map((hl, i) => (
                        <span key={i} className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {hl}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold">Priority Index Tag</span>
                    <div className="inline-block bg-teal-950 text-teal-400 border border-teal-800 text-[10px] font-mono tracking-widest font-black px-3 py-1 rounded mt-2 uppercase">
                      {generatedLabel}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-slate-400 text-xs font-medium mb-1">Additional Terms / Instructions</label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="E.g., No loading delay, direct weight slip payment..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onSelectTab("boards-loads")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 px-5 rounded-lg border border-slate-700 transition cursor-pointer"
          >
            Cancel Post
          </button>
          
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-6 rounded-lg text-xs flex items-center gap-1.5 transition duration-200 cursor-pointer shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Publish Load (0% Commission)
          </button>
        </div>
      </form>
    </div>
  );
}
