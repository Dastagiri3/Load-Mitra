export interface Bid {
  id: string;
  loadId: string;
  bidAmount: number;
  transporterName: string;
  transporterPhone: string;
  truckDetails: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Load {
  id: string;
  origin: string;
  destination: string;
  material: string;
  weight: number; // in Tons
  truckType: string; // e.g. "Open Body", "Container 32 Ft", "LCV", "Flatbed"
  loadingDate: string;
  priceProposal: number; // in INR
  shipperName: string;
  shipperPhone: string;
  isVerified: boolean;
  status: 'active' | 'in_negotiation' | 'booked' | 'dispatched' | 'in_transit' | 'delivered';
  bids: Bid[];
  aiDescription?: string;
  highlights?: string[];
  suggestedLabel?: string;
  instructions?: string;
  createdAt: string;
}

export interface Truck {
  id: string;
  driverName: string;
  driverPhone: string;
  truckNo: string;
  truckType: string;
  capacity: number; // Max payload in Tons
  currentLocation: string;
  preferredRoute: string; // Preferred destination
  isVerified: boolean;
  status: 'available' | 'booked' | 'on_trip';
  activeDate: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  load: Load;
  truck?: Truck;
  finalPrice: number;
  status: 'booked' | 'dispatched' | 'in_transit' | 'delivered';
  podName?: string; // Digital Proof of Delivery mock file upload
  podUploadedAt?: string;
  createdAt: string;
}

export interface KYCProfile {
  fullName: string;
  phone: string;
  companyName: string;
  role: 'shipper' | 'transporter';
  aadhaarNo?: string;
  aadhaarVerified: boolean;
  gstNo?: string;
  gstVerified: boolean;
  dlNo?: string;
  dlVerified: boolean;
  isComplete: boolean;
}

export interface RouteOptimizationResult {
  recommendedFreightRateRange: string;
  totalEstimatedFareINR: number;
  estimatedDistanceKm: number;
  estimatedDurationHours: number;
  primaryHighway: string;
  majorStops: string[];
  tollPlazasCount: number;
  safetyTips: string[];
  optimizedSummary: string;
}

export interface LoadDescriptionResult {
  title: string;
  formattedDescription: string;
  keyHighlights: string[];
  suggestedStatusLabel: string;
}

export interface MarketInsightResult {
  marketStatus: string;
  regionalIndexScore: number;
  dieselPriceStatus: string;
  seasonalImpact: string;
  busyCorridors: string[];
  marketAdvice: string;
}
