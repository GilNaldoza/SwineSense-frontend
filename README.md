# SwineSense Admin Dashboard (Frontend)

The centralized administrative interface for SwineSense (Pig Management System). This web application allows farm managers and administrators to monitor offline scans, manage pigs, view analytics, and export reports.

## 🛠️ Tech Stack

- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Components:** ShadCN UI (built on Radix Primitives)
- **State/Fetching:** TanStack Query (React Query)
- **Routing:** React Router DOM
- **Icons:** Lucide React

## ✨ Key Features

- **Dashboard & Analytics:** Real-time visualization of farm scanning activity and pig demographics.
- **Scan Records:**
  - **Live Table:** View scan logs as they happen.
  - **Advanced Filtering:** Filter by **Location** (e.g., Barn A, Farrowing Pen), **Date Range**, and **Status**.
  - **Smart Search:** Quick lookup by RFID Tag or Pig Number.
- **Staff Management:**
  - Create and manage staff accounts.
  - Role-based permissions (Super Admin vs. Staff).
- **Exports:**
  - Generate comprehensive CSV reports.
  - Includes detailed metadata: Staff Name, Entry Node ID, and Location.
- **Responsive Design:** Optimized for both desktop and mobile views.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- NPM

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/LENS-Library-Entry-Management-System/LENS-frontend-v2.git
    cd LENS-frontend-v2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file (or use `.env.local`):
    ```env
    VITE_API_BASE_URL="http://localhost:3000/api"
    ```

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will start at `http://localhost:5173`.

## 📂 Project Structure

- `src/api`: Axios client and API handler functions.
- `src/components`:
  - `ui`: Reusable ShadCN components (buttons, inputs, dialogs).
  - `header`, `sidebar`: Layout components.
  - `table`: Data tables and filter contexts.
- `src/features`: Feature-specific logic (e.g., `tableRecords`, `formUses`).
- `src/hooks`: Custom React hooks (e.g., `useEntries`, `useLogStream`).
- `src/pages`: Main page views (`records`, `analytics`, `staffManagement`).
- `src/lib`: Utility functions and constants (`colleges.ts`).

## 🔄 Integration

This frontend connects to `LENS-backend-v2`. Ensure the backend server is running and the `VITE_API_BASE_URL` is correctly configured.
