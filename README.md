# 🚚 LoadMitra — National Zero-Broker Dispatch Portal

### 🔗 **[LIVE PRODUCTION DEMO](https://ais-pre-xuslr6rk3y4uzy2s7qr3uu-200892941191.asia-east1.run.app)** | 🔗 **[DEVELOPMENT VIEW](https://ais-dev-xuslr6rk3y4uzy2s7qr3uu-200892941191.asia-east1.run.app)**

---

LoadMitra is a highly polished, full-stack, direct carrier-to-shipper spot freight marketplace designed to bypass bloated third-party commissions in the Indian logistics ecosystem. Powered by **Gemini 3.5 AI**, **React 19**, and **Firebase Enterprise**, LoadMitra establishes direct trust through official **India Stack government KYC simulation portals** (UIDAI Aadhaar, Sarathi Driving License, and GSTIN) so that truck owners and cargo shippers can securely contract, negotiate, and track heavy vehicle shipments with absolute simplicity.

---

## 🎨 Professional Visual Preview

```
+-----------------------------------------------------------------------------------+
|  🚚 LOADMITRA | Dashboard   Cargos (3)   Trucks (4)   Optimize   Triplogs   Profile   |
+-----------------------------------------------------------------------------------+
|  [ HARPREET SINGH ]           |  📦 Active Spot Cargos (Mumbai -> Delhi, NH48)     |
|  Role: Transporter            |  ------------------------------------------------- |
|  KYC Grade: VERIFIED A-GRADE  |  - Wheat Grain (15T) from Punjab -> Pune           |
|                               |    Tariff: ₹42,000 | Bids Received: 5 (Direct)     |
|  ---------------------------  |  - Steel Sheets (22T) from Jamshedpur -> Mumbai    |
|   Active Triplogs: 2 En-route |    Tariff: ₹64,500 | Bids Received: 2 (Direct)     |
|                               |                                                    |
|  [⚡ OPTIMIZE FREIGHT CORRIDOR]|  [ ⚡ GEMINI AI ROUTE PLATFORM INSIGHT]            |
|   Origin: Mumbai MMR          |   - Est. Fare: ₹52,000 - ₹58,000 (0% Commission)   |
|   Destination: Delhi NCR      |   - Suggested Highway: NH48 (Golden Quadrilateral) |
|   Material: Industrial Steel  |   - Toll Plazas Count: 18 FastTag Stations         |
|   [ PLAN HIGHWAY ROUTE ]      |   - Weather Warning: Western Ghats rain advisories |
+-----------------------------------------------------------------------------------+
|                      🇮🇳 Made with pride for Indian Truckers                        |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Key Architectural Modules & Features

### 1. Dual-User Workspaces (Shippers & Carriers)
LoadMitra adaptively reshapes its front-end based on the logged-in user's role:
*   **Shipper Profile**: Instantly post dynamic cargo requirements, use **Gemini AI to beautify load descriptions** (generating bilingual transliterated Hinglish listings), review instant transporter bids, and accept contracting bids to auto-generate active logistics Triplogs.
*   **Carrier (Transporter) Profile**: Register individual trucks in the national available vehicle directory, browse real-time freight loads, submit binding bidding quotes, and instantly express immediate interest at target freight rates.

### 2. Gemini AI Route & Rate Optimization Engine
The backend integrates a proxy wrapper around the `@google/genai` model to deliver high-quality logistics estimates across India:
*   **Optimal High-Speed Paths**: Recommends specified major Indian national highways (e.g., NH48, Golden Quadrilateral Corridors).
*   **Precise Highway Metrics**: Computes travel distances, realistic duration boundaries taking local driving obstacles into account, and estimates the exact number of toll plazas.
*   **Fair-market Freight Tariffs**: Evaluates outbound load densities, regional transport scores, and current state-by-state diesel fuel index scores to calculate fair-market transport price ranges.
*   **Highway Checkpoint Safety**: Provides monsoon safety advice, ghat mountain driving alerts, and RTO checkpoint documentation warnings.

### 3. Government India Stack Biometric & KYC Simulations
Establishes a Zero-Trust platform by simulating official database verification steps:
*   **UIDAI Aadhaar Link**: Simulates commercial OTP verification to map driver legal identities and prevent load theft.
*   **Sarathi HMV Driving License (DL)**: Verifies valid Class-HMV license codes to guarantee skilled, safe vehicle operators.
*   **GSTIN Portal Validation**: Confirms tax credentials for corporate cargo shippers before dispatching heavy freight.

### 4. Triplog Progress Ledger & GST E-Way Bill Generator
*   **Operational Progress Bars**: Tracks booking state sequences: `Booked` ➜ `Dispatched` ➜ `In Transit` ➜ `Delivered`.
*   **Signed POD Upload**: Transporters can drag-and-drop or select actual physical Proof of Delivery (POD) documents to complete contract ledgers.
*   **GST EWB-01 Document System**: Generates full, printable, official GST E-Way Bills including unique system clearance barcodes, HSN commodity codes, consignee/consignor details, and Part B logistics vehicle numbers.

---

## 🛠️ Complete Technology Stack

*   **Frontend User Interface**:
    *   **React 19** with unified functional hook states.
    *   **TypeScript** with rigorous type configurations.
    *   **Tailwind CSS** for fully responsive desktop-first and sticky bottom mobile navigation.
    *   **Framer Motion / Motion** for fluid layout animations and transitions.
    *   **Lucide Icons** for a clean, professional visual language.
*   **Backend Server Process**:
    *   **Node.js Express** backend supporting server-side API endpoints.
    *   **Google GenAI SDK (`@google/genai`)** driving server-side Gemini 3.5 Flash queries.
    *   **Vite Middleware** managing real-time dev builds.
*   **Cloud Persistence Hub**:
    *   **Firebase Firestore** Enterprise database for real-time state listeners.
    *   **Firebase Authentication** providing Google single sign-on alongside dual-step credential onboarding.
    *   **Fortified Firestore Rules** enforcing Attribute-Based Access Control (ABAC).

---

## 💻 Local Setup & Installation Instructions

Ensure you have **Node.js (v18 or higher)** and **npm** installed on your operating system.

### Step 1: Clone the Repository
Clone the codebase files to your local system directories:
```bash
git clone <your-repository-url>
cd LoadMitra
```

### Step 2: Install Base Dependencies
Download all project packages declared in `package.json`:
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root workspace directory matching the format below:
```env
# Server-side API Secret for Gemini Logistics Optimizer
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# Self-referential base URL (Defaults to local host)
APP_URL="http://localhost:3000"
```

### Step 4: Configure Firebase Credentials
Verify that `src/firebase-applet-config.json` contains your target Firebase project parameters:
```json
{
  "apiKey": "your_api_key",
  "authDomain": "your_auth_domain",
  "projectId": "your_project_id",
  "storageBucket": "your_storage_bucket",
  "messagingSenderId": "your_messaging_sender_id",
  "appId": "your_app_id",
  "firestoreDatabaseId": "(default)"
}
```

### Step 5: Start Development Server
Boot the Express back-end server (packaged with live Vite asset compiler services):
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser to test the full application.

### Step 6: Build and Run in Production
Compile optimized client bundles and CJS server scripts inside `dist/`:
```bash
npm run build
npm run start
```

---

## 🔒 Security Architecture (Firestore rules)

LoadMitra enforces watertight access controls. Security configurations inside `firestore.rules` are configured to block standard exploits:
1.  **Global Safety Net**: Catch-all default-deny on unrecognized collections: `allow read, write: if false;`.
2.  **Strict Identity Boundings**: Enforces `request.auth.uid == userId` for the registry to protect profiles and prevent identity spoofing.
3.  **Prohibits Scrape Harvesting**: Explicitly sets `allow list: if false` on confidential directories like `/users` to guard user phone numbers.
4.  **Schema Blueprint Guards**: Validates payload schemas (`isValidUser`, `isValidLoad`, `isValidTruck`, `isValidBooking`) before allowing successful Firestore writes.

---

*LoadMitra is developed for Indian Truckers with pride. Bypassing commission, ensuring transparency, and building mutual trust across national highways.* 🇮🇳
