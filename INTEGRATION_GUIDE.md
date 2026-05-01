# RFID Pig Management System - Integration Guide

This guide explains how to integrate the new RFID scanning form and pig dashboard into your SwineSense application.

## Overview of New Components

### Frontend Components Created

1. **`pigForm.tsx`** - Pig registration form with fields for:
   - RFID Tag, Pig ID, Pig Type, Sire, Dam, Pen, Health Status, Weight, Date of Birth, Notes

2. **`rfidScanner.tsx`** - RFID scanner component that:
   - Listens for RFID scan input (simulates keyboard input ending with Enter)
   - Opens a modal when RFID is scanned
   - Shows existing pig records or displays registration form for new pigs
   - Auto-fills RFID tag in the form

3. **`pigs.ts`** - API layer for pig operations:
   - `checkPigByRfid()` - Check if pig exists by RFID
   - `createPigRecord()` - Create new pig
   - `updatePigRecord()` - Update existing pig
   - `getPigs()` - Get pigs with filtering
   - `getPigDashboardStats()` - Get dashboard statistics
   - `getRecentScans()` - Get recently scanned pigs
   - `exportPigsToCSV()` - Export pig records as CSV

4. **`pigDashboard.tsx`** - Complete dashboard displaying:
   - KPI cards (total pigs, healthy, at-risk, sick counts)
   - Pig distribution by type (bar chart)
   - Health status distribution (pie chart)
   - Scan activity timeline (line chart)
   - Pen/building overview
   - Recently scanned pigs table
   - Time range filtering and CSV export

5. **`pigManagement.tsx`** - Main integration page combining:
   - Active RFID scanner
   - Last scanned pig card
   - Recent actions log
   - Pig dashboard

## Integration Steps

### Step 1: Update Router

Edit `frontend/src/router/index.tsx` and add the pig management route:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layout";
import App from "../App";
import Records from "../pages/records";
import SignUp from "@/pages/signUp";
import SignIn from "@/pages/signin";
import LoadingSamples from "@/pages/loadingSamples";
import PigManagement from "@/pages/pigManagement"; // NEW

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<App />} />
          <Route path="records" element={<Records />} />
          <Route path="pigs" element={<PigManagement />} /> {/* NEW */}
          <Route path="sign-up" element={<SignUp />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="loading-samples" element={<LoadingSamples />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Step 2: Update Sidebar Navigation

Edit `frontend/src/components/sidebar/sidebar.tsx` to add the Pig Management link:

```tsx
// Add to your navigation menu
<NavLink
  to="/pigs"
  className={({ isActive }) => (isActive ? "active-class" : "default-class")}
>
  <span>🐷 Pig Management</span>
</NavLink>
```

### Step 3: Backend API Setup Required

The frontend expects these backend endpoints. Create them in your backend:

#### Endpoints to Implement

**GET** `/api/pigs/check-rfid/:rfidTag`

- Check if pig exists by RFID tag
- Returns: `{ pig: PigRecord | null }`

**POST** `/api/pigs`

- Create new pig record
- Body: `{ rfidTag, pigId, pigType, pen, healthStatus, weight, dateOfBirth, ... }`
- Returns: `PigRecord`

**PUT** `/api/pigs/:pigId`

- Update pig record
- Body: Partial pig data
- Returns: Updated `PigRecord`

**GET** `/api/pigs/:pigId`

- Get single pig
- Returns: `PigRecord`

**GET** `/api/pigs?pigType=...&healthStatus=...&pen=...&page=...`

- List pigs with filtering
- Returns: `{ pigs: PigRecord[], pagination: { total, page, limit, totalPages } }`

**GET** `/api/pigs/stats/dashboard?startDate=...&endDate=...`

- Dashboard statistics
- Returns: `PigDashboardStats`

**GET** `/api/pigs/scans/recent?limit=10`

- Recent scans
- Returns: `{ scans: PigScanLog[] }`

**POST** `/api/pigs/scans`

- Record manual scan
- Body: `{ rfidTag, location?, notes? }`
- Returns: `PigScanLog`

**DELETE** `/api/pigs/:pigId`

- Soft delete pig record

**GET** `/api/pigs/export/csv`

- Export as CSV
- Returns: CSV file blob

### Step 4: Database Schema Update (Backend)

Update your Prisma schema to support pigs. In `backend/prisma/schema.prisma`:

```prisma
model Pig {
  pigId       Int      @id @default(autoincrement()) @map("pig_id")
  rfidTag     String   @unique @map("rfid_tag")
  pigIdStr    String   @unique @map("pig_id_str") // e.g., "PIG-2024-001"
  pigType     String   @map("pig_type") // piglet, sow, boar, gilt
  sire        String?
  dam         String?
  pen         String   @map("pen")
  healthStatus String  @default("healthy") @map("health_status")
  weight      Float?
  dateOfBirth DateTime @map("date_of_birth")
  notes       String?
  lastScanned DateTime @default(now()) @map("last_scanned")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  deletedAt   DateTime? @map("deleted_at")

  scans       PigScan[]

  @@map("pigs")
}

model PigScan {
  scanId      Int      @id @default(autoincrement()) @map("scan_id")
  pig         Pig?     @relation(fields: [pigId], references: [pigId])
  pigId       Int?     @map("pig_id")
  rfidTag     String   @map("rfid_tag")
  location    String?
  notes       String?
  scanTime    DateTime @default(now()) @map("scan_time")
  staffId     Int?     @map("staff_id")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("pig_scans")
}
```

## How It Works - User Flow

1. **Initial Setup**: Pig management page is loaded with RFID scanner active
2. **Scanning**: User scans RFID tag - scanner detects the input
3. **Lookup**: System checks database for pig with that RFID
4. **New Pig**: If not found, registration modal opens with RFID pre-filled
5. **Registration**: User fills form and submits
6. **Existing Pig**: If found, shows existing record with option to update
7. **Dashboard**: Displays all pig metrics and recent scans

## Files Created/Modified

### New Files:

- `frontend/src/components/form/pigForm.tsx`
- `frontend/src/components/form/rfidScanner.tsx`
- `frontend/src/api/pigs.ts`
- `frontend/src/pages/pigDashboard.tsx`
- `frontend/src/pages/pigManagement.tsx`

### Files to Modify:

- `frontend/src/router/index.tsx` - Add pig route
- `frontend/src/components/sidebar/sidebar.tsx` - Add navigation link
- `backend/prisma/schema.prisma` - Add Pig and PigScan models
- Backend API files - Implement pig endpoints

## Testing RFID Input

To test without a physical RFID reader:

1. Simply type the RFID tag text (e.g., `TAG-001234`)
2. Press Enter
3. The modal should open with the form

## Features

✅ RFID scanning with keyboard input
✅ Automatic new/existing pig detection
✅ Pig registration form with validation
✅ Record update capability
✅ Dashboard with multiple chart types
✅ Time range filtering
✅ CSV export functionality
✅ Recent scans tracking
✅ Pen/building overview
✅ Health status monitoring
✅ Responsive design

## Next Steps

1. Add the route to the router as shown in Step 1
2. Update the sidebar navigation as shown in Step 2
3. Implement the backend endpoints as documented in Step 3
4. Update the database schema as shown in Step 4
5. Run `npx prisma migrate dev` to apply schema changes
6. Test the RFID scanner in the web interface

## Notes

- The RFID scanner assumes the reader sends input like keyboard strokes
- If using a different RFID input method, modify the `rfidScanner.tsx` component accordingly
- The dashboard automatically refreshes when time range changes
- All data can be exported as CSV for external analysis
