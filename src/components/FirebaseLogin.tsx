import React, { useState } from "react";
import { 
  auth, 
  db, 
  handleFirestoreError, 
  OperationType 
} from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { KYCProfile } from "../types";
import { 
  Truck, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building, 
  ShieldCheck, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  Briefcase,
  PlayCircle
} from "lucide-react";

interface FirebaseLoginProps {
  onSuccess: (profile: KYCProfile, firebaseUser: any) => void;
  onEnterSandbox: () => void;
}

export default function FirebaseLogin({ onSuccess, onEnterSandbox }: FirebaseLoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState<"shipper" | "transporter">("transporter");
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1); // 1 = Auth credentials, 2 = Extra Logistics profile info (only for sign up)
  const [tempUser, setTempUser] = useState<any>(null); // holds auth user before completing profile

  // Form validations
  const validateForm = () => {
    if (!email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return false;
    }
    if (isSignUp && onboardingStep === 2) {
      if (!fullName.trim()) {
        setErrorMsg("Full Name is required.");
        return false;
      }
      if (!companyName.trim()) {
        setErrorMsg("Company Name is required.");
        return false;
      }
    }
    return true;
  };

  // Google Login popup
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile document already exists in Firestore users collection
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // Log them right in
        const data = userSnap.data();
        const profile: KYCProfile = {
          fullName: data.fullName || user.displayName || "Google Driver Partner",
          phone: data.phone || "",
          companyName: data.companyName || "Independent Operator",
          role: data.role || "transporter",
          aadhaarNo: data.aadhaarNo || "",
          aadhaarVerified: data.aadhaarVerified || false,
          dlNo: data.dlNo || "",
          dlVerified: data.dlVerified || false,
          gstNo: data.gstNo || "",
          gstVerified: data.gstVerified || false,
          isComplete: data.isComplete || true
        };
        onSuccess(profile, user);
      } else {
        // It's a new sign-up, hold the user and prompt for details
        setTempUser(user);
        setFullName(user.displayName || "");
        setIsSignUp(true);
        setOnboardingStep(2); // take them directly to step 2 to input role & company details
      }
    } catch (err: any) {
      console.error("Google authenticate failure: ", err);
      setErrorMsg(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  // Submit email credential auth
  const handleCredentialAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        if (onboardingStep === 1) {
          // Verify auth does not throw error first, then advance
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          setTempUser(userCredential.user);
          setOnboardingStep(2);
        } else {
          // Finalize onboarding step 2
          const user = tempUser || auth.currentUser;
          if (!user) throw new Error("Authentication session expired.");

          const finalProfile: KYCProfile = {
            fullName: fullName.trim(),
            phone: phone.trim() || "+91 ",
            companyName: companyName.trim(),
            role: role,
            aadhaarNo: "",
            aadhaarVerified: false,
            dlNo: "",
            dlVerified: false,
            gstNo: "",
            gstVerified: false,
            isComplete: true
          };

          // Sync database profile document
          const docPath = `users/${user.uid}`;
          try {
            await setDoc(doc(db, "users", user.uid), {
              userId: user.uid,
              fullName: finalProfile.fullName,
              email: user.email,
              role: finalProfile.role,
              companyName: finalProfile.companyName,
              phone: finalProfile.phone,
              aadhaarNo: "",
              aadhaarVerified: false,
              dlNo: "",
              dlVerified: false,
              gstNo: "",
              gstVerified: false,
              isComplete: true,
              createdAt: new Date().toISOString()
            });
          } catch (writeErr) {
            handleFirestoreError(writeErr, OperationType.WRITE, docPath);
          }

          onSuccess(finalProfile, user);
        }
      } else {
        // Sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Retrieve Firestore profile info
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        let profile: KYCProfile = {
          fullName: "Transporter Partner",
          phone: "",
          companyName: "Logistics Agency",
          role: "transporter",
          aadhaarNo: "",
          aadhaarVerified: false,
          dlNo: "",
          dlVerified: false,
          gstNo: "",
          gstVerified: false,
          isComplete: false
        };

        if (userSnap.exists()) {
          const uData = userSnap.data();
          profile = {
            fullName: uData.fullName,
            phone: uData.phone || "",
            companyName: uData.companyName,
            role: uData.role,
            aadhaarNo: uData.aadhaarNo || "",
            aadhaarVerified: uData.aadhaarVerified || false,
            dlNo: uData.dlNo || "",
            dlVerified: uData.dlVerified || false,
            gstNo: uData.gstNo || "",
            gstVerified: uData.gstVerified || false,
            isComplete: uData.isComplete || true
          };
        }
        
        onSuccess(profile, user);
      }
    } catch (err: any) {
      console.error("Auth action failed: ", err);
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("Email address is already in use.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setErrorMsg("Invalid email or password combination.");
      } else {
        setErrorMsg(err.message || "An authentication error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden" id="auth-main-container">
      {/* Abstract Highway Lines Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0f172a,transparent)] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        
        {/* Logo and Greeting Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black px-4 py-2 rounded-2xl shadow-lg border border-amber-400/20 mb-3 animate-bounce">
            <Truck className="w-5 h-5" />
            <span className="font-display tracking-tight text-sm">LOADMITRA</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight font-display">
            {isSignUp ? (onboardingStep === 1 ? "Create Mitra Driver Account" : "Tell Us About Your Fleet") : "Driver & Transporter Lobby"}
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Direct Deals, Transparent Rates, and Aadhaar Verified Transport Networks across India.
          </p>
        </div>

        {/* Authentication Card Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
          
          {errorMsg && (
            <div className="mb-4 bg-red-950/40 border border-red-900/80 p-3 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn" id="auth-error-box">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {isSignUp && onboardingStep === 2 ? (
            /* ONBOARDING STEP 2: PROFILE REGISTRATION FOR STORE */
            <form onSubmit={handleCredentialAuth} className="space-y-4">
              <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-4 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-widest block font-mono">Stage 2 of 2</span>
                <span className="text-xs text-slate-300 font-medium block mt-1">Configure Enterprise Logistics Credentials</span>
              </div>

              {/* Role selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 font-mono">Your Professional Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("transporter")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      role === "transporter"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-md"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    Transporter / Driver
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("shipper")}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                      role === "shipper"
                        ? "bg-amber-500/10 border-amber-500 text-amber-400 shadow-md"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    Shipper / Factory
                  </button>
                </div>
              </div>

              {/* Text inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Full Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Harpreet Singh Sodhi"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-amber-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Company / Agency Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sher-E-Punjab Logistics"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-amber-500 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Active Contact Phone (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="+91 9882001144"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-amber-500 transition font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs py-3 rounded-xl shadow-lg mt-2 cursor-pointer transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Complete Mitra Registration</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* AUTH CREDENTIALS PANEL */
            <form onSubmit={handleCredentialAuth} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Logistics Portal ID Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="mitra-trucker@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-amber-500 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 font-mono">Gate Entry Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter security password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none focus:border-amber-500 transition font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2.5 rounded-xl mt-2 cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? "Continue with Email & Password" : "Secure Gate Entry"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Separator indicator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-[1px] bg-slate-800" />
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest font-mono">OR</span>
                <div className="flex-1 h-[1px] bg-slate-800" />
              </div>

              {/* Social Login option */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-slate-950 border border-slate-850 hover:bg-slate-900 border-slate-800 text-slate-300 font-bold text-xs py-2.5 rounded-xl cursor-pointer transition flex items-center justify-center gap-2 shadow"
              >
                {/* Embedded dynamic custom flat SVG for Google */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.65 1.63 15.01 1 12 1 7.37 1 3.4 3.65 1.55 7.5l3.8 2.95C6.25 7.42 8.91 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.45 12.3c0-.82-.07-1.61-.21-2.3H12v4.4h6.43c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.98 3.37-4.89 3.37-8.19z" />
                  <path fill="#FBBC05" d="M5.35 14.5c-.24-.72-.38-1.5-.38-2.3s.14-1.58.38-2.3L1.55 6.95C.56 8.91 0 11.1 0 12c0 .9.56 3.09 1.55 5.05l3.8-2.55z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.91l-3.66-2.84c-1.12.75-2.54 1.2-4.29 1.2-3.09 0-5.75-2.38-6.65-5.41l-3.8 2.95C3.4 20.35 7.37 23 12 23z" />
                </svg>
                <span>Google Dispatch Single Sign-On</span>
              </button>

              {/* Alternate state selection */}
              <div className="text-center pt-3 text-[11px] text-slate-400">
                {isSignUp ? (
                  <span>
                    Already registered?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(false);
                        setOnboardingStep(1);
                      }}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Log in here
                    </button>
                  </span>
                ) : (
                  <span>
                    New Driver / Transporter?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(true);
                        setOnboardingStep(1);
                      }}
                      className="text-amber-400 font-bold hover:underline cursor-pointer"
                    >
                      Register with us
                    </button>
                  </span>
                )}
              </div>
            </form>
          )}

        </div>

        {/* Dynamic Sandbox Trial Row */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left shadow-lg">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-950/80 px-2 py-0.5 rounded">Fast Demo Sandbox Mode</span>
            <p className="text-slate-400 text-[11px] mt-1 pr-1.5">
              Skip Firebase integration setup terms box and instantly test-drive using static direct brokerless mock feeds.
            </p>
          </div>
          <button
            onClick={onEnterSandbox}
            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 text-xs font-bold px-4 py-2 rounded-xl border border-emerald-500/20 hover:border-emerald-500 shrink-0 transition flex items-center gap-1 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Sandbox Trial</span>
          </button>
        </div>

        {/* Platform Legal Protection Shield Footer */}
        <div className="text-center font-mono text-[9px] text-slate-600 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
          <span>GST and National Aadhaar direct deal portal verifications.</span>
        </div>

      </div>
    </div>
  );
}
