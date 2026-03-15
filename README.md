# SolarIQ-Web

B2B Web Portal for SolarIQ - A solar energy analysis and lead management platform built with Next.js.

## Features

- **Dashboard** - Overview of leads, conversion rates, and revenue statistics
- **Lead Management** - View, filter, search, and update lead status
- **Solar Analysis** - Analyze solar potential and calculate ROI for any location
- **Knowledge Base (Admin)** - Upload and manage documents for RAG
- **Pricing Management (Admin)** - Manage installation costs and electricity rates

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Testing**: Jest + React Testing Library, Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Firebase project with Authentication enabled
- Backend API running (SolarIQ backend)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AmnadTaowsoam/SolarIQ-Web.git
cd SolarIQ-Web
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example .env.local
```

4. Configure your `.env.local` with your credentials:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Development

Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

Build for production:
```bash
pnpm build
```

Start production server:
```bash
pnpm start
```

## Project Structure

```
/SolarIQ-Web
├── /src
│   ├── /app                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page (redirects)
│   │   ├── /login              # Login page
│   │   ├── /dashboard          # Dashboard page
│   │   ├── /leads              # Leads management
│   │   ├── /analyze            # Solar analysis tool
│   │   ├── /knowledge          # Knowledge base (admin)
│   │   └── /pricing            # Pricing management (admin)
│   ├── /components
│   │   ├── /ui                 # Shared UI components
│   │   ├── /layout              # Layout components
│   │   └── /charts              # Dashboard charts
│   ├── /hooks                   # Custom React hooks
│   ├── /lib                     # Utilities and API client
│   ├── /types                   # TypeScript interfaces
│   └── /context                 # React context providers
├── /tests                       # Unit tests
├── /e2e                         # Playwright E2E tests
├── .env.example                 # Environment template
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── jest.config.ts               # Jest configuration
└── playwright.config.ts         # Playwright configuration
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint errors |
| `pnpm test` | Run unit tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm type-check` | Run TypeScript type checking |

## User Roles

| Role | Access |
|------|--------|
| `admin` | Full access to all pages including Knowledge Base and Pricing |
| `contractor` | Access to Dashboard, Leads, and Solar Analysis only |

## API Integration

The frontend connects to the SolarIQ Backend API. Make sure the backend is running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`.

### Required API Endpoints

- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/leads` - List leads
- `PATCH /api/v1/leads/:id/status` - Update lead status
- `POST /api/v1/solar/analyze` - Solar analysis
- `GET /api/v1/dashboard/stats` - Dashboard statistics
- `GET /api/v1/knowledge/documents` - List documents (admin)
- `POST /api/v1/knowledge/documents/upload` - Upload document (admin)
- `GET /api/v1/pricing/installation-cost` - Installation costs (admin)
- `GET /api/v1/pricing/electricity-rates` - Electricity rates (admin)

## Testing

### Unit Tests
```bash
pnpm test
```

### E2E Tests
```bash
pnpm test:e2e
```

### Test Coverage
The project requires 80% test coverage for all components and hooks.

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Docker
```bash
docker build -t solariq-web .
docker run -p 3000:3000 solariq-web
```

## License

This project is part of the SolarIQ application.
