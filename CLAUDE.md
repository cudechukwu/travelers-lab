@AGENTS.md

# Travelers’ Lab website

The public website of the Travelers’ Lab, a Wesleyan University digital-humanities research network studying how people, information and objects moved through the premodern world. It replaced the old WordPress site at travelerslab.research.wesleyan.edu.

The people asking you for changes are usually **faculty or students in the lab, not developers**. Explain what you changed in plain language, show where it appears on the site, and run the dev server so they can see it.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4. Read `node_modules/next/dist/docs/` before using a Next API you're unsure of (see AGENTS.md).
- Content lives in the repo as files, edited either directly or through **Keystatic** (a sign-in editor at `/keystatic`). There is no database.
- Hosting: Vercel (or similar). Every push to `main` redeploys.

```bash
npm install
npm run dev        # http://localhost:3000  (editor at /keystatic)
npm run build      # must pass before pushing
npx tsc --noEmit && npx eslint .
```

## Where things live

```
content/
  posts/*.mdoc        blog posts                     → /blog/<slug>
  projects/*.mdoc     research projects              → /research/<slug>
  publications/*.mdoc one file per publication       → /publications
  people/*.yaml       faculty, network, students     → /people
  pages/*.mdoc        page titles and opening lines; About, Teaching, Alumni text
  redirects.json      old WordPress URLs → new URLs (generated, see below)
public/media/<collection>/<slug>/   images and files for each entry
keystatic.config.ts   the content schema; the source of truth for every field
src/app/(site)/       pages (homepage is page.tsx)
src/components/       Hero, timeline + project list (projects.tsx), Prose (renders content), blocks.tsx
src/lib/content.ts    reads content via the Keystatic reader
scripts/import-wordpress.ts   one-off importer from the old site (see warning below)
```

The filename is the URL slug: `content/posts/summer-2026-chronicles-project-update.mdoc` → `/blog/summer-2026-chronicles-project-update`.

## Common tasks

### Add a blog post

Create `content/posts/<short-hyphenated-slug>.mdoc`:

```md
---
title: Fall 2026 Chronicles Update
date: 2026-12-10
authors:
  - Diana Tran
project: comparing-chronicles
excerpt: One or two sentences shown on the blog index.
---

Opening paragraph…

## A section heading

![Alt text describing the image](/media/posts/fall-2026-chronicles-update/figure-1.png "Optional caption shown under the image")
```

- `project` must be the slug of a file in `content/projects/` (or omit it). It links the post to that project page and its blog filter.
- Put images in `public/media/posts/<slug>/` and reference them as `/media/posts/<slug>/<file>`. Always write real alt text.
- Body is **Markdoc** (Markdown). Headings start at `##`. Raw HTML does not render. Tables use Markdoc syntax:
  ```
  {% table %}
  * Header A
  * Header B
  ---
  * cell
  * cell
  {% /table %}
  ```
- Leave `legacyPath` out of new posts; it only exists on imported ones.
- Posts are sorted by `date`; the newest four appear on the homepage automatically.

### Edit or add a project

`content/projects/<slug>.mdoc`. Fields: `title`, `shortTitle` (used on cards and the timeline), `status` (`active` or `archived`), `order`, `summary` (one sentence), `period`, `region`, `startYear`/`endYear` (CE, drive the homepage timeline; approximate is fine), `leads`, `team`, `methods`, `links`. Moving a project between “Active now” and the archive is just changing `status`.

### People

`content/people/<slug>.yaml`. `group` is `faculty`, `network`, `student` or `alumni`. `order` controls sort order (lower first; Jesse W. Torgerson is `0`). Students with a `classYear` move to Alumni automatically once their class has graduated (June of that year), so don't move them by hand. Photos go in `public/media/people/`. Only add an `email` someone has asked to be public. `hideFromContact: true` keeps a faculty member off the “Contact a faculty member” list on Get involved (they stay on People).

### Publications

`content/publications/<slug>.mdoc`. Fields: `title`, `authors` (in publication order), `date`, `kind` (`article`, `chapter`, `book`, `digital` or `data`), `venue` ("Published in"), `url`, `doi` (identifier only, e.g. `10.1111/hith.12276`). The body is the abstract. Sorted newest first; the year strip and type counts at the top of the page are built from these fields.

### Pages

About, Teaching (built from `courses`, `digital-history`, `acceleration-of-europe`) and the earlier-alumni text are in `content/pages/`. Edit the `.mdoc` body. A page's `intro` is the large opening line at the top: wrap key words in `*asterisks*` to print them dark (the rest is grey). Keep the dark words to one or two short phrases.

Page headers (`PageHead` in `blocks.tsx`): the page name sits small on one side with a fact or two (`meta`), the opening line large on the other. `flip` swaps sides (Blog, Get involved); `hideTitle` keeps the name for screen readers only (Blog). People has no header and starts with the faculty.

### Homepage project panel

Clicking a project in the homepage timeline or "Active now" list opens a side panel (`?project=<slug>`) instead of leaving the page; the full project page is one click away. The panel shows the first image in the write-up, cropped and greyscale; set `panelImage: whole` on a project to show it uncropped instead (book covers, charts).

### Site search

The search button in the header (or `/`, or Cmd/Ctrl+K) opens a panel that searches projects, publications, people, blog posts and the About/Teaching/alumni pages. The search list is built from the content files at build time (`src/lib/search.ts`, served at `/search-index.json`) and downloaded only when someone first opens search, so new content is searchable as soon as the site redeploys; nothing to maintain. To make a new page searchable, add it to the `pages` list in `src/lib/search.ts`. People results link to `/people#<slug>`.

## Design rules (keep the site consistent)

The look is deliberately “manuscript and map” rather than a tech template. When adding UI:

- **Colours** are CSS tokens in `src/app/globals.css`: `paper`, `ink`, `ink-2`, `ink-3`, `rule`, and one accent, `rubric` (red, as in rubricated manuscript headings). Don't introduce new colours. Dark bands use `bg-band` with `text-on-dark`.
- **Type**: Inter Tight for headings and UI (`display` class), EB Garamond for reading text and labels. Small labels use the `label` class (Garamond small caps, old-style numerals). Monospace (IBM Plex Mono, `font-mono`) is reserved for data-style lists and index numbers, as on Publications: the uppercase fact lists with red squares and the `01`, `02` numbering in `IndexList`. Don't use it for general labels.
- Section labels are `¶ Label` with a red pilcrow, not numbers.
- Headings use the existing size scale; copy an equivalent element's classes rather than inventing new sizes. Section headings all share one size (see `SectionHead` in `blocks.tsx`).
- Lists with thin horizontal rules, not boxed card grids.
- Long-form text goes through `<Prose>`; it handles spacing, figures and tables.
- Animation is decorative only and must respect `prefers-reduced-motion`. Never hijack scrolling.
- Copy style: plain and specific; prefer commas to em dashes in new text written for the site. Keep the lab members' own words in their posts and bios as written.

## Things to be careful with

- **Do not run `npm run import:wp` once people are editing content here.** It re-imports from the old WordPress site and overwrites `content/posts`, `content/projects`, `content/people` and `content/pages`. It exists only for the original migration.
- `content/redirects.json` keeps old WordPress links (cited in papers and DOIs) working. Don't delete it; the importer regenerates it.
- Search engines: `src/lib/site.ts` holds the site address and the `SITE_INDEXABLE` switch. The site is `noindex` until `SITE_INDEXABLE=true` and `NEXT_PUBLIC_SITE_URL` are set in the hosting dashboard. `src/app/sitemap.ts` and `robots.ts` are generated from content automatically; give every new page a `description` in its metadata.
- Don't commit `.env*` files (they hold Keystatic GitHub secrets).
- Before pushing: `npm run build` must pass. Then commit with a short message saying what changed for readers of the site (e.g. "Add Fall 2026 Chronicles update post").

## Publishing without code (Keystatic)

Locally, `/keystatic` saves straight to the files above. In production it signs editors in with GitHub and commits their changes, which triggers a redeploy. That mode is switched on with these environment variables (set them in the hosting dashboard, never in git):

```
NEXT_PUBLIC_KEYSTATIC_STORAGE=github
NEXT_PUBLIC_KEYSTATIC_REPO=<owner>/<repo>
KEYSTATIC_GITHUB_CLIENT_ID=…
KEYSTATIC_GITHUB_CLIENT_SECRET=…
KEYSTATIC_SECRET=…
NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG=…
```

The four GitHub values are created by Keystatic's setup flow: run the dev server with the first two variables set in `.env.local`, open `/keystatic`, and follow the prompt to create the GitHub App. It writes the rest into `.env.local`; copy them to the hosting dashboard. Each editor needs a GitHub account with write access to the repo.
