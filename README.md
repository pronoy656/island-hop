# 🏝️ IslandHop - Caribbean & Inter-Island Ferry Booking Platform

Frontend web application for **IslandHop**, built with **Next.js 16 (App Router, React 19, Tailwind CSS 4, Shadcn UI, Turbopack)** and Turborepo.

---

## 🏗️ Architecture & Structure

```
.
├── apps/
│   └── web/                         # Next.js 16 App Router Frontend (@repo/web)
│       ├── src/
│       │   ├── app/                 # Next.js App Router routes & layouts
│       │   ├── components/          # UI components & widgets
│       │   ├── config/              # Site and navigation configuration
│       │   ├── data/                # Mock data & interfaces
│       │   ├── hooks/               # Custom React hooks
│       │   ├── lib/                 # Utility functions
│       │   └── styles/              # Global CSS & Tailwind styling
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── packages/
│   ├── tsconfig/                    # @repo/tsconfig (base, nextjs, react-library configs)
│   ├── eslint-config/               # @repo/eslint-config (base and next ESLint configs)
│   ├── types/                       # @repo/types (shared TypeScript interfaces)
│   ├── validators/                  # @repo/validators (shared Zod validation schemas)
│   └── ui/                          # @repo/ui (shared UI component library)
│
├── package.json                     # Root npm workspaces manifest & scripts
├── turbo.json                       # Turborepo task pipeline & caching
└── README.md                        # Project root documentation
```

---

## ⚡ Quick Start

### 1. Prerequisites

- **Node.js**: `v20.x` or later (v22 recommended)
- **npm**: `v9.x` or later

### 2. Installation

Clone the repository and install all workspace dependencies:

```bash
npm install
```

### 3. Environment Variables

Create `apps/web/.env.local` based on `.env.example`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### 4. Running the Development Server

Start the Next.js frontend:

```bash
npm run dev
# or specifically
npm run dev:web
```

The application will be accessible at:
- **Web App**: [http://localhost:3000](http://localhost:3000)

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with Turbopack |
| `npm run build` | Create an optimized production build |
| `npm run lint` | Run ESLint across all packages |
| `npm run typecheck` | Run TypeScript checks |
| `npm run format` | Format code with Prettier |

---

## 🚢 Operator & Admin Portals

- **Marketing & Booking**: `/`
- **Route Search & Checkout**: `/routes`, `/book`, `/book/[tripId]/payment`
- **Operator Portal**: `/dashboard/operator` (Overview, Ferries, Routes, Schedules, Off Days, Bookings, Manifest)
- **Admin Portal**: `/dashboard/admin` (Overview, Providers, Bookings, Payments, Settings)
