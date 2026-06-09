# LogiMove - Logistics Platform Frontend

A fully functional frontend demo of a logistics platform built with **React + Vite + JavaScript (JSX)**. All data is mocked client-side — no backend required.

## Features

### MVP Pages (7 core sections)
- **Login / Register** — simulated auth with 2FA flow. Role-based routing (admin, driver, customer).
- **Shipment Booking** — multi-step form saving to `localStorage`.
- **Package Tracking** — Leaflet map with simulated moving marker via `setInterval`.
- **Driver Assignment** — drag-and-drop orders to drivers (`@dnd-kit`).
- **Payments** — mock Paystack / Flutterwave / Cash payment modals.
- **Admin Dashboard** — Recharts bar/pie charts, revenue stats, order tables.
- **Notifications** — toast system with status update simulation button.

### Additional Pages
- **Driver Portal** — assigned deliveries, status updates, GPS navigation link, Proof of Delivery (signature canvas + photo).
- **Fleet Management** — vehicle tracking map, fuel logging, maintenance scheduling, browser notifications.
- **Drivers** — admin driver overview with stats.
- **Warehouse Management** — CRUD warehouses, map visualization.
- **Inventory Tracking** — stock levels, low-stock alerts, restock buttons.
- **Reports** — order stats, revenue breakdown, CSV export, activity log.
- **Customer Support** — mock live chat, contact info, WhatsApp link.
- **Profile** — user details, saved addresses (localStorage), preferences.
- **QR Scanner** — camera-based QR scanning (`html5-qrcode`) with test simulation.

### Nigerian Logistics Add-ons
- Paystack/Flutterwave mock buttons
- Cash on Delivery option
- Lagos traffic buffer (+30% ETA)
- Inter-state delivery flow
- WhatsApp tracking button
- Bike dispatch with battery level widget

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vite 8 | Build tool |
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| TailwindCSS v4 | Utility-first CSS |
| Leaflet + react-leaflet | Interactive maps |
| Recharts | Charts (bar, pie, line) |
| @dnd-kit | Drag-and-drop |
| react-hot-toast | Toast notifications |
| html5-qrcode | QR scanning |
| Papaparse | CSV parsing (for bulk upload) |
| Zustand | Lightweight state (optional) |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Mock Data Architecture

All data is stored in `localStorage` with fallback to JSON files in `src/mocks/`.

### Mock Data Files (`src/mocks/`)
| File | Content |
|------|---------|
| `orders.json` | 6 sample orders with tracking history |
| `drivers.json` | 5 drivers with ratings, earnings, location |
| `vehicles.json` | 6 vehicles (bike, van, truck) |
| `users.json` | 6 users (admin, drivers, customers) |
| `warehouses.json` | 5 warehouse locations |
| `notifications.json` | Sample notifications |

### Mock API (`src/utils/mockApi.js`)
All API functions use `setTimeout` to simulate async network calls:
- `fetchOrders()`, `fetchDrivers()`, `fetchVehicles()`, etc.
- `saveOrder()`, `updateOrder()`, `deleteOrder()`, `assignDriver()`
- `login()`, `register()`, `logout()`, `getAuth()`
- `calculateCost()`, `calculateETA()`, `estimateDistance()`
- `generateRoute()` — creates interpolated path for tracking simulation

### Switching Mock Data
To modify mock data:
1. Edit files in `src/mocks/` (JSON format)
2. Clear `localStorage` in browser dev tools (`Application > Local Storage > Clear All`)
3. Refresh the page — data re-initializes from JSON files on first load

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@logimove.com` | any password |
| Driver | `driver@logimove.com` | any password |
| Customer | `john@example.com` | any password |

2FA code: `123456` (hardcoded)

## Project Structure

```
src/
├── main.jsx            # Entry point (BrowserRouter)
├── App.jsx             # Route definitions
├── index.css           # TailwindCSS import
├── context/
│   └── AuthContext.jsx # Auth provider
├── hooks/
│   └── useLocalStorage.js
├── mocks/              # JSON mock data files
├── utils/
│   └── mockApi.js      # Mock API service
├── components/
│   ├── Layout.jsx      # Layout with sidebar + navbar
│   ├── Sidebar.jsx     # Navigation sidebar
│   ├── Navbar.jsx      # Top navbar
│   ├── ProtectedRoute.jsx
│   ├── MapContainer.jsx # Leaflet map wrapper
│   ├── StatCard.jsx
│   └── StatusBadge.jsx
└── pages/              # All page components
```

## License

MIT
