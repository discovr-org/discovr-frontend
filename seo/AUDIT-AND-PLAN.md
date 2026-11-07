# discovr-frontend SEO audit and plan

Date: 2026-11-07
Method: code-level audit by hand, using the checklist from the `claude-seo` `seo-audit` skill. No live crawl, no Lighthouse, no Search Console. Items marked (verify) need a live check once the plugin is loaded and run on https://www.discovr.in.

Prod host (from canonicals): `https://www.discovr.in`

## 1. Audit

### What is already good
- Info pages (`about`, `help`, `how-we-pick`, `list-with-us`, `legal/*`) have title, description, canonical, OpenGraph, Twitter card.
- One `<h1>` per screen.
- `lang="en"`, viewport, theme colour, web manifest, icons all set.
- Fonts use `next/font` with `display: swap`.
- Most images use `next/image`.
- Legacy `/privacy` and `/terms` have permanent redirects.

### Findings

| # | Sev | Area | Finding | Where |
|---|-----|------|---------|-------|
| 1 | Critical | Indexing | No `robots.ts` / `robots.txt`. No crawl rules, no sitemap pointer. | `src/app/` |
| 2 | Critical | Indexing | No `sitemap.ts`. Experience pages (the money pages) are not listed anywhere crawlers can find. | `src/app/` |
| 3 | Critical | On-page | Experience detail page has **no `generateMetadata`**. Every experience shows the site default title/description. No canonical, no OG image. | `src/app/experiences/[slug]/page.tsx` |
| 4 | Critical | Content | Home page is a client component (`"use client"`) that builds the feed in the browser. Crawlers may see only the hero text and no experience links. (verify with view-source / rendered HTML) | `src/features/home/components/ExploreFeed.tsx` |
| 5 | High | Schema | No JSON-LD anywhere. Missing `Organization`, `WebSite`, and per-experience `Event` / `TouristAttraction` / `LocalBusiness`-style markup. | whole app |
| 6 | High | On-page | Home has no OG / Twitter / canonical. Root layout has no `metadataBase`, no `openGraph`, no default share image. Shared links look blank. | `src/app/layout.tsx` |
| 7 | High | On-page | Title bug: pages set `"About \| discovr"` but the root template adds `" · discovr"`. Result: `About \| discovr · discovr`. | `src/app/(info)/*/page.tsx` |
| 8 | High | Indexing | Private screens (`/profile`, `/saved`, `/search`, `~offline`) have no `noindex`. Thin, user-only pages can get indexed. | `src/app/{profile,saved,search,~offline}` |
| 9 | Medium | Indexing | `/experiences/[slug]?state=loading\|offline\|error` renders demo states. Those URLs can be crawled as duplicates. | `src/app/experiences/[slug]/page.tsx` |
| 10 | Medium | Images | Raw `<img>` in home hero and TopNav skip `next/image` (no resize, no lazy, no format). | `ExploreFeed.tsx:136,176`, `TopNav.tsx:47` |
| 11 | Medium | Images | Card image on home has `alt=""`. Fine if decorative, wrong if it is the experience photo. (verify) | `ExploreFeed.tsx:178` |
| 12 | Medium | Perf | 3rd-party JS (PostHog) loads on every page. Check LCP / INP impact. (verify) | `src/instrumentation-client.ts` |
| 13 | Medium | Perf | Home feed fetches after hydrate, so LCP waits on API round trip. (verify) | `ExploreFeed.tsx` |
| 14 | Low | Content | Info pages are thin by design. Only 6 indexable content pages besides experiences. No blog / guides / city or category pages. | n/a |
| 15 | Low | AI search | No `llms.txt`. AI crawlers are not addressed in `robots`. | n/a |
| 16 | Low | Security | Security headers (CSP, HSTS, X-Content-Type-Options, Referrer-Policy) not set in `next.config.ts`. (verify what host adds) | `next.config.ts` |

Rough health score (code-only guess): **~45 / 100**. Biggest drag is that crawlers cannot discover or tell apart experience pages.

## 2. Plan

Rules for all steps: follow `../.cursor/rules/discovr-build.mdc` and `discovr-code`. Read `node_modules/next/dist/docs/` for Metadata API before coding (this Next version has breaking changes).

### Phase 1: Make pages findable (Week 1)
1. Add `src/app/robots.ts`: allow `/`, disallow `/profile`, `/saved`, `/search`, `/ingest`, `/q/`; point to sitemap. (#1)
2. Add `src/app/sitemap.ts`: static pages + every experience slug from `fetchCatalogCards()` with `lastModified`. (#2)
3. Add `generateMetadata` to `experiences/[slug]/page.tsx`: title, description, canonical, OG image (first hero image), Twitter card. Reuse `fetchCatalogExperience` (it is already cached, so no extra call). (#3)
4. Add `metadataBase`, default OG image, default OG/Twitter, and home canonical in `layout.tsx` / `page.tsx`. (#6)
5. Fix title double-brand: change info page titles to plain `"About"`, etc., so the template adds ` · discovr`. (#7)
6. Add `robots: { index: false }` metadata to `profile`, `saved`, `search`, `~offline`. For `?state=` on experiences, set canonical to the clean URL. (#8, #9)

Done when: `/robots.txt` and `/sitemap.xml` load; view-source of an experience shows its own title, canonical, og:image.

### Phase 2: Let crawlers see the content (Weeks 2-3)
7. Check home with view-source. If the feed is empty, server-render the first page of cards (fetch in a server component, pass to `ExploreFeed` as props; keep interactivity client-side). Make sure every card is a real `<a href="/experiences/slug">`. (#4, #13)
8. Add JSON-LD: `Organization` + `WebSite` in root layout; per-experience structured data on the detail page (type chosen after reading data shape: `Event` for timed things, `TouristAttraction`/`LocalBusiness` for places). Escape `<` in the JSON string. (#5)
9. Swap raw `<img>` for `next/image` with `priority` on the hero; add real `alt` to experience card photos. (#10, #11)

Done when: Google Rich Results Test passes on one experience; rendered HTML of home has experience links.

### Phase 3: Speed and safety (Month 2)
10. Run Lighthouse / PageSpeed on home + one experience (mobile). Fix LCP first. Defer PostHog init until idle if it hurts INP. (#12)
11. Add security headers in `next.config.ts` `headers()`. Test the PWA and PostHog `/ingest` still work. (#16)

### Phase 4: Content and authority (Ongoing)
12. Add listing pages that people actually search: by city, by category ("things to do in <city> tonight"). Each gets its own metadata and sitemap entry. (#14)
13. Add `llms.txt` and an explicit AI-crawler policy in `robots.ts`. (#15)
14. Connect Search Console, submit the sitemap, review coverage monthly.
15. Re-run the audit with the plugin after each phase. Store results in `seo/` and compare scores.

## 3. Then re-audit with the plugin
Restart Claude Code in `discovr-frontend/`, accept the plugin prompt, then:
```
/seo setup
/seo audit https://www.discovr.in
```
That gives the live numbers for every "(verify)" row above.

---

## 4. Update 2026-11-07: checklist items

Host decision: **non-www** (`https://discovr.in`). Canonicals changed from `www` to this.

| Item | Status |
|------|--------|
| Remove noindex | Nothing to remove. No `noindex` or `X-Robots-Tag` exists in code. Private screens are blocked in `robots.ts` instead. Also check Vercel/host settings for a "noindex" header on previews or prod. |
| Check robots | Done: `src/app/robots.ts` (allows `/`, blocks `/profile /saved /search /ingest/ /q/ /~offline`, lists sitemap). |
| Sitemap | Done: `src/app/sitemap.ts` (static pages + every experience). **You still submit it** in Search Console. |
| www to non-www | Done in `next.config.ts`. **Also** set it in the host's domain settings and make `discovr.in` the primary domain. |
| Title + description on all pages | Done: home, search, saved, profile, offline, experiences (per listing), all info pages. Fixed doubled brand in titles. |
| Search Console | Code ready. **You:** add property, copy the HTML-tag token into `NEXT_PUBLIC_GSC_VERIFICATION`, deploy, click Verify, submit `https://discovr.in/sitemap.xml`. (A DNS TXT record also works and needs no code.) |
| Google Analytics | Code ready. **You:** make a GA4 property, put the `G-...` id in `NEXT_PUBLIC_GA_ID`, deploy. Update the privacy page: it says what we collect, GA adds cookies. |

## 5. AI SEO (GEO)

Done now:
- `public/llms.txt`: plain summary and key links for AI tools.
- `robots.ts` allows all bots, so AI crawlers can read us.
- `Organization` + `WebSite` JSON-LD in the root layout.

Next, biggest wins first:
1. **Server-render the home feed** (finding #4). AI crawlers mostly do not run JavaScript. If the HTML is empty, they see nothing.
2. **Per-experience JSON-LD** (`Event` or `TouristAttraction` / `FoodEstablishment`, with `offers`, `address`, `geo`, `aggregateRating` from reviews). Use `place.lat/lng`, `price`, `schedule`.
3. **Answer-style text on each experience.** Open with one plain fact sentence: what it is, where, how long, price, who hosts. AI quotes short, self-contained passages. The `verdict` and `about` fields are the right place.
4. **Name the entity everywhere.** Same name, same one-line description, same logo on site, Instagram, Google Business Profile, Wikidata if eligible. Add `sameAs` links to Organization once social URLs are final.
5. **Authority pages.** Expand `how-we-pick` and `about` with real names, photos and "we visited on <date>". Add `lastReviewed` dates to listings. These are trust signals.
6. **City and category pages** ("things to do in Goa tonight"). These match the questions people ask AI.
7. **Markdown copies** of key pages (`/about.md`, `/how-we-pick.md`) linked from `llms.txt`. Optional.
8. **Measure.** After launch, ask ChatGPT, Perplexity, Gemini and Google AI Mode the questions your listings answer. Note who gets cited. Re-run `/seo geo https://discovr.in` with the plugin each month.

## 6. Update: AI SEO steps 1 and 2 done
- Home feed is fetched on the server and passed to `ExploreFeed` as `initialCards`, so first HTML has every `/experiences/<slug>` link. (`src/app/page.tsx`)
- Each experience page ships JSON-LD: `LocalBusiness` (venues) or `TouristTrip` (trips), with offer, rating and FAQ when data exists. (`src/shared/seo/utils/experienceSchema.ts`)
- Not yet verified against real API data. Check: view-source on `/` and one `/experiences/<slug>`, then Google Rich Results Test.
