# DevLog – Developer Learning Journal & Project Tracker

DevLog is a production-ready application for developers to track their learning journey, manage projects, and bookmark useful resources.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS
- **Database:** SQLite with Prisma ORM
- **Validation:** Zod
- **Data Fetching:** React Query (TanStack Query)
- **Charts:** Recharts

## Getting Started

### 1. Prerequisites
- Node.js 18.18 or later
- npm

### 2. Installation
```bash
npm install --legacy-peer-deps
```

### 3. Database Setup
```bash
# Initialize Prisma and create the SQLite database
npx prisma generate
npx prisma db push

# Seed the database with sample data
node prisma/seed.js
```

### 4. Running the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure
- `src/app`: Next.js 15 App Router pages and API routes.
- `src/components`: Reusable UI components and layouts.
- `src/lib`: Shared utilities, Prisma client, and Zod schemas.
- `src/types`: TypeScript interfaces and types.
- `prisma`: Database schema and seed scripts.

## Key Features
- **Dashboard:** Visualize your learning streak, activity chart, and top technologies.
- **Learning Log:** CRUD operations for daily learning entries with Markdown support.
- **Project Tracker:** Track projects from idea to shipped status.
- **Resource Bookmarker:** Save and categorize useful links, mark them as read or favorite.
