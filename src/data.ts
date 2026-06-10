import { Load, Truck } from "./types";

export const REGIONS_AND_CITIES = [
  "Delhi NCR",
  "Mumbai MMR",
  "Bengaluru",
  "Chennai",
  "Kolkata",
  "Pune",
  "Hyderabad",
  "Jaipur",
  "Ahmedabad",
  "Kanpur",
  "Ludhiana",
  "Surat",
  "Nagpur",
  "Indore"
];

export const TRUCK_TYPES = [
  "Open Body (19-24 Ft, 9-16T)",
  "Taurus Multi-Axle (10-Tyer, 16-21T)",
  "Container 32 Ft Single Axle (7-9T)",
  "Container 32 Ft Multi-Axle (14-18T)",
  "TATA Ace / Chota Hathi (LCV, 1-2 T)",
  "Bolero Pickup (Medium LCV, 2.5T)",
  "Flatbed Trailer (32-40 Ft, 25-35T)",
  "Modular Hydraulic Axle (Heavy, 40T+)"
];

export const MATERIAL_TYPES = [
  "FMCG & Food Staples",
  "Auto Parts & Components",
  "Agricultural Grains & Wheat",
  "Steel Coils & Construction Iron",
  "Industrial Chemicals (Drums)",
  "E-Commerce Retail Packages",
  "Cement & Gypsum Bags",
  "Heavy Electrical Transformers",
  "Pharma & Cold-Chain Goods"
];

export const SEED_LOADS: Load[] = [
  {
    id: "load_101",
    origin: "Mumbai MMR",
    destination: "Delhi NCR",
    material: "Auto Parts & Components",
    weight: 14,
    truckType: "Taurus Multi-Axle (10-Tyer, 16-21T)",
    loadingDate: "2026-06-12",
    priceProposal: 65000,
    shipperName: "Tirupati Logistics Pvt Ltd",
    shipperPhone: "+91 9876543210",
    isVerified: true,
    status: "active",
    bids: [
      {
        id: "bid_201",
        loadId: "load_101",
        bidAmount: 64000,
        transporterName: "Karan Roadlines",
        transporterPhone: "+91 9911223344",
        truckDetails: "MH-04-FD-5812 (Taurus)",
        timestamp: "2026-06-09T05:10:00Z",
        status: "pending"
      },
      {
        id: "bid_202",
        loadId: "load_101",
        bidAmount: 63000,
        transporterName: "Balaji Cargo Services",
        transporterPhone: "+91 9833445566",
        truckDetails: "MH-43-Y-4982 (Taurus)",
        timestamp: "2026-06-09T05:55:00Z",
        status: "pending"
      }
    ],
    aiDescription: "Urgent carriage required for premium automobile shock-absorbers and steering racks. Material is safely packed in wooden boxes. Prompt loading. Requires high-tarpaulin or high-side-deck Taurus truck. Driver must have valid fastag and national pass.",
    highlights: ["Immediate Dispatch", "Direct Payment on Unloading", "Premium Secure Packaging", "Toll charges covered by Shipper"],
    suggestedLabel: "URGENT",
    instructions: "Direct loading inside plant. Handover delivery receipt at Bilaspur warehouse.",
    createdAt: "2026-06-09T03:30:00Z"
  },
  {
    id: "load_102",
    origin: "Delhi NCR",
    destination: "Bengaluru",
    material: "E-Commerce Retail Packages",
    weight: 8,
    truckType: "Container 32 Ft Single Axle (7-9T)",
    loadingDate: "2026-06-15",
    priceProposal: 88000,
    shipperName: "BlueBox Logistics Hub",
    shipperPhone: "+91 8877665544",
    isVerified: true,
    status: "active",
    bids: [],
    aiDescription: "Secured lockable solid container required for e-commerce parcel carriage. Weight is light, volume is high. Must be lockable transit with GPS tracking active. Single-point loading at Gurgaon Hub and single-point unloading at Whitefield Warehouse. Short halt at Toll checkpoints expected.",
    highlights: ["GPS Tracked Only", "2-Day Express Run", "Volumetric Light Load", "Aadhaar verified driver required"],
    suggestedLabel: "SECURED TRANSIT",
    instructions: "Sealing of containers is mandatory at Gurgaon warehouse. Do not bypass highway weighbridges.",
    createdAt: "2026-06-08T18:15:00Z"
  },
  {
    id: "load_103",
    origin: "Kolkata",
    destination: "Chennai",
    material: "Steel Coils & Construction Iron",
    weight: 28,
    truckType: "Flatbed Trailer (32-40 Ft, 25-35T)",
    loadingDate: "2026-06-11",
    priceProposal: 115000,
    shipperName: "Kolkata Metal Foundry Co",
    shipperPhone: "+91 9444332211",
    isVerified: true,
    status: "active",
    bids: [
      {
        id: "bid_203",
        loadId: "load_103",
        bidAmount: 112000,
        transporterName: "Sher-E-Punjab Transport",
        transporterPhone: "+91 9876598765",
        truckDetails: "PB-10-CZ-4511 (Trailer)",
        timestamp: "2026-06-09T06:01:00Z",
        status: "pending"
      }
    ],
    aiDescription: "Heavy load of cold-rolled steel coils. Requires heavy-duty flatbed trailer with strong binding chain-tensioners. Proper safety block fittings must be available. Direct loading via overhead overhead magnet crane. Priority clearances on Toll lanes.",
    highlights: ["Magnet-Loading Ready", "Heavy Payload Index", "Direct Factory Contract", "Unloading charges included"],
    suggestedLabel: "HEAVY PAYLOAD",
    instructions: "Wear safety helmets and boots inside plant. Bring heavy chains and wooden blocks to secure coils.",
    createdAt: "2026-06-09T01:20:00Z"
  },
  {
    id: "load_104",
    origin: "Chennai",
    destination: "Pune",
    material: "FMCG & Food Staples",
    weight: 6,
    truckType: "Bolero Pickup (Medium LCV, 2.5T)",
    loadingDate: "2026-06-13",
    priceProposal: 32000,
    shipperName: "Saraswathi Agri Trading",
    shipperPhone: "+91 7766551122",
    isVerified: false,
    status: "active",
    bids: [],
    aiDescription: "Premium pack of packaged spices and staples. Non-fragile cargo. Driver must keep cargo covered with waterproof plastic tarpaulin. No overnight open exposure. Clean cargo cabin required.",
    highlights: ["Bilty Copy Advance Paid", "FMCG Staples", "Flexible Timings"],
    suggestedLabel: "FAST LOADING",
    instructions: "Driver should help with billing checks at entry checking post.",
    createdAt: "2026-06-09T04:20:00Z"
  }
];

export const SEED_TRUCKS: Truck[] = [
  {
    id: "truck_501",
    driverName: "Sardar Manpreet Singh",
    driverPhone: "+91 9988776655",
    truckNo: "PB-30-W-7890",
    truckType: "Flatbed Trailer (32-40 Ft, 25-35T)",
    capacity: 35,
    currentLocation: "Delhi NCR",
    preferredRoute: "Mumbai MMR",
    isVerified: true,
    status: "available",
    activeDate: "2026-06-10",
    createdAt: "2026-06-08T12:00:00Z"
  },
  {
    id: "truck_502",
    driverName: "Rameshwar Yadav",
    driverPhone: "+91 9112233445",
    truckNo: "HR-55-A-1244",
    truckType: "Taurus Multi-Axle (10-Tyer, 16-21T)",
    capacity: 18,
    currentLocation: "Mumbai MMR",
    preferredRoute: "Chennai",
    isVerified: true,
    status: "available",
    activeDate: "2026-06-11",
    createdAt: "2026-06-09T01:00:00Z"
  },
  {
    id: "truck_503",
    driverName: "Venkata Ramanan",
    driverPhone: "+91 8882223334",
    truckNo: "TN-09-K-8854",
    truckType: "Container 32 Ft Single Axle (7-9T)",
    capacity: 8,
    currentLocation: "Bengaluru",
    preferredRoute: "Hyderabad",
    isVerified: true,
    status: "available",
    activeDate: "2026-06-12",
    createdAt: "2026-06-09T05:00:00Z"
  },
  {
    id: "truck_504",
    driverName: "Mohammad Irshad",
    driverPhone: "+91 7776665554",
    truckNo: "UP-32-T-9002",
    truckType: "TATA Ace / Chota Hathi (LCV, 1-2 T)",
    capacity: 1.5,
    currentLocation: "Delhi NCR",
    preferredRoute: "Pune",
    isVerified: false,
    status: "available",
    activeDate: "2026-06-10",
    createdAt: "2026-06-09T06:15:00Z"
  }
];
