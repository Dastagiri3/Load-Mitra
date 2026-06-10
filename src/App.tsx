import React, { useState, useEffect } from "react";
import { Load, Truck, Booking, KYCProfile, Bid } from "./types";
import { SEED_LOADS, SEED_TRUCKS } from "./data";
import Header from "./components/Header";
import MarketplaceBoard from "./components/MarketplaceBoard";
import RouteOptimizer from "./components/RouteOptimizer";
import KYCVerification from "./components/KYCVerification";
import PostLoadForm from "./components/PostLoadForm";
import BookingsCatalog from "./components/BookingsCatalog";
import MarketInsights from "./components/MarketInsights";
import { 
  Briefcase, 
  Truck as TruckIcon, 
  Navigation, 
  Activity, 
  FileCheck, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  MapPin,
  Flame,
  UserCheck
} from "lucide-react";

// Firebase client system SDK bindings
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import FirebaseLogin from "./components/FirebaseLogin";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authInitialized, setAuthInitialized] = useState<boolean>(false);
  const [sandboxMode, setSandboxMode] = useState<boolean>(false);

  // PERSISTENCE ENGINE (Loads initial seed data or parses standard localStorage on local machines)
  const [loads, setLoads] = useState<Load[]>(() => {
    const saved = localStorage.getItem("loadmitra_loads");
    return saved ? JSON.parse(saved) : SEED_LOADS;
  });

  const [trucks, setTrucks] = useState<Truck[]>(() => {
    const saved = localStorage.getItem("loadmitra_trucks");
    return saved ? JSON.parse(saved) : SEED_TRUCKS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("loadmitra_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentProfile, setCurrentProfile] = useState<KYCProfile>(() => {
    const saved = localStorage.getItem("loadmitra_profile");
    return saved ? JSON.parse(saved) : {
      fullName: "Harpreet Singh Sodhi",
      phone: "+91 9882001144",
      companyName: "Sher-E-Punjab Logistics Co",
      role: "transporter",
      aadhaarNo: "882420261199",
      aadhaarVerified: true,
      dlNo: "DL-14202611899120",
      dlVerified: true,
      gstNo: "27AAAAA1111A1Z1",
      gstVerified: false,
      isComplete: true
    };
  });

  const [activeTab, setActiveTab] = useState<string>("boards-loads");

  // Authentication observer link to Firebase Auth and Firestore profile sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setSandboxMode(false);
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setCurrentProfile({
              fullName: data.fullName || user.displayName || "Google Freight Partner",
              phone: data.phone || "",
              companyName: data.companyName || "Direct Logistics Partner",
              role: data.role || "transporter",
              aadhaarNo: data.aadhaarNo || "",
              aadhaarVerified: data.aadhaarVerified || false,
              dlNo: data.dlNo || "",
              dlVerified: data.dlVerified || false,
              gstNo: data.gstNo || "",
              gstVerified: data.gstVerified || false,
              isComplete: data.isComplete || true
            });
          } else {
            setCurrentProfile({
              fullName: user.displayName || "Mitra Driver",
              phone: user.phoneNumber || "",
              companyName: "Independent Fleet Operator",
              role: "transporter",
              aadhaarNo: "",
              aadhaarVerified: false,
              dlNo: "",
              dlVerified: false,
              gstNo: "",
              gstVerified: false,
              isComplete: true
            });
          }
        } catch (err) {
          console.error("Error retrieving Firestore profile document: ", err);
        }
      } else {
        setCurrentUser(null);
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (sandboxMode) {
      setSandboxMode(false);
      setCurrentUser(null);
    } else {
      try {
        await signOut(auth);
        setCurrentUser(null);
      } catch (err) {
        console.error("Firebase Sign-Out failure: ", err);
      }
    }
  };

  const handleEnterSandbox = () => {
    setSandboxMode(true);
    setCurrentUser({
      uid: "sandbox-trial-uid-100",
      email: "sandbox-trial@loadmitra.in",
      displayName: "Harpreet Singh Sodhi"
    });
    setCurrentProfile({
      fullName: "Harpreet Singh Sodhi",
      phone: "+91 9882001144",
      companyName: "Sher-E-Punjab Logistics Co",
      role: "transporter",
      aadhaarNo: "882420261199",
      aadhaarVerified: true,
      dlNo: "DL-14202611899120",
      dlVerified: true,
      gstNo: "27AAAAA1111A1Z1",
      gstVerified: false,
      isComplete: true
    });
  };

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem("loadmitra_loads", JSON.stringify(loads));
  }, [loads]);

  useEffect(() => {
    localStorage.setItem("loadmitra_trucks", JSON.stringify(trucks));
  }, [trucks]);

  useEffect(() => {
    localStorage.setItem("loadmitra_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("loadmitra_profile", JSON.stringify(currentProfile));
  }, [currentProfile]);

  // ACTIONS MACHINE CALLBACKS
  const handlePostLoad = (newL: Load) => {
    setLoads(prev => [newL, ...prev]);
  };

  const handleRegisterTruck = (newT: Truck) => {
    setTrucks(prev => [newT, ...prev]);
  };

  const handleAddBid = (loadId: string, newBid: Bid) => {
    setLoads(prevLoads => {
      return prevLoads.map(load => {
        if (load.id === loadId) {
          return {
            ...load,
            bids: [...load.bids, newBid]
          };
        }
        return load;
      });
    });
  };

  const handleAcceptBid = (loadId: string, bidId: string) => {
    // 1. Locate specific load and bid
    const targetLoad = loads.find(l => l.id === loadId);
    if (!targetLoad) return;
    const targetBid = targetLoad.bids.find(b => b.id === bidId);
    if (!targetBid) return;

    // 2. Mark load status as booked en-route
    setLoads(prev => prev.map(l => {
      if (l.id === loadId) {
        return {
          ...l,
          status: 'booked'
        };
      }
      return l;
    }));

    // 3. Sprout new Triplog Booking contract
    const newBooking: Booking = {
      id: `LM-BK-${Math.floor(100000 + Math.random() * 900000)}`,
      load: {
        ...targetLoad,
        status: 'booked'
      },
      finalPrice: targetBid.bidAmount,
      status: 'booked',
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    setActiveTab("bookings");
    
    // Quick notification alerts
    alert(`🎉 Quote Accepted! Booking generated on LoadMitra direct ledger for the amount of ₹${targetBid.bidAmount.toLocaleString()}. Go to Triplogs to track highway progress.`);
  };

  const handleUpdateBookingStatus = (bookingId: string, status: 'booked' | 'dispatched' | 'in_transit' | 'delivered') => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        return {
          ...bk,
          status
        };
      }
      return bk;
    }));
  };

  const handleUploadPOD = (bookingId: string, file: string) => {
    setBookings(prev => prev.map(bk => {
      if (bk.id === bookingId) {
        return {
          ...bk,
          status: 'delivered',
          podName: file,
          podUploadedAt: new Date().toISOString()
        };
      }
      return bk;
    }));
    
    alert(`✓ Proof of Delivery (POD) uploaded: "${file}". Shipments successfully marked as DELIVERED directly with cargo shipper.`);
  };

  // Counting operational active en-route bookings
  const activeBookingsCount = bookings.filter(b => b.status !== 'delivered').length;

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans antialiased" id="mitra-loading-pane">
        <div className="flex flex-col items-center gap-3">
          <TruckIcon className="w-12 h-12 text-amber-500 animate-bounce" />
          <h2 className="text-[10px] font-bold font-mono text-slate-450 tracking-widest uppercase">Initializing LoadMitra...</h2>
        </div>
      </div>
    );
  }

  if (!currentUser && !sandboxMode) {
    return (
      <FirebaseLogin 
        onSuccess={(profile, firebaseUser) => {
          setCurrentProfile(profile);
          setCurrentUser(firebaseUser);
          setSandboxMode(false);
        }}
        onEnterSandbox={handleEnterSandbox}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-950" id="main-application-container">
      
      {/* Styled Corporate Header Section */}
      <Header currentUser={currentUser} onLogout={handleLogout} />

      {/* Main Responsive Body Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT COLUMN: Sidebar Navigation Workspace Controls */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* User profile Summary widget Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-display font-extrabold shadow">
                {currentProfile.fullName.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold header-font">Your Profile</div>
                <div className="text-sm font-bold text-slate-200 truncate flex items-center gap-1.5">
                  {currentProfile.fullName}
                  {currentProfile.aadhaarVerified && (
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-amber-500 font-mono capitalize">
                  {currentProfile.role}: {currentProfile.companyName}
                </span>
              </div>
            </div>

            {/* Quick status badges */}
            <div className="border-t border-slate-800 pt-2.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">KYC Verify Grade:</span>
              {currentProfile.aadhaarVerified ? (
                <span className="text-emerald-400 font-bold bg-emerald-950/20 border border-emerald-900 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase flex items-center gap-0.5">
                  A-Grade Verified
                </span>
              ) : (
                <span className="text-amber-400 font-bold bg-amber-950/20 border border-amber-900 px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                  Pending
                </span>
              )}
            </div>
          </div>

          {/* Nav Links Stack Card */}
          <div className="bg-slate-900 border border-[#1e293b] rounded-2xl p-3 shadow-lg space-y-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold px-3 py-2 border-b border-slate-800/60 mb-2">
              Marketplace Workspaces
            </div>

            <button
              onClick={() => setActiveTab("boards-loads")}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-xs font-bold ${
                activeTab === "boards-loads" 
                  ? "bg-amber-500 text-slate-950" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4" />
                <span>Cargo Board Marketplace</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${activeTab === 'boards-loads' ? 'bg-slate-950/20' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                {loads.filter(l => l.status === 'active').length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("boards-trucks")}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-xs font-bold ${
                activeTab === "boards-trucks" 
                  ? "bg-amber-500 text-slate-950" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TruckIcon className="w-4 h-4" />
                <span>Available Trucks Directory</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${activeTab === 'boards-trucks' ? 'bg-slate-950/20' : 'bg-slate-950 text-slate-400 border border-slate-800'}`}>
                {trucks.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("optimizer")}
              className={`w-full flex items-center gap-2.5 p-3 rounded-xl transition text-xs font-bold ${
                activeTab === "optimizer" 
                  ? "bg-amber-500 text-slate-950" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>Route & Rate Optimizer</span>
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`w-full flex items-center gap-2.5 p-3 rounded-xl transition text-xs font-bold ${
                activeTab === "insights" 
                  ? "bg-amber-500 text-slate-950" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Freight Corridor Intelligence</span>
            </button>

            {/* Bookings catalog link */}
            <button
              onClick={() => setActiveTab("bookings")}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-xs font-bold ${
                activeTab === "bookings" 
                  ? "bg-amber-500 text-slate-950" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4" />
                <span>Triplog Active Bookings</span>
              </div>
              {activeBookingsCount > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === 'bookings' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
                }`}>
                  {activeBookingsCount}
                </span>
              )}
            </button>

            {/* KYC verified portal panel */}
            <button
              onClick={() => setActiveTab("kyc")}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition text-xs font-bold ${
                activeTab === "kyc" 
                  ? "bg-amber-500 text-slate-950" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Aadhaar KYC Portal</span>
              </div>
              {currentProfile.aadhaarVerified ? (
                <span className="text-emerald-500 text-xs shrink-0">✓ Verified</span>
              ) : (
                <span className="text-red-500 text-xs shrink-0 animate-pulse">! Action</span>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Active workspace render panel */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Workspaces router render */}
          {activeTab === "boards-loads" && (
            <MarketplaceBoard 
              loads={loads}
              trucks={trucks}
              currentProfile={currentProfile}
              onChangeProfile={setCurrentProfile}
              onAddBid={handleAddBid}
              onAcceptBid={handleAcceptBid}
              onRegisterTruck={handleRegisterTruck}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "boards-trucks" && (
            <MarketplaceBoard 
              loads={loads}
              trucks={trucks}
              currentProfile={currentProfile}
              onChangeProfile={setCurrentProfile}
              onAddBid={handleAddBid}
              onAcceptBid={handleAcceptBid}
              onRegisterTruck={handleRegisterTruck}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "optimizer" && (
            <RouteOptimizer />
          )}

          {activeTab === "insights" && (
            <MarketInsights />
          )}

          {activeTab === "kyc" && (
            <KYCVerification 
              profile={currentProfile}
              onChangeProfile={setCurrentProfile}
            />
          )}

          {activeTab === "post-load" && (
            <PostLoadForm 
              profile={currentProfile}
              onPostLoad={handlePostLoad}
              onSelectTab={setActiveTab}
            />
          )}

          {activeTab === "bookings" && (
            <BookingsCatalog 
              bookings={bookings}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onUploadPOD={handleUploadPOD}
            />
          )}

        </div>

      </main>

      {/* Styled Footer with deep bottom padding on mobile view to accommodate sticky menu reach */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 pb-24 lg:pb-6 text-center text-xs text-slate-500 space-y-2">
        <p>© 2026 LoadMitra India Transport Technologies Inc. All direct deals verified via National Aadhaar records.</p>
        <p className="font-mono text-[10px] text-slate-650">
          Powered by Gemini 3.5 AI Logistics Engine • Commission-Free Transport Platform • 🇮🇳 Made with pride for Indian Truckers
        </p>
      </footer>

      {/* Sticky Bottom Navigation dock for easy thumbs-reach interaction */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 shadow-2xl py-2 px-3 pb-safe block lg:hidden" 
        id="easy-interaction-bottom-nav"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-1 text-[10px] font-bold text-slate-400">
          
          <button
            onClick={() => setActiveTab("boards-loads")}
            className={`flex flex-col items-center gap-1.5 py-1 px-2.5 rounded-xl transition ${
              activeTab === "boards-loads" 
                ? "text-amber-500 font-extrabold" 
                : "hover:text-slate-200"
            }`}
          >
            <Briefcase className={`w-4 h-4 ${activeTab === 'boards-loads' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="truncate">Cargos ({loads.filter(l => l.status === 'active').length})</span>
          </button>

          <button
            onClick={() => setActiveTab("boards-trucks")}
            className={`flex flex-col items-center gap-1.5 py-1 px-2.5 rounded-xl transition ${
              activeTab === "boards-trucks" 
                ? "text-amber-500 font-extrabold" 
                : "hover:text-slate-200"
            }`}
          >
            <TruckIcon className={`w-4 h-4 ${activeTab === 'boards-trucks' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="truncate">Trucks ({trucks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("optimizer")}
            className={`flex flex-col items-center gap-1.5 py-1 px-2.5 rounded-xl transition ${
              activeTab === "optimizer" 
                ? "text-amber-500 font-extrabold" 
                : "hover:text-slate-200"
            }`}
          >
            <Navigation className={`w-4 h-4 ${activeTab === 'optimizer' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="truncate">Optimize</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex flex-col items-center gap-1.5 py-1 px-2.5 rounded-xl relative transition ${
              activeTab === "bookings" 
                ? "text-amber-500 font-extrabold" 
                : "hover:text-slate-200"
            }`}
          >
            <FileCheck className={`w-4 h-4 ${activeTab === 'bookings' ? 'text-amber-500' : 'text-slate-400'}`} />
            <span className="truncate">Triplogs</span>
            {activeBookingsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {activeBookingsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("kyc")}
            className={`flex flex-col items-center gap-1.5 py-1 px-2.5 rounded-xl transition ${
              activeTab === "kyc" 
                ? "text-amber-500 font-extrabold" 
                : "hover:text-slate-200"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'kyc' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="truncate">Aadhaar KYC</span>
          </button>

        </div>
      </nav>
    </div>
  );
}
