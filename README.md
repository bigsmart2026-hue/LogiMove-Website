# LogiMove - Logistics Platform

A full-featured logistics management platform built with **React 19 + Vite 8 + MUI v9**, powered by **Firebase Auth & Firestore**.

## Features

### Core Pages
- **Login / Register / Forgot Password** — Firebase Auth with role-based routing (admin, driver, customer). Password strength meter on registration.
- **Dashboard** — Admin overview with Recharts bar/pie charts, revenue stats, recent orders table.
- **Shipment Booking** — Multi-step booking form.
- **Package Tracking** — Leaflet map with real-time moving marker.
- **Driver Assignment** — Drag-and-drop order assignment via `@dnd-kit`.
- **Payments** — Paystack / Flutterwave / Debit Card / Cash options with card form validation.
- **Notifications** — Notification feed with status badges.

### Management Pages
- **Driver Portal** — Assigned deliveries, status updates, GPS navigation, Proof of Delivery.
- **Fleet Management** — Vehicle tracking, fuel logging, maintenance scheduling.
- **Drivers** — Admin overview with ratings, earnings, performance.
- **Warehouse Management** — CRUD warehouses with map visualization.
- **Inventory Tracking** — Stock levels, low-stock alerts, restock actions.
- **Reports** — Order stats, revenue breakdown, CSV export, activity log.
- **Customer Support** — Live chat UI, contact cards, WhatsApp link.
- **Profile** — User details, saved addresses, preferences, dark mode toggle.
- **QR Scanner** — Camera-based QR scanning with test simulation.

### Nigerian Logistics
- Paystack / Flutterwave payment stubs
- Cash on Delivery
- Lagos traffic buffer (+30% ETA)
- Inter-state delivery flow
- WhatsApp tracking
- Bike dispatch with battery widget

## Tech Stack

| Tool | Purpose |
|------|---------|
| Vite 8 | Build tool |
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| **MUI v9** | Component library |
| **Emotion** | Styling engine |
| **Firebase Auth** | Authentication |
| **Firestore** | Database |
| Leaflet + react-leaflet | Interactive maps |
| Recharts | Charts (bar, pie, line) |
| @dnd-kit | Drag-and-drop |
| react-hot-toast | Toast notifications |
| html5-qrcode | QR scanning |
| Zustand | State management |
| Lucide React | Icons |
| Netlify | Deployment |

## Getting Started

### Prerequisites
- Node.js 22+
- A Firebase project with Auth (Email/Password) and Firestore enabled

### Setup

```bash
# Clone and install
npm install

# Create environment file
cp .env.example .env
```

Fill in `.env` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Demo Accounts

The email `bigsmart2026@gmail.com` is always treated as **admin** regardless of Firestore data.

| Role | Notes |
|------|-------|
| Admin | Create via Register or set role in Firestore |
| Driver | Create via Register or set role in Firestore |
| Customer | Default role on registration |

## Project Structure

```
src/
├── main.jsx                # Entry point (BrowserRouter + ThemeProvider)
├── App.jsx                 # Route definitions with lazy loading
├── theme.js                # MUI theme (light/dark palette)
├── index.css               # Global styles
├── context/
│   ├── AuthContext.jsx     # Firebase Auth provider
│   └── ThemeContext.jsx    # Dark mode context (persisted)
├── firebase/
│   ├── config.js           # Firebase init
│   └── services.js         # Auth & Firestore operations
├── store/
│   └── authStore.js        # Zustand store (ready)
├── components/
│   ├── Layout.jsx          # Sidebar + Navbar + Outlet
│   ├── Navbar.jsx          # Top bar with theme toggle
│   ├── Sidebar.jsx         # Responsive drawer (Lucide icons)
│   ├── ProtectedRoute.jsx  # Auth guard with role check
│   ├── MapContainer.jsx    # Leaflet map wrapper
│   ├── StatCard.jsx        # MUI stat card
│   └── StatusBadge.jsx     # Status chip
└── pages/                  # All page components (lazy loaded)
```

## Deployment

The project is pre-configured for Netlify via `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Connect your GitHub repo to Netlify and it deploys automatically.

## License

MIT
