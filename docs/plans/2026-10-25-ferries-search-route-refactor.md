# Ferry Search & Booking Route Architecture Refactor Plan

> **Goal:** Cleanly separate the **Ferry Search Results Page** (`/ferries`) from the **Booking & Checkout Funnel** (`/book/[tripId]/*`), ensuring zero broken links, full backward compatibility, and clean semantic URLs.

---

## 1. Context & Architecture Overview

Currently, the search results page and the checkout funnel both reside inside `src/app/(marketing-and-booking)/book/`:
- `book/page.tsx` renders search results and the filter bar.
- `book/[tripId]/` renders the 4 checkout steps (`passengers`, `review`, `payment`, `confirmation`).

### The Target Architecture:
1. **Search & Discovery Layer (`/ferries`):**
   - URL: `/ferries?tripType=...&from=...&to=...&departureDate=...&adults=...`
   - Semantics: Browse, filter, compare ferry schedules and pricing.
2. **Booking & Transaction Layer (`/book/[tripId]/*`):**
   - URL: `/book/[tripId]/review` ➔ `passengers` ➔ `payment` ➔ `confirmation`
   - Semantics: Dedicated multi-step checkout funnel for a chosen vessel/trip.
3. **Seamless Handoff:**
   - Clicking "Select / Book" on a ferry card on `/ferries` cleanly enters `/book/${tripId}/review`.
4. **Zero-Breaking Backward Compatibility:**
   - If anyone visits `/book?from=...` (old bookmarks/links), Next.js will cleanly redirect to `/ferries?from=...`.

---

## 2. Step-by-Step Execution Plan

### Task 1: Create the Dedicated `/ferries` Search Results Page
**File:** `src/app/(marketing-and-booking)/ferries/page.tsx`
- Create `src/app/(marketing-and-booking)/ferries/page.tsx` with:
  - Metadata: `title: "Available Ferries | IslandHop"`
  - Hero search banner with `Badge: SEARCH RESULTS`
  - Floating `<BookingSearchFilterBar />`
  - Dynamic `<BookingResultsList />`

### Task 2: Setup Backward Compatibility Redirect for `/book`
**File:** `src/app/(marketing-and-booking)/book/page.tsx`
- Update `book/page.tsx` to handle search parameters and redirect:
  ```typescript
  import { redirect } from "next/navigation";

  export default async function LegacyBookPage({
    searchParams
  }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
  }) {
    const params = await searchParams;
    const query = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (typeof val === "string") query.set(key, val);
    }
    redirect(`/ferries${query.toString() ? `?${query.toString()}` : ""}`);
  }
  ```
- *Benefit:* Any existing bookmark, cached URL, or old link immediately redirects to `/ferries` without 404!

### Task 3: Update Homepage Search Form
**File:** `src/components/widgets/landing/HeroSection.tsx:136`
- Change `return \`/book?\${params.toString()}\`;` to:
  ```typescript
  return `/ferries?${params.toString()}`;
  ```

### Task 4: Update Popular Route Cards
**File:** `src/components/widgets/booking/RouteCard.tsx:62`
- Change destination from `/book?from=...` to:
  ```typescript
  const targetUrl = `/ferries?from=${encodeURIComponent(fromVal)}&to=${encodeURIComponent(toVal)}`;
  ```

### Task 5: Update Search Filter Bar
**File:** `src/components/widgets/booking/RouteSearchFilterBar.tsx:20`
- Change `/book?from=...` to:
  ```typescript
  `/ferries?from=${encodeURIComponent(departurePort)}&to=${encodeURIComponent(destinationPort)}`
  ```

### Task 6: Update Review & Manage-Booking Return Links
**Files:**
- `src/app/(marketing-and-booking)/book/[tripId]/review/page.tsx:138,191`:
  - Change `<Link href="/book">Return to Search</Link>` to `<Link href="/ferries">Return to Search</Link>`
  - Change alternative route link to `/ferries?from=...`
- `src/app/(marketing-and-booking)/(private)/manage-booking/[bookingRef]/page.tsx:110,407`:
  - Change `<Link href="/book">Book a Ferry</Link>` to `<Link href="/ferries">Find a Ferry</Link>`

### Task 7: Verify FerryCard Checkout Handoff
**File:** `src/components/widgets/booking/FerryCard.tsx:52`
- Ensure selecting a card properly routes to:
  ```typescript
  `/book/${tripId}/review?passengers=...`
  ```
  (This keeps the checkout funnel under `/book/*` as intended).

### Task 8: Automated Verification & Typecheck
- Run `npm run typecheck` to guarantee 0 TypeScript errors.
- Run `npm run lint` on all touched files.
- Test in browser:
  1. Homepage search redirects to `/ferries?from=...`
  2. Ferry card click opens `/book/[tripId]/review`
  3. Visiting legacy `/book?from=...` smoothly redirects to `/ferries?from=...`
