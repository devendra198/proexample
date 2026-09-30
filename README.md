# Pro-Example - Developer Portfolio & Project Management Platform

A minimal, fast, production-ready developer portfolio and CMS built with Next.js App Router, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL.

## Features

- **Public Portfolio Website**:
  - **Homepage**: Clean proposal showcase with instant URL copy, full case study details copy, real-time URL/tech/developer search, developer portfolios section, and landscape grid view.
  - **Projects Discovery (`/projects`)**: Real-time filtering by category, technology platform, and featured status, with URL synchronization and instant search.
  - **Project Detail Page (`/projects/[slug]`)**: Dynamic SEO meta tags, full project description, and flexible action buttons (Website, App Store, Google Play, GitHub, and custom links).
  - **Category View (`/category/[slug]`)**: Dedicated showcase for each specialty area with technical platform breakdown.
  - **Technology View (`/technology/[slug]`)**: Dedicated showcase for each programming language, framework, or CMS.
  - **About & Contact**: Minimal, developer-centric pages for inquiries and background.

- **Protected Admin Dashboard (`/admin`)**:
  - **Authentication**: Credentials-based login with bcrypt password hashing and secure httpOnly JWT cookies (`/admin/login`).
  - **Dashboard Metrics**: Real-time statistics for Total Categories, Technologies, Projects, Active Projects, Inactive Projects, and Featured Projects.
  - **Quick Add Project Form**: Fast project creation panel directly on the top of the dashboard.
  - **Category Management (`/admin/categories`)**: Create, edit, activate/deactivate, and safely delete categories with dependency checks.
  - **Technology Management (`/admin/technologies`)**: Create, edit, and link technologies to parent categories dynamically.
  - **Project Management (`/admin/projects`)**: Full table with search (including by URL), filters, inline edits, featured toggle, and delete confirmations.
  - **Dynamic Project Form (`/admin/projects/new`, `/admin/projects/[id]/edit`)**: Cascading dropdowns (selecting a category filters technology choices automatically), repeatable custom link manager, slug auto-generation, and Zod validation.
  - **Admin Settings (`/admin/settings`)**: Password modification and live database connection telemetry.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon, Supabase, AWS RDS, or local PostgreSQL)
- **ORM**: Prisma 5
- **Authentication**: BcryptJS + JSON Web Tokens (JWT) in httpOnly cookies
- **Icons**: Lucide React
- **Validation**: Zod

## Admin Credentials & Initial Setup

Admin credentials can be specified in your `.env` file before running the seed script:

```env
ADMIN_EMAIL="admin@pro-example.com"
ADMIN_PASSWORD="your-secure-password"
```

Once logged in, credentials can also be updated directly from the **Admin Settings** page (`/admin/settings`).

## Getting Started

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd pro-example
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL database connection URL and a secure JWT secret:
   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   JWT_SECRET="your_secret_jwt_key_here"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Generate Prisma client and push schema**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed database**:
   ```bash
   npm run prisma:seed
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) for the public site, or [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.
