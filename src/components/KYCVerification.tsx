import React, { useState, useEffect } from "react";
import { KYCProfile } from "../types";
import { 
  ShieldCheck, 
  User, 
  FileText, 
  Upload, 
  CheckCircle, 
  Smartphone,
  Phone,
  Building,
  AlertCircle
} from "lucide-react";

interface KYCVerificationProps {
  profile: KYCProfile;
  onChangeProfile: (p: KYCProfile) => void;
}

export default function KYCVerification({ profile, onChangeProfile }: KYCVerificationProps) {
  const [fullName, setFullName] = useState(profile.fullName || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [companyName, setCompanyName] = useState(profile.companyName || "");
  const [role, setRole] = useState<'shipper' | 'transporter'>(profile.role || "transporter");

  const [aadhaar, setAadhaar] = useState(profile.aadhaarNo || "");
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [gst, setGst] = useState(profile.gstNo || "");
  const [gstLoading, setGstLoading] = useState(false);
  const [dl, setDl] = useState(profile.dlNo || "");
  const [dlLoading, setDlLoading] = useState(false);

  const [notif, setNotif] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) {
      setNotif("Please enter your name and contact phone number.");
      return;
    }

    const updated = {
      ...profile,
      fullName,
      phone,
      companyName,
      role
    };
    onChangeProfile(updated);
    triggerNotif("Contact profile updated successfully.");
  };

  const triggerNotif = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 3000);
  };

  const verifyAadhaar = () => {
    if (aadhaar.length !== 12 || isNaN(Number(aadhaar))) {
      triggerNotif("Invalid Aadhaar number. Must be 12 digits.");
      return;
    }
    setAadhaarLoading(true);
    setTimeout(() => {
      setAadhaarLoading(false);
      onChangeProfile({
        ...profile,
        aadhaarNo: aadhaar,
        aadhaarVerified: true,
        fullName: fullName || "Verified Mitra",
        phone: phone || "9999999999"
      });
      triggerNotif("Aadhaar UIDAI verified successfully via OTP!");
    }, 1500);
  };

  const verifyGst = () => {
    if (gst.length !== 15) {
      triggerNotif("Invalid Indian GSTIN. Must be exactly 15 characters.");
      return;
    }
    setGstLoading(true);
    setTimeout(() => {
      setGstLoading(false);
      onChangeProfile({
        ...profile,
        gstNo: gst,
        gstVerified: true
      });
      triggerNotif("GSTIN portal verified successfully!");
    }, 1500);
  };

  const verifyDL = () => {
    if (dl.length < 8) {
      triggerNotif("Invalid Driving License pattern.");
      return;
    }
    setDlLoading(true);
    setTimeout(() => {
      setDlLoading(false);
      onChangeProfile({
        ...profile,
        dlNo: dl,
        dlVerified: true
      });
      triggerNotif("Sarathi driving license verified successfully!");
    }, 1500);
  };

  // Check if profile is complete
  const isKycVerifiedFull = profile.aadhaarVerified && (role === 'shipper' ? profile.gstVerified : profile.dlVerified);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="kyc-verification-section">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
              Govt KYC Verification Center
              {isKycVerifiedFull ? (
                <span className="bg-emerald-950 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
                  ✓ Verified Mitra (A-Grade)
                </span>
              ) : (
                <span className="bg-amber-950 text-amber-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1">
                  ⚠ Verification Pending
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Verify your credentials on LoadMitra database through official portal simulations (UIDAI, Sarathi, GSTIN) to unlock direct, trusted bookings with 0% extra cost.
            </p>
          </div>
        </div>
      </div>

      {notif && (
        <div className="bg-amber-950/40 border border-amber-800 text-amber-200 rounded-xl p-3.5 text-xs mb-6 flex items-center gap-2" id="kyc-notif">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span>{notif}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Basic Profile Settings */}
        <div className="lg:col-span-1 bg-slate-950/50 p-5 rounded-xl border border-slate-800/80">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1">
            <User className="w-4 h-4 text-amber-500" />
            1. User Profile Setup
          </h3>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="E.g., Harish Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1">Mobile (WhatsApp for Direct Deal)</label>
              <input
                type="text"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1">Company/Entity Name</label>
              <input
                type="text"
                placeholder="E.g., Jodhpur Roadlines Co"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-medium mb-1.5 font-bold text-amber-400">Current Marketplace Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("transporter")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition duration-150 cursor-pointer ${
                    role === 'transporter' 
                      ? 'bg-amber-500 text-slate-950 border-amber-400' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  🚚 I Sell Truck Space
                </button>
                <button
                  type="button"
                  onClick={() => setRole("shipper")}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition duration-150 cursor-pointer ${
                    role === 'shipper' 
                      ? 'bg-amber-500 text-slate-950 border-amber-400' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  📦 I Post Cargo Loads
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 hover:text-amber-400 text-slate-200 text-xs font-semibold py-2 rounded-lg border border-slate-700 transition cursor-pointer"
            >
              Update Settings Only
            </button>
          </form>
        </div>

        {/* Right Side: Identity Document Verifiers */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            2. Instant India Stack Identity Verifications
          </h3>

          {/* Aadhaar UIDAI Row */}
          <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 px-1.5 bg-red-950 text-red-400 font-mono text-[10px] rounded uppercase font-bold">UIDAI Govt</span>
                <span className="text-xs font-semibold text-slate-200">Aadhaar Card Link</span>
              </div>
              <p className="text-[11px] text-slate-400 max-w-sm">
                Matches biometric fingerprint systems. Transporter records get matched with UIDAI to prevent load theft.
              </p>
            </div>
            {profile.aadhaarVerified ? (
              <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verified: {profile.aadhaarNo || "9000-xxxx-1244"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  maxLength={12}
                  placeholder="12 Digit Aadhaar Number"
                  value={aadhaar}
                  onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ""))}
                  className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 w-full sm:w-44 outline-none font-mono"
                />
                <button
                  onClick={verifyAadhaar}
                  disabled={aadhaarLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 text-xs rounded-lg transition duration-200 cursor-pointer text-nowrap disabled:opacity-50"
                >
                  {aadhaarLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}
          </div>

          {/* Role specific: GSTIN Verification for Shippers */}
          {role === 'shipper' && (
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-blue-950 text-blue-400 font-mono text-[10px] rounded uppercase font-bold">GST Portal</span>
                  <span className="text-xs font-semibold text-slate-200">GSTIN Verification (15-characters)</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Simulates checking of tax payments & registered addresses. Grants high safety tier indexes for corporate freight.
                </p>
              </div>
              {profile.gstVerified ? (
                <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Verified: {profile.gstNo || "27AAAAA1111A1Z1"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    maxLength={15}
                    placeholder="E.g., 27AAAAA0000A1Z1"
                    value={gst}
                    onChange={(e) => setGst(e.target.value.toUpperCase())}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 w-full sm:w-44 outline-none font-mono"
                  />
                  <button
                    onClick={verifyGst}
                    disabled={gstLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 text-xs rounded-lg transition duration-200 cursor-pointer text-nowrap disabled:opacity-50"
                  >
                    {gstLoading ? "Verifying..." : "Verify GSTIN"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Role specific: Driving License (Sarathi) for Transporters */}
          {role === 'transporter' && (
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-1.5 bg-blue-950 text-blue-400 font-mono text-[10px] rounded uppercase font-bold">Sarathi Portal</span>
                  <span className="text-xs font-semibold text-slate-200">Commercial Heavy Vehicle DL</span>
                </div>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  Simulates checking of driver licensing database for Class-HMV credentials. Shippers trust checked driving histories.
                </p>
              </div>
              {profile.dlVerified ? (
                <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 font-mono text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Verified: {profile.dlNo || "DL-14202611899120"}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="DL Number (e.g. DL-12AA3456)"
                    value={dl}
                    onChange={(e) => setDl(e.target.value.toUpperCase())}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 w-full sm:w-44 outline-none font-mono"
                  />
                  <button
                    onClick={verifyDL}
                    disabled={dlLoading}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-2 text-xs rounded-lg transition duration-200 cursor-pointer text-nowrap disabled:opacity-50"
                  >
                    {dlLoading ? "Verifying..." : "Verify Sarathi"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Interactive Document Attachment uploader simulation */}
          <div className="bg-slate-950/20 border border-dashed border-slate-800 hover:border-amber-500/50 p-4 rounded-xl transition duration-150 flex flex-col items-center justify-center text-center py-6 cursor-pointer">
            <Upload className="w-6 h-6 text-slate-500 mb-2" />
            <span className="text-xs font-medium text-slate-300">Drag & Drop Scan Copies</span>
            <span className="text-[10px] text-slate-500 mt-1 max-w-xs">
              Directly upload RC Book certificate, national permit, or corporate insurance (Support standard formats PDF, PNG, JPG).
            </span>
            <input type="file" className="hidden" id="license-file-upload-input" />
          </div>
        </div>
      </div>
    </div>
  );
}
