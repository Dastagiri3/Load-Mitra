import React, { useState } from "react";
import { Load, Truck, Bid, KYCProfile } from "../types";
import { REGIONS_AND_CITIES, TRUCK_TYPES, MATERIAL_TYPES } from "../data";
import { 
  Briefcase, 
  Search, 
  MapPin, 
  IndianRupee, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Sparkles, 
  SlidersHorizontal,
  PlusCircle,
  TrendingDown,
  Calendar,
  MessageCircle,
  CheckCircle2,
  Lock,
  Plus,
  Truck as TruckIcon
} from "lucide-react";

interface MarketplaceBoardProps {
  loads: Load[];
  trucks: Truck[];
  currentProfile: KYCProfile;
  currentUser: any;
  sandboxMode?: boolean;
  onChangeProfile: (profile: KYCProfile) => void;
  onAddBid: (loadId: string, bid: Bid) => void;
  onAcceptBid: (loadId: string, bidId: string) => void;
  onRegisterTruck: (truck: Truck) => void;
  onSelectTab: (tab: string) => void;
}

export default function MarketplaceBoard({ 
  loads, 
  trucks, 
  currentProfile, 
  currentUser,
  sandboxMode,
  onChangeProfile,
  onAddBid, 
  onAcceptBid, 
  onRegisterTruck,
  onSelectTab 
}: MarketplaceBoardProps) {
  
  // Board states: 'loads' | 'trucks'
  const [boardType, setBoardType] = useState<'loads' | 'trucks'>('loads');
  
  // Filtering & Search
  const [search, setSearch] = useState("");
  const [filterOrigin, setFilterOrigin] = useState("All");
  const [filterDest, setFilterDest] = useState("All");
  const [filterTruck, setFilterTruck] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Active expanded listing details
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);

  // Bidding input
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidMsg, setBidMsg] = useState("");

  // Register Truck state modal/form
  const [showRegisterTruck, setShowRegisterTruck] = useState(false);
  const [regDriver, setRegDriver] = useState(currentProfile.fullName || "");
  const [regPhone, setRegPhone] = useState(currentProfile.phone || "");
  const [regTruckNo, setRegTruckNo] = useState("DL-3C-S-5524");
  const [regTruckType, setRegTruckType] = useState(TRUCK_TYPES[0]);
  const [regCapacity, setRegCapacity] = useState(15);
  const [regLocation, setRegLocation] = useState(REGIONS_AND_CITIES[0]);
  const [regPreferred, setRegPreferred] = useState(REGIONS_AND_CITIES[1]);

  // Contact modal simulation
  const [contactInfo, setContactInfo] = useState<{ name: string; phone: string; title: string } | null>(null);

  // Derived state for Role-Based Dashboards
  const myLoads = loads.filter(l => 
    (currentUser?.uid && l.createdBy === currentUser.uid) || 
    (currentProfile.phone && l.shipperPhone === currentProfile.phone && currentProfile.fullName !== "Transporter Partner")
  );

  const myBidsReceivedCount = myLoads.reduce((sum, l) => sum + (l.bids ? l.bids.length : 0), 0);

  const myTrucks = trucks.filter(t => 
    (currentUser?.uid && t.createdBy === currentUser.uid) || 
    (currentProfile.phone && t.driverPhone === currentProfile.phone)
  );

  // Find all bids/interests placed by this transporter
  const myBids: { load: Load; bid: Bid }[] = [];
  loads.forEach(l => {
    if (l.bids) {
      l.bids.forEach(b => {
        if (
          (currentUser?.uid && b.createdBy === currentUser.uid) || 
          (currentProfile.phone && b.transporterPhone === currentProfile.phone)
        ) {
          myBids.push({ load: l, bid: b });
        }
      });
    }
  });

  const toggleExpandLoad = (loadId: string, defaultProposal: number) => {
    if (expandedLoadId === loadId) {
      setExpandedLoadId(null);
    } else {
      setExpandedLoadId(loadId);
      setBidAmount(defaultProposal - 1500); // Prepopulate slightly below list price
    }
  };

  const handlePostBid = (e: React.FormEvent, loadId: string) => {
    e.preventDefault();
    if (bidAmount <= 0) return;

    const newBid: Bid = {
      id: `bid_${Date.now()}`,
      loadId,
      bidAmount,
      transporterName: currentProfile.fullName || "Transporter Mitra",
      transporterPhone: currentProfile.phone || "+91 9988776655",
      truckDetails: `${currentProfile.dlVerified ? '✓ Verified ' : ''}Transporter Truck`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      createdBy: currentUser?.uid || "guest"
    };

    onAddBid(loadId, newBid);
    setBidMsg("Your quote (bid) has been posted successfully to the shipper! They will review it shortly.");
    setTimeout(() => setBidMsg(""), 4000);
  };

  const handleRegisterTruckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regDriver || !regPhone || !regTruckNo) {
      alert("Please fill in driver background fields.");
      return;
    }

    const newTruck: Truck = {
      id: `truck_${Date.now()}`,
      driverName: regDriver,
      driverPhone: regPhone,
      truckNo: regTruckNo,
      truckType: regTruckType,
      capacity: regCapacity,
      currentLocation: regLocation,
      preferredRoute: regPreferred,
      isVerified: currentProfile.aadhaarVerified || false,
      status: 'available',
      activeDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    onRegisterTruck(newTruck);
    setShowRegisterTruck(false);
    setBoardType('trucks');
    
    // Quick notification alert simulation
    alert(`Success! Truck ${regTruckNo} has been listed. Shippers looking for routes to ${regPreferred} can now contact you directly.`);
  };

  // Filter lists based on states
  const filteredLoads = loads.filter(l => {
    if (l.status !== 'active') return false; // Filter active only
    const matchSearch = l.material.toLowerCase().includes(search.toLowerCase()) || 
                        l.origin.toLowerCase().includes(search.toLowerCase()) || 
                        l.destination.toLowerCase().includes(search.toLowerCase());
    const matchOrigin = filterOrigin === "All" || l.origin === filterOrigin;
    const matchDest = filterDest === "All" || l.destination === filterDest;
    const matchTruck = filterTruck === "All" || l.truckType === filterTruck;
    return matchSearch && matchOrigin && matchDest && matchTruck;
  });

  const filteredTrucks = trucks.filter(t => {
    const matchSearch = t.driverName.toLowerCase().includes(search.toLowerCase()) || 
                        t.truckNo.toLowerCase().includes(search.toLowerCase()) || 
                        t.currentLocation.toLowerCase().includes(search.toLowerCase()) || 
                        t.preferredRoute.toLowerCase().includes(search.toLowerCase());
    const matchOrigin = filterOrigin === "All" || t.currentLocation === filterOrigin;
    const matchDest = filterDest === "All" || t.preferredRoute === filterDest;
    const matchTruck = filterTruck === "All" || t.truckType === filterTruck;
    return matchSearch && matchOrigin && matchDest && matchTruck;
  });

  return (
    <div className="space-y-6" id="marketplace-board">
      
      {/* Board Selector & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setBoardType('loads')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
              boardType === 'loads' 
                ? 'bg-amber-500 text-slate-950 font-black shadow' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            📦 Active Cargo Loads ({filteredLoads.length})
          </button>
          
          <button
            onClick={() => setBoardType('trucks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 flex items-center gap-1.5 cursor-pointer ${
              boardType === 'trucks' 
                ? 'bg-amber-500 text-slate-950 font-black shadow' 
                : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🚚 Truck Directory ({filteredTrucks.length})
          </button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {boardType === 'loads' ? (
            <button
              onClick={() => onSelectTab('post-load')}
              className="bg-amber-600/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 w-full sm:w-auto justify-center transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Post New Cargo Load
            </button>
          ) : (
            <button
              onClick={() => {
                setRegDriver(currentProfile.fullName);
                setRegPhone(currentProfile.phone);
                setShowRegisterTruck(true);
              }}
              className="bg-amber-600/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1 w-full sm:w-auto justify-center transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Register Available Truck
            </button>
          )}
        </div>
      </div>

      {/* 🟢 SHIPPER DASHBOARD HOME VIEW */}
      {currentProfile.role === "shipper" && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl" id="shipper-role-dashboard">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Briefcase className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Shipper Portal Control Center</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage posted logistics cargos, review carrier bids, and hire directly.</p>
              </div>
            </div>
            
            <button
              onClick={() => onSelectTab("post-load")}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-lg w-full sm:w-auto justify-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Cargo Load</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-slate-905/70 border border-slate-800/60 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">My Posted Cargos</span>
              <span className="block text-xl font-bold font-mono text-emerald-400">{myLoads.length + (sandboxMode ? 1 : 0)}</span>
            </div>
            <div className="bg-slate-905/70 border border-slate-800/60 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">Carrier Quote Inquiries</span>
              <span className="block text-xl font-bold font-mono text-amber-500">{myBidsReceivedCount + (sandboxMode ? 2 : 0)}</span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-slate-905/70 border border-slate-800/60 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">My Active Shipments</span>
              <span className="block text-xl font-bold font-mono text-blue-400">
                {loads.filter(l => l.status === 'booked' || l.status === 'in_transit').length}
              </span>
            </div>
          </div>

          {/* My Posted Cargos List & Live Carrier Quotes */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">My Active Cargo Listings ({myLoads.length})</h4>
            
            {myLoads.length === 0 ? (
              <div className="p-6 bg-slate-950/40 text-center rounded-xl border border-slate-850/60">
                <p className="text-xs text-slate-500 italic">No active cargo listing posted yet under this profile.</p>
                <button
                  onClick={() => onSelectTab("post-load")}
                  className="mt-2 text-emerald-400 hover:underline text-xs font-bold font-mono inline-block"
                >
                  Post your first cargo requirement now →
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {myLoads.map(load => (
                  <div key={`my-l-${load.id}`} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-200">{load.material} ({load.weight} Tons)</span>
                          <span className="bg-emerald-950/40 border border-emerald-900 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide text-emerald-400 font-mono font-bold">
                            {load.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>{load.origin}</span>
                          <span>→</span>
                          <span>{load.destination}</span>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[8px] text-slate-500 uppercase block">My Target Budget Rate</span>
                        <span className="font-mono font-bold text-emerald-400 text-xs">₹{load.priceProposal.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Received Bids for this load */}
                    <div className="border-t border-slate-800/60 pt-2.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
                        Quotes & Inquiry Interests ({load.bids.length})
                      </span>
                      
                      {load.bids.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic">Waiting for transporters to send inquiry proposals...</p>
                      ) : (
                        <div className="space-y-2">
                          {load.bids.map(bid => (
                            <div key={`bid-item-${bid.id}`} className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-200">{bid.transporterName}</span>
                                  <span className="text-[9px] bg-slate-950 border border-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-400">
                                    {bid.truckDetails}
                                  </span>
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">Phone: {bid.transporterPhone}</span>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 border-slate-850/40 pt-2 sm:pt-0 w-full sm:w-auto">
                                <div className="text-left sm:text-right">
                                  <span className="text-[8px] text-slate-500 uppercase block">Offer rate</span>
                                  <span className="font-mono font-bold text-amber-400 text-xs">₹{bid.bidAmount.toLocaleString()}</span>
                                </div>
                                <button
                                  onClick={() => onAcceptBid(load.id, bid.id)}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wide transition shadow cursor-pointer"
                                >
                                  Accept Quote
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🟨 TRANSPORTER DASHBOARD HOME VIEW */}
      {currentProfile.role === "transporter" && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl" id="transporter-role-dashboard">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/85 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
                <TruckIcon className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Fleet & Transporter Dashboard</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Submit quotations, review shipper connections, register active vehicles.</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                setRegDriver(currentProfile.fullName);
                setRegPhone(currentProfile.phone);
                setShowRegisterTruck(true);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-lg w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>Register Active Vehicle</span>
            </button>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-slate-905/70 border border-slate-800/60 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono">My Fleet Size</span>
              <span className="block text-xl font-bold font-mono text-amber-400">{myTrucks.length}</span>
            </div>
            <div className="bg-slate-905/70 border border-slate-800/60 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono font-bold text-emerald-400">Total Bids Sent</span>
              <span className="block text-xl font-bold font-mono text-emerald-400">{myBids.length}</span>
            </div>
            <div className="col-span-2 md:col-span-1 bg-slate-905/70 border border-slate-800/60 p-3.5 rounded-xl text-center space-y-1">
              <span className="text-[9px] uppercase font-bold text-slate-400 font-mono text-blue-400">Total Verified Trips</span>
              <span className="block text-xl font-bold font-mono text-blue-400">
                {trucks.filter(t => t.status === 'booked' || t.status === 'on_trip').length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left: My Registered fleet */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">My Registered Vehicles ({myTrucks.length})</h4>
              {myTrucks.length === 0 ? (
                <div className="p-4 bg-slate-950/40 text-center rounded-xl border border-slate-850/60">
                  <p className="text-[11px] text-slate-500 italic">No registered vehicles listed yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {myTrucks.map(truck => (
                    <div key={`my-t-${truck.id}`} className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg flex justify-between items-center text-xs">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-200">{truck.truckNo}</span>
                          <span className="bg-slate-900 border border-slate-800 text-amber-400 text-[9px] px-1.5 py-0.1 rounded font-mono font-semibold">
                            {truck.truckType}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Route preferred: {truck.preferredRoute}</span>
                      </div>
                      <span className="bg-emerald-950/25 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wide">
                        {truck.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: My bid quotations */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">My Active Bid Quotes & Inquiries ({myBids.length})</h4>
              {myBids.length === 0 ? (
                <div className="p-4 bg-slate-950/40 text-center rounded-xl border border-slate-850/60">
                  <p className="text-[11px] text-slate-500 italic">No quotations sent to shippers yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {myBids.map(({ load, bid }) => (
                    <div key={`my-b-${bid.id}`} className="bg-slate-950/60 border border-slate-850 p-3 rounded-lg flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-slate-200 text-xs block">{load.material} ({load.weight}T)</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 font-semibold">
                            <MapPin className="w-3 h-3 text-red-500" />
                            {load.origin} → {load.destination}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-amber-400 text-xs">₹{bid.bidAmount.toLocaleString()}</span>
                          <span className="text-[8px] text-slate-550 uppercase block mt-0.5">My Bid Quote</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-900/40 pt-1.5 mt-0.5">
                        <span className="text-[9px] text-slate-450">Shipper Budget: <strong className="font-mono text-emerald-400">₹{load.priceProposal.toLocaleString()}</strong></span>
                        <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded ${
                          load.status === 'booked' 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/55' 
                            : 'bg-amber-950/40 text-amber-400 border border-amber-900/55'
                        }`}>
                          {load.status === 'booked' ? "Confirmed Booking" : "Awaiting Shipper"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search & Sliders */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder={
                boardType === 'loads' 
                  ? "Search cargo category (steel, food, chemicals) or cities..." 
                  : "Search driver names, registration, location or destinations..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-9 pr-4 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-amber-500 font-sans"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              showFilters 
                ? 'bg-amber-500 border-amber-500 text-slate-950' 
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced Filters</span>
          </button>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80 animate-fadeIn" id="advanced-filters-panel">
            <div>
              <label className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">PickUp (Origin)</label>
              <select
                value={filterOrigin}
                onChange={(e) => setFilterOrigin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
              >
                <option value="All">All Cities</option>
                {REGIONS_AND_CITIES.map(c => (
                  <option key={`f-org-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Delivery destination</label>
              <select
                value={filterDest}
                onChange={(e) => setFilterDest(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
              >
                <option value="All">All Destinations</option>
                {REGIONS_AND_CITIES.map(c => (
                  <option key={`f-dst-${c}`} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-semibold uppercase tracking-wider mb-1">Truck Model Required</label>
              <select
                value={filterTruck}
                onChange={(e) => setFilterTruck(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
              >
                <option value="All">All Truck Models</option>
                {TRUCK_TYPES.map(t => (
                  <option key={`f-trk-${t}`} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Directory Content board */}
      {boardType === 'loads' ? (
        /* LOADS directory board */
        <div className="space-y-4" id="loads-directory-board">
          {filteredLoads.length === 0 ? (
            <div className="bg-slate-950/40 p-12 text-center rounded-2xl border border-slate-800">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No active cargo loads match your filters.</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting the search filters or check all cities.</p>
            </div>
          ) : (
            filteredLoads.map((load) => {
              const isExpanded = expandedLoadId === load.id;
              
              return (
                <div 
                  key={load.id} 
                  className={`bg-slate-900 border rounded-xl overflow-hidden transition-all duration-200 ${
                    isExpanded ? 'border-amber-500 shadow-amber-500/5' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card head summary */}
                  <div 
                    onClick={() => toggleExpandLoad(load.id, load.priceProposal)}
                    className="p-5 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-850/50"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {load.suggestedLabel && (
                          <span className="bg-amber-500 text-slate-950 font-mono text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase shadow">
                            {load.suggestedLabel}
                          </span>
                        )}
                        <span className="text-slate-200 font-bold text-base">{load.material}</span>
                        <span className="text-slate-500 text-xs">|</span>
                        <span className="text-slate-400 text-xs font-mono">{load.weight} Tons</span>
                        
                        {load.isVerified && (
                          <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-800/50 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 font-sans">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                            Verified Mitra
                          </span>
                        )}
                      </div>

                      {/* Route Path Indicator */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mt-1 font-display">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{load.origin}</span>
                        <span className="text-slate-600 font-normal">→</span>
                        <span>{load.destination}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                      <div>
                        <span className="block text-[10px] text-slate-500 uppercase tracking-widest text-right">Offered Rate</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-mono text-lg font-bold">
                          ₹{load.priceProposal.toLocaleString()}
                          <span className="text-[10px] text-slate-400 font-normal">/all-in</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-center font-mono text-xs">
                          <span className="text-xs font-bold text-amber-500">{load.bids.length}</span>
                          <span className="text-[9px] block text-slate-500">Quotes</span>
                        </div>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expansive Details Drawer */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-slate-950/55 p-5 space-y-6 animate-slideDown">
                      
                      {/* AI detailed analysis review */}
                      {load.aiDescription && (
                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-800/80">
                          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                            <Sparkles className="w-4 h-4 fill-current text-amber-500" />
                            LoadMitra Intelligent Carrier Profile
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{load.aiDescription}</p>

                          {load.highlights && load.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-800/60">
                              {load.highlights.map((tag, i) => (
                                <span key={i} className="bg-amber-400/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold px-2 py-0.5 rounded font-mono">
                                  ✓ {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Required Truck Category</span>
                          <span className="text-xs font-bold text-slate-300 mt-1 block">{load.truckType}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Loading Placement Date</span>
                          <span className="text-xs font-semibold text-slate-300 mt-1 block flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                            {load.loadingDate}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Cargo Post Owner</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-semibold text-slate-300">{load.shipperName}</span>
                            {load.isVerified && <span className="text-emerald-400 text-xs">✓</span>}
                          </div>
                        </div>
                      </div>

                      {/* Additional Instructions */}
                      {load.instructions && (
                        <div className="text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                          <span className="font-semibold text-slate-300 block mb-1">Additional terms / Instructions:</span>
                          <p className="italic bg-slate-900/30 p-2.5 rounded border border-slate-900 text-[11px] leading-relaxed">
                            "{load.instructions}"
                          </p>
                        </div>
                      )}

                      {/* Transaction Action Area */}
                      <div className="border-t border-slate-800 pt-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* LEFT: Live Bidding Tool Container */}
                        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <TrendingDown className="w-4 h-4 text-emerald-400 animate-bounce" />
                            Place Direct Price Bid Quote
                          </h4>

                          {bidMsg && (
                            <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-[11px] p-2.5 rounded-lg mb-3">
                              {bidMsg}
                            </div>
                          )}

                          <form onSubmit={(e) => handlePostBid(e, load.id)} className="space-y-3">
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <IndianRupee className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                                <input
                                  type="number"
                                  placeholder="Your transport rate offer?"
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(Number(e.target.value))}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-8 pr-4 text-xs font-bold text-slate-200 outline-none focus:border-amber-500 font-mono"
                                />
                              </div>
                              <button
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 rounded-lg transition duration-150 cursor-pointer text-nowrap"
                              >
                                Post Quote
                              </button>
                            </div>

                            <div className="flex items-center gap-2 py-1">
                              <div className="h-px bg-slate-800/80 flex-1"></div>
                              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">OR</span>
                              <div className="h-px bg-slate-800/80 flex-1"></div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newBid: Bid = {
                                  id: `bid_${Date.now()}`,
                                  loadId: load.id,
                                  bidAmount: load.priceProposal,
                                  transporterName: currentProfile.fullName || "Transporter Mitra",
                                  transporterPhone: currentProfile.phone || "+91 9988776655",
                                  truckDetails: `${currentProfile.dlVerified ? '✓ DL Verified' : 'Transporter'} (Express Interest)`,
                                  timestamp: new Date().toISOString(),
                                  status: 'pending',
                                  createdBy: currentUser?.uid || "guest"
                                };
                                onAddBid(load.id, newBid);
                                setBidMsg(`⚡ Success! Expressed immediate interest at proposed ₹${load.priceProposal.toLocaleString()} freight rate directly to shipper.`);
                                setTimeout(() => setBidMsg(""), 5000);
                              }}
                              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-slate-950 font-black text-xs py-2.5 rounded-lg transition duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 shadow"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Express Instant Interest (At Target ₹{load.priceProposal.toLocaleString()})
                            </button>

                            <span className="block text-[10px] text-slate-500 text-center italic">
                              Shippers get notified immediately over our platform engine. No margins taken by LoadMitra.
                            </span>
                          </form>
                        </div>

                        {/* RIGHT: Active Bids List & Direct Contact */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-300 mb-2.5 uppercase tracking-wide">
                              Transporter Bid Quotes ({load.bids.length})
                            </h4>

                            {load.bids.length === 0 ? (
                              <p className="text-[11px] text-slate-500 italic bg-slate-900/30 p-3 rounded border border-slate-900">
                                No bids posted yet. Be the first to secure this cargo with your quote!
                              </p>
                            ) : (
                              <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                {load.bids.map((b) => (
                                  <div key={b.id} className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-900 flex justify-between items-center text-xs">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                                        <span>{b.transporterName}</span>
                                        <span className="text-[9px] font-normal text-slate-500">({b.truckDetails})</span>
                                      </div>
                                      <span className="text-[10px] font-mono text-slate-500">
                                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono font-bold text-amber-400">₹{b.bidAmount.toLocaleString()}</span>
                                      
                                      {/* If current user matches cargo company, they can accept bids */}
                                      <button
                                        onClick={() => onAcceptBid(load.id, b.id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-slate-100 font-bold text-[10px] px-2 py-1 rounded"
                                      >
                                        Accept Quote
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Direct Connection Block */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => setContactInfo({
                                name: load.shipperName,
                                phone: load.shipperPhone,
                                title: `Connect regarding ${load.material} cargo`
                              })}
                              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Phone className="w-4 h-4 text-amber-400" />
                              View Direct Contact
                            </button>
                            
                            <a
                              href={`https://wa.me/${load.shipperPhone.replace(/\D/g, "")}?text=Hello%20${load.shipperName},%20I%20am%20interested%20in%20your%20LoadMitra%20cargo%20from%20${load.origin}%20to%20${load.destination}%20for%20${load.material}.%20Can%20we%20negotiate%20directly?`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-600/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold px-3 py-2 rounded-lg text-xs flex items-center justify-center transition border border-emerald-500/30 font-semibold"
                            >
                              <MessageCircle className="w-4.5 h-4.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* TRUCKS Directory board */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="trucks-directory-board">
          {filteredTrucks.length === 0 ? (
            <div className="md:col-span-2 bg-slate-950/40 p-12 text-center rounded-2xl border border-slate-800">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No registered trucks match your route filters.</p>
              <p className="text-xs text-slate-500 mt-1">Try expanding your pick-up or vehicle category limits.</p>
            </div>
          ) : (
            filteredTrucks.map((truck) => (
              <div key={truck.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold bg-slate-950 text-amber-400 border border-slate-800 px-2 py-0.5 rounded uppercase tracking-wide">
                          {truck.truckNo}
                        </span>
                        {truck.isVerified && (
                          <span className="bg-emerald-950/20 text-emerald-400 border border-emerald-800/40 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Aadhaar Ok
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 mt-1">{truck.driverName}</h4>
                    </div>

                    <span className="bg-emerald-950/50 text-emerald-400 text-[10px] uppercase font-mono tracking-wider font-extrabold px-2.5 py-1 rounded border border-emerald-900">
                      {truck.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/50 p-2.5 rounded-lg border border-slate-950">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">Current Place</span>
                      <span className="block font-semibold text-slate-300 mt-0.5">{truck.currentLocation}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-semibold">Route Preference</span>
                      <span className="block font-semibold text-slate-300 mt-0.5">→ {truck.preferredRoute}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Truck Specs:</span>
                      <span className="block text-slate-300 text-[11px] mt-0.5">{truck.truckType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Payload Capacity:</span>
                      <span className="block font-mono text-slate-300 mt-0.5">{truck.capacity} Tons max</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-800/60">
                  <button
                    onClick={() => setContactInfo({
                      name: truck.driverName,
                      phone: truck.driverPhone,
                      title: `Inquire to hire vehicle details (${truck.truckNo})`
                    })}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold border border-slate-700 py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-500" />
                    Hire Directly
                  </button>
                  
                  <a
                    href={`https://wa.me/${truck.driverPhone.replace(/\D/g, "")}?text=Hello%20${truck.driverName},%20I%20saw%20your%20truck%20${truck.truckNo}%20on%20LoadMitra.%20Are%20you%20available%20for%20a%20cargo%20delivery%20towards%20${truck.preferredRoute}?`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center transition border border-emerald-500/20"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Register Truck Modal overlay */}
      {showRegisterTruck && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <h3 className="text-lg font-display font-semibold text-slate-100 flex items-center gap-2 mb-2">
              <TruckIcon className="w-5 h-5 text-amber-500" />
              Register Available Vehicle & Driver
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Declare your available truck location and payload limits. Shippers looking for vehicles heading along your corridor will contact you directly.
            </p>

            <form onSubmit={handleRegisterTruckSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Owner / Driver Name</label>
                  <input
                    type="text"
                    required
                    value={regDriver}
                    onChange={(e) => setRegDriver(e.target.value)}
                    placeholder="Enter name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Truck Registration No.</label>
                  <input
                    type="text"
                    required
                    value={regTruckNo}
                    onChange={(e) => setRegTruckNo(e.target.value.toUpperCase())}
                    placeholder="E.g. DL-01-A-1234"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Max Payload Cap (Ton)</label>
                  <input
                    type="number"
                    required
                    value={regCapacity}
                    onChange={(e) => setRegCapacity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-medium mb-1">Vehicle Body Specs</label>
                <select
                  value={regTruckType}
                  onChange={(e) => setRegTruckType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                >
                  {TRUCK_TYPES.map(t => (
                    <option key={`reg-t-${t}`} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Current Location Hub</label>
                  <select
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                  >
                    {REGIONS_AND_CITIES.map(c => (
                      <option key={`reg-loc-${c}`} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-1">Preferred Destination Route</label>
                  <select
                    value={regPreferred}
                    onChange={(e) => setRegPreferred(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"
                  >
                    {REGIONS_AND_CITIES.map(c => (
                      <option key={`reg-pref-${c}`} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRegisterTruck(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 px-4 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 px-5 rounded-lg text-xs cursor-pointer shadow"
                >
                  Register Truck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Contact details popover simulation */}
      {contactInfo && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-center">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6" />
            </div>
            
            <h4 className="text-sm font-semibold text-slate-400">{contactInfo.title}</h4>
            <div className="text-xl font-bold text-slate-100 mt-2">{contactInfo.name}</div>
            
            {/* Highlights direct contact with 0% extra broker code */}
            <div className="text-lg font-mono text-amber-400 font-bold tracking-wider mt-3 p-2 bg-slate-950 rounded-lg border border-slate-800">
              {contactInfo.phone}
            </div>

            <div className="bg-emerald-950/20 text-emerald-400 text-[10px] tracking-wide border border-emerald-900/60 p-2.5 rounded-lg mt-4 text-left leading-normal font-sans">
              <strong>🔒 Direct & Free Booking:</strong> This contact number is verified. Reach out directly via Phone/SMS. Feel free to transact directly with the transport partner.
            </div>

            <div className="mt-5 flex gap-2">
              <a
                href={`tel:${contactInfo.phone}`}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2 rounded-lg text-xs"
              >
                Call Now
              </a>
              <button
                onClick={() => setContactInfo(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2 rounded-lg text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
