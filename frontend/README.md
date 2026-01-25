# Fresh Grocers - Frontend

A modern, responsive grocery delivery application built with React, TypeScript, and Tailwind CSS.

## Features

### Customer UI (Mobile-First)
- 🏠 Home page with product listings
- 🛍️ Product browsing and search
- 🛒 Shopping cart management
- 📦 Order history and tracking
- 👤 User profile management
- 📱 Bottom navigation for mobile (hidden on desktop)
- 🖥️ Top navigation for desktop

### Delivery Person UI (Responsive)
- 📊 Dashboard with stats and assigned orders
- 📋 Order management (accept/reject/deliver)
- 📈 Performance statistics
- 👤 Profile management
- 🔔 Approval status tracking
- 📱 Mobile-friendly bottom navigation
- 🖥️ Desktop-friendly top navigation

### CSR Dashboard (Desktop-First)
- 📊 Dashboard overview with statistics
- 📦 Order management and assignment
- ✅ Delivery person approval system
- 🛍️ Product management (CRUD)
- 📁 Category management (CRUD)
- 👥 User management (customers & delivery persons)

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **Redux Persist** - State persistence
- **React Router v7** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Toastify** - Notifications
- **Heroicons** - Icons

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── common/          # Button, Input, LoadingSpinner, ProtectedRoute
│   │   ├── customer/        # Customer-specific components (BottomNavigation)
│   ├── pages/               # Page components
│   │   ├── auth/            # Login, Register
│   │   ├── customer/        # Customer pages
│   │   ├── delivery/        # Delivery person pages
│   │   └── csr/             # CSR dashboard pages
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios instance with interceptors
│   │   ├── auth.service.ts
│   │   ├── products.service.ts
│   │   ├── cart.service.ts
│   │   ├── orders.service.ts
│   │   ├── categories.service.ts
│   │   ├── delivery.service.ts
│   │   ├── users.service.ts
│   │   ├── ratings.service.ts
│   │   └── admin.service.ts
│   ├── store/               # Redux store
│   │   ├── store.ts         # Store configuration
│   │   ├── hooks.ts         # Typed hooks
│   │   └── features/        # Redux slices
│   │       ├── auth/
│   │       ├── cart/
│   │       └── products/
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions and constants
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles with Tailwind
├── public/                  # Static assets
├── tailwind.config.js       # Tailwind configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000
```

3. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3001` (default Vite port).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

For production, update this to your deployed backend URL.

## Branding

- **Primary Color**: Yellow (#facc15)
- **Secondary Color**: Green (#16a34a)
- **Theme**: Blinkit/Zepto-style grocery delivery app

## Responsive Behavior

### Mobile (< 1024px)
- Bottom navigation bar for Customer and Delivery Person UIs
- Single/two-column product grids
- Mobile-optimized layouts

### Desktop (≥ 1024px)
- Top navigation bar (no bottom nav)
- Multi-column product grids (4 columns)
- Desktop-optimized layouts

## API Integration

All API calls are made through services in `src/services/`. The Axios instance in `api.ts` includes:
- Automatic JWT token injection
- Token refresh on 401 errors
- Global error handling with toast notifications

## State Management

Redux Toolkit is used for state management with:
- **Auth slice**: User authentication and profile
- **Cart slice**: Shopping cart state
- **Products slice**: Product listings

State is persisted to localStorage using Redux Persist.

## Routing

- Protected routes with role-based access control
- Automatic redirects based on user role after login
- Public routes for authentication pages

## Development Notes

- All API responses should follow the backend's response format
- Error handling is done globally via Axios interceptors
- Toast notifications for user feedback
- Loading states managed through Redux slices
- TypeScript strict mode for type safety

## License

MIT