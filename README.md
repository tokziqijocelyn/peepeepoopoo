# Fitsies -- AI-Powered Fashion Assistant

Fitsies is a mobile-first web app that helps people dress better using AI. Upload your wardrobe, get personalized outfit suggestions, and see how they look on you -- all powered by **Agnes AI**.

Built for the Agnes AI Hackathon 2026.

## What It Does

**Digital Wardrobe** -- Take photos of your clothes. Agnes AI automatically identifies each item's category, color, and style tags, building a searchable digital closet.

**Smart Outfit Matching** -- Agnes AI analyzes your wardrobe and reasons about which pieces work together based on your style preferences and past likes. It generates complete outfit combinations you can swipe through.

**Virtual Try-On** -- Upload a full-body reference photo. When you like an outfit, tap "Try It On" and Agnes AI generates a realistic image of *you* wearing that exact combination.

**Personalized Shop** -- Based on your style questionnaire answers, Fitsies generates a curated feed of 50 clothing recommendations from brands like SHEIN, Zalora, H&M, UNIQLO, and ZARA.

## How Agnes AI Powers Fitsies

Fitsies uses two Agnes AI models throughout the entire experience:

| Feature | Model | What It Does |
|---------|-------|-------------|
| Wardrobe codification | `agnes-2.0-flash` (text) | Analyzes clothing photos to extract category, color, description, and style tags |
| Outfit matching | `agnes-2.0-flash` (text) | Semantically reasons about which wardrobe items pair well together |
| Style profiling | `agnes-2.0-flash` (text) | Converts questionnaire answers into a structured style profile |
| Shop recommendations | `agnes-2.0-flash` (text) | Generates personalized product listings matching user preferences |
| Person description | `agnes-2.0-flash` (text) | Describes the user's appearance from their body photo for try-on |
| Outfit preview | `agnes-image-2.1-flash` (image) | Generates fashion editorial images of outfit combinations |
| Virtual try-on | `agnes-image-2.1-flash` (image) | Creates personalized images of the user wearing suggested outfits |

**API endpoints used:**
- `POST /v1/chat/completions` -- Text generation and reasoning
- `POST /v1/images/generations` -- Image generation

## User Flow

```
Open App
  |
  v
Automatic anonymous sign-in
  |
  v
Style Questionnaire (5 steps)
  |-- Gender expression
  |-- Aesthetic preferences
  |-- Color palette
  |-- Budget range
  |-- Occasions
  |
  v
Full-body photo upload (reference for try-on)
  |
  v
+--------+     +-----------+
|  Shop  |     | Wardrobe  |
+--------+     +-----------+
|              |
| 50 curated   |-- My Closet (upload clothes)
| product      |-- Outfits (swipe through AI combos)
| listings     |     |-- Swipe left: skip
|              |     |-- Swipe right: zoom in
|              |           |-- See outfit breakdown
|              |           |-- "Try It On" button
|              |           |-- AI generates you in the outfit
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **API Layer:** tRPC v11 (end-to-end type safety)
- **Database & Auth:** Supabase (PostgreSQL + anonymous auth + file storage)
- **AI:** Agnes AI (`agnes-2.0-flash` for text, `agnes-image-2.1-flash` for images)
- **Animations:** Framer Motion (swipe gestures, page transitions)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Agnes AI](https://platform.agnes-ai.com) API key (free)

### 1. Clone and install

```bash
git clone <repo-url>
cd peepeepoopoo
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migration.sql`
3. Go to **Authentication > Settings** and enable:
   - **Allow anonymous sign-ins**
4. Go to **Settings > API** and copy your project URL and publishable key

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
AGNES_API_KEY="your-agnes-api-key"
AGNES_API_BASE="https://apihub.agnes-ai.com/v1"
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or in a mobile-sized browser window.

## Project Structure

```
src/
  app/
    shop/              Shop page + product grid
    wardrobe/          Wardrobe page + closet + outfit swiper
    onboarding/        Style questionnaire + body photo upload
    _components/       Shared components (nav, task status, auth)
  server/
    api/routers/       tRPC routers (wardrobe, shop, style)
    agnes/             Agnes AI client + prompt templates
  lib/
    supabase/          Supabase client (server, browser, middleware)
    utils.ts           Utility functions
    constants.ts       App constants
supabase/
  migration.sql        Database schema + RLS policies
```

## Key Features

- **Mobile-first design** -- 430px max-width, dark theme, touch-optimized
- **Tinder-style swiping** -- Drag-to-swipe outfit cards with spring physics
- **Global task notifications** -- Persistent loading indicators that survive page navigation
- **Style learning loop** -- The last 10 liked outfits influence future suggestions
- **Zero-friction onboarding** -- Anonymous auth, no account creation needed

## License

MIT
