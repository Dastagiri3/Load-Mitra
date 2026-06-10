import React, { useState } from "react";
import { Booking } from "../types";
import { 
  FileCheck, 
  MapPin, 
  IndianRupee, 
  Truck, 
  Clock, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Printer,
  Download,
  X,
  QrCode,
  CheckCircle,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw
} from "lucide-react";

interface BookingsCatalogProps {
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: 'booked' | 'dispatched' | 'in_transit' | 'delivered') => void;
  onUploadPOD: (bookingId: string, fileName: string) => void;
}

export default function BookingsCatalog({ bookings, onUpdateBookingStatus, onUploadPOD }: BookingsCatalogProps) {
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [selectedBookingForBill, setSelectedBookingForBill] = useState<Booking | null>(null);
  const [ewayGeneratedNo, setEwayGeneratedNo] = useState<string>("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDrag = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(id);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, bookingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      onUploadPOD(bookingId, file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, bookingId: string) => {
    if (e.target.files && e.target.files[0]) {
      onUploadPOD(bookingId, e.target.files[0].name);
    }
  };

  const handleViewEWayBill = (booking: Booking) => {
    // Generate a fixed mock E-Way Bill number based on the booking ID
    const hash = booking.id.split("-").pop() || "874221";
    const segment1 = "1412";
    const segment2 = hash.substring(0, 4).padEnd(4, "7");
    const segment3 = hash.substring(hash.length - 4).padStart(4, "2");
    setEwayGeneratedNo(`${segment1} ${segment2} ${segment3}`);
    setSelectedBookingForBill(booking);
    setDownloadSuccess(false);
  };

  const simulateDownloadPDF = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
    }, 1800);
  };

  const getHsnDetails = (material: string): { code: string; label: string } => {
    const mat = material.toLowerCase();
    if (mat.includes("steel") || mat.includes("iron") || mat.includes("metal")) {
      return { code: "7208", label: "Flat-rolled Iron or Structural Non-Alloy Steel Sheets" };
    }
    if (mat.includes("wheat") || mat.includes("rice") || mat.includes("grain") || mat.includes("food") || mat.includes("agricultural")) {
      return { code: "1006", label: "Cereals, Semi-Milled or Wholly Milled Grains (Rice/Wheat)" };
    }
    if (mat.includes("cement") || mat.includes("brick") || mat.includes("stone") || mat.includes("concrete")) {
      return { code: "2523", label: "Portland Cement, Hydraulic Cements & Brick aggregates" };
    }
    if (mat.includes("chemical") || mat.includes("acid") || mat.includes("fertilizer") || mat.includes("polymer")) {
      return { code: "3808", label: "Industrial Formulations, Organic Chemicals & Polymers" };
    }
    if (mat.includes("fmcg") || mat.includes("soap") || mat.includes("cosmetics") || mat.includes("grocery")) {
      return { code: "3304", label: "Cosmetics, Toiletries & Packaged Consumer Retail Goods (FMCG)" };
    }
    if (mat.includes("coal") || mat.includes("ore") || mat.includes("mineral") || mat.includes("briquette")) {
      return { code: "2701", label: "Coal, Solid Bituminous Mineral Fuels & Aggregates" };
    }
    return { code: "9973", label: "Commercial Cargo Road Transport Distribution Services" };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="bookings-catalog-tab">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500">
          <FileCheck className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2">
            My Triplog & Active Bookings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track active jobs, coordinate highway dispatch progress, and generate official mock 'E-Way Bills' for highway inspections and tax clearances.
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-slate-950/40 p-12 text-center rounded-2xl border border-slate-800/60 max-w-xl mx-auto">
          <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-300">No active cargo bookings found.</p>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
            Loads will appear here once a shipper reviews and accepts a transporter's bidding quote under the "Active Cargo Loads" board.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const load = booking.load;
            const stepIndex = 
              booking.status === 'booked' ? 0 : 
              booking.status === 'dispatched' ? 1 : 
              booking.status === 'in_transit' ? 2 : 3;

            return (
              <div key={booking.id} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition duration-150">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4 mb-4">
                  <div>
                    <span className="font-mono text-[10px] bg-slate-900 text-amber-400 border border-slate-800/70 px-2 py-0.5 rounded uppercase">
                      ID: {booking.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-200 mt-1">
                      {load.material} ({load.weight} Tons)
                    </h3>
                  </div>

                  <div className="flex sm:flex-col items-end gap-3 sm:gap-1">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Agreed Contract Fare</span>
                    <span className="font-mono text-base font-bold text-emerald-400">
                      ₹{booking.finalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Pathway detail */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  
                  {/* Route Summary */}
                  <div className="md:col-span-1 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin className="w-3 text-red-500 shrink-0" />
                      <span className="font-semibold">{load.origin}</span>
                      <span className="text-slate-600">→</span>
                      <span className="font-semibold">{load.destination}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="block">Vehicle: <strong className="text-slate-300 font-normal">{load.truckType}</strong></span>
                      <span className="block mt-0.5">Shipper: <strong className="text-slate-300 font-normal">{load.shipperName}</strong></span>
                    </div>
                  </div>

                  {/* Active workflow step tracker */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider mb-2 font-mono">
                      <span>Timeline Progression:</span>
                      <span className="text-amber-400 font-bold tracking-widest">{booking.status}</span>
                    </div>

                    <div className="relative">
                      {/* Grey Connector Line */}
                      <div className="absolute top-2.5 left-2 right-2 h-0.5 bg-slate-800 -z-1" />
                      {/* Active Connector Progress Line */}
                      <div 
                        className="absolute top-2.5 left-2 h-0.5 bg-amber-500 -z-1 transition-all duration-300"
                        style={{ width: `${(stepIndex / 3) * 100}%` }}
                      />

                      <div className="flex justify-between items-center text-[10px]">
                        {[
                          { label: "Booked", st: "booked" },
                          { label: "Dispatched", st: "dispatched" },
                          { label: "In Transit", st: "in_transit" },
                          { label: "Delivered", st: "delivered" }
                        ].map((node, idx) => {
                          const isActiveEnRoute = idx <= stepIndex;
                          const isCurrentEnRoute = idx === stepIndex;
                          
                          return (
                            <div key={node.st} className="flex flex-col items-center flex-1">
                              <div 
                                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono border text-[9px] font-bold transition duration-200 ${
                                  isCurrentEnRoute ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse' :
                                  isActiveEnRoute ? 'bg-slate-300 text-slate-900 border-slate-400' :
                                  'bg-slate-900 text-slate-500 border-slate-800'
                                }`}
                              >
                                {idx + 1}
                              </div>
                              <span className={`block mt-1 font-semibold ${isActiveEnRoute ? 'text-slate-300' : 'text-slate-600'}`}>
                                {node.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Operational status managers */}
                  <div className="md:col-span-1 justify-end flex">
                    {booking.status !== 'delivered' ? (
                      <div className="space-y-2 w-full">
                        {stepIndex < 2 ? (
                          <button
                            onClick={() => {
                              const options: Array<'booked' | 'dispatched' | 'in_transit' | 'delivered'> = ['booked', 'dispatched', 'in_transit', 'delivered'];
                              onUpdateBookingStatus(booking.id, options[stepIndex + 1]);
                            }}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs py-2 rounded-lg cursor-pointer transition font-semibold"
                          >
                            Advance: {stepIndex === 0 ? "Dispatch Truck" : "Enter Transit"}
                          </button>
                        ) : (
                          // If In Transit, prompt for digital Proof of Delivery slip upload to mark complete
                          <span className="block text-center text-[10px] text-amber-500 font-semibold bg-amber-950/20 border border-amber-950 px-2 py-1.5 rounded uppercase tracking-wide animate-pulse">
                            📂 Upload POD to finish trip
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="bg-emerald-950/35 border border-emerald-800/80 p-2.5 rounded-lg text-xs text-emerald-400 flex items-center gap-1.5 w-full leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <span className="font-bold block uppercase tracking-wider text-[10px]">Trip Complete</span>
                          {booking.podName ? (
                            <span className="text-[10px] text-slate-400 block max-w-[130px] truncate">POD: {booking.podName}</span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block">Digital Slip verified</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* Digital scan POD upload drawer for ongoing trips in transit */}
                {booking.status === 'in_transit' && (
                  <div className="mt-4 pt-4 border-t border-slate-900">
                    <div 
                      onDragEnter={(e) => handleDrag(e, booking.id)}
                      onDragOver={(e) => handleDrag(e, booking.id)}
                      onDragLeave={(e) => handleDrag(e, booking.id)}
                      onDrop={(e) => handleDrop(e, booking.id)}
                      className={`border-2 border-dashed rounded-lg p-4 transition text-center flex flex-col items-center justify-center cursor-pointer py-5 ${
                        dragActive === booking.id ? 'bg-amber-950/20 border-amber-500' : 'bg-slate-930 border-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <Upload className="w-5 h-5 text-slate-500 mb-1" />
                      <span className="text-xs text-slate-300 font-semibold">Drop Signed Delivery Slip (POD) Here</span>
                      <span className="text-[9px] text-slate-500 mt-1">
                        Uploading simulates signed unloading slips to complete the order ledger.
                      </span>
                      
                      <label className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-[10px] font-bold px-3 py-1 rounded inline-block mt-3 cursor-pointer">
                        Browse File
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileSelect(e, booking.id)}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Integrated Action Row for generating E-Way bill */}
                <div className="mt-4 pt-3 border-t border-slate-900 flex flex-wrap justify-between items-center gap-2">
                  <div className="text-[10px] text-slate-500 font-mono">
                    Booked on {new Date(booking.createdAt).toLocaleDateString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <button
                    onClick={() => handleViewEWayBill(booking)}
                    className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[11px] font-bold px-3.5 py-1.5 rounded-lg border border-amber-500/35 hover:border-amber-500 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generate GST E-Way Bill
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL WINDOW FOR E-WAY BILL CERTIFICATE DETAILS */}
      {selectedBookingForBill && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 border-4 border-double border-slate-300 rounded-lg max-w-2xl w-full p-6 shadow-2xl relative my-8 print:p-0 print:border-none print:shadow-none">
            
            {/* Modal Controls header */}
            <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
              <button
                onClick={simulateDownloadPDF}
                disabled={isDownloading}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition"
              >
                {isDownloading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    Download PDF
                  </>
                )}
              </button>
              
              <button
                onClick={() => window.print()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 transition"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                Print
              </button>

              <button
                onClick={() => setSelectedBookingForBill(null)}
                className="bg-red-50 hover:bg-red-100 text-red-650 p-2 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Simulated Notification alert for downloader */}
            {downloadSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs flex items-center gap-2 print:hidden animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>E-Way Bill Downloaded!</strong> A mock PDF document (<code>e_way_bill_{selectedBookingForBill.id}.pdf</code>) has been generated successfully on your machine.</span>
              </div>
            )}

            {/* CERTIFICATE START SHEET (PRINT LAYOUT) */}
            <div className="space-y-6">
              
              {/* Official government Indian header decoration */}
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h3 className="text-xs tracking-widest font-black uppercase text-slate-500">e-Way Bill System</h3>
                <h1 className="text-lg font-extrabold uppercase mt-1 tracking-tight">Government of India</h1>
                <p className="text-[10px] text-slate-500 font-serif">Ministry of Finance • Goods & Services Tax Regulatory Authority</p>
                
                <div className="flex justify-between items-center mt-4 pt-2 border-t border-dashed border-slate-200 text-left text-[11px] font-mono text-slate-600">
                  <div>
                    <span className="block font-bold">e-Way Bill No: {ewayGeneratedNo}</span>
                    <span className="block">Generation Date: {new Date(selectedBookingForBill.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="text-right">
                    <span className="block">Active Period: 15-Days (Interstate Route)</span>
                    <span className="block">Form Type: GST EWB-01</span>
                  </div>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="bg-slate-50 border border-slate-200 py-3 px-4 rounded flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">System Barcode clearance code</span>
                  <div className="font-mono text-xs tracking-[8px] font-bold text-slate-800 mt-1 uppercase">
                    ||||| | |||| | || ||||| | |||| || {selectedBookingForBill.id}
                  </div>
                </div>
                <div className="p-1 bg-white border border-slate-200 rounded">
                  <QrCode className="w-11 h-11 text-slate-800" />
                </div>
              </div>

              {/* PART A segment: Supplier and invoice particulars */}
              <div>
                <h4 className="bg-slate-800 text-white font-bold text-xs px-3 py-1 uppercase tracking-wider rounded">
                  PART - A (Transaction Information)
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs border border-slate-200 p-3 rounded">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">GSTIN / Transporter Reg</span>
                      <strong className="text-slate-800">27AAAAA1111A1Z1 (Sher-E-Punjab Co)</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Dispatch Origin</span>
                      <strong className="text-slate-800">{selectedBookingForBill.load.origin}, IN</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Consignor Shipper Mitra</span>
                      <strong className="text-slate-800">{selectedBookingForBill.load.shipperName}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">GSTIN of Recipient</span>
                      <strong className="text-slate-800">07BCAAP9012F1Z9 (Indian Enterprises Ltd)</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Delivery Destination</span>
                      <strong className="text-slate-800">{selectedBookingForBill.load.destination}, IN</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Consignee Contact</span>
                      <strong className="text-slate-800">{selectedBookingForBill.load.shipperPhone}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commodity Details Table */}
              <div>
                <h4 className="bg-slate-800 text-white font-bold text-xs px-3 py-1 uppercase tracking-wider rounded">
                  Goods Particulars & Valuations
                </h4>
                
                <table className="w-full text-xs mt-3 border border-slate-200 rounded overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-left border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                      <th className="p-2">Material / Commodity</th>
                      <th className="p-2">HSN Code</th>
                      <th className="p-2">quantity (Weight)</th>
                      <th className="p-2 text-right">Taxable Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 text-slate-800 font-semibold">
                      <td className="p-2">
                        {selectedBookingForBill.load.material}
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          {getHsnDetails(selectedBookingForBill.load.material).label}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-slate-600">
                        {getHsnDetails(selectedBookingForBill.load.material).code}
                      </td>
                      <td className="p-2">
                        {selectedBookingForBill.load.weight} MT (Metric Tons)
                      </td>
                      <td className="p-2 text-right font-mono">
                        ₹{selectedBookingForBill.finalPrice.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-slate-50/50 text-[11px] font-medium text-slate-500">
                      <td colSpan={3} className="p-2 text-right">SGST / CGST Bracket Estimate (Included in freight)</td>
                      <td className="p-2 text-right font-mono">₹{Math.floor(selectedBookingForBill.finalPrice * 0.05).toLocaleString()}</td>
                    </tr>
                    <tr className="bg-slate-50 text-xs font-bold text-slate-800">
                      <td colSpan={3} className="p-2 text-right uppercase tracking-wider">Grand Total Value:</td>
                      <td className="p-2 text-right font-mono text-emerald-600 font-black">
                        ₹{selectedBookingForBill.finalPrice.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* PART B segment: Logistics dispatch details */}
              <div>
                <h4 className="bg-slate-800 text-white font-bold text-xs px-3 py-1 uppercase tracking-wider rounded">
                  PART - B (Vehicle & Logistics Particulars)
                </h4>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-xs border border-slate-200 p-3 rounded">
                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Transport Mode</span>
                      <strong className="text-slate-800">Road Freight (100% Direct Carrier)</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Vehicle Specification Type</span>
                      <strong className="text-slate-800">{selectedBookingForBill.load.truckType}</strong>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Transport Document Number</span>
                      <strong className="text-slate-800 font-mono">LM-BK-{selectedBookingForBill.id}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 block">Security Guard Pin Verification</span>
                      <strong className="text-slate-805 text-amber-600 font-mono">VERIFIED LIVE</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer and mock watermark */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-4">
                <div className="text-[9px] text-slate-400 leading-normal max-w-sm">
                  <strong>E-Way Bill Verification:</strong> This is an integrated mock document generated via the LoadMitra direct ledger for validation simulations. Fully compliant with GST rule guidelines for demonstration. All drivers matched on Aadhaar KYC are authenticated prior to heavy vehicle loading.
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2 rounded flex items-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-slate-500 block font-bold">Mitra Verified</span>
                    <span className="text-[10px] text-emerald-700 font-bold whitespace-nowrap">Direct Contract</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Print and Close controls for lower sheet */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-2 print:hidden">
              <button
                onClick={() => setSelectedBookingForBill(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-5 rounded text-xs transition cursor-pointer"
              >
                Close Bill Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
