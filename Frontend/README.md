# Dr. Tania Islam — Academic Research Portal Frontend

Next.js frontend for Dr. Tania Islam's personal academic portfolio and the existing FastAPI academic portal.

## Current design

- Researcher-first landing page centered on Dr. Tania Islam
- Off-white, light cyan, and lightest-blue visual system
- No baby-pink theme colors
- Responsive public pages and role-based workspaces
- Full-image fitting for portfolio/gallery media on phones and tablets
- Dedicated portfolio photo, photo gallery, publications, resources, collaborators, lab members, and contact areas
- No sparkle/star decoration in the UI

## Portfolio quick information

Admin → **Portfolio Editor** now includes a configurable **Quick info** builder.

- Add any existing portfolio field to the public quick-info card
- Add custom fields with your own field name and value
- Rename labels
- Move fields up/down to control public display order
- Remove any quick-info row
- Empty values are automatically hidden on the public landing page
- Existing portfolio values such as occupation, designation, education, department/school, university/institution, phone, email, and research interests can stay linked to their normal Portfolio Editor inputs

Quick-info configuration is persisted through the existing portfolio contract using the same reserved metadata record already used for portfolio/gallery media. No backend route or database change is required.

## FastAPI integration

The frontend continues to use the existing `/api/v1` routes. This version also adds a small backend extension for persistent Lab Member labels (`students.is_lab_member`) so Admin/Moderator selections are shared across devices and visible publicly. Core existing API behaviour remains unchanged. Existing routes include:

- OAuth-style login (`/auth/login`)
- Portfolio (`/portfolio`)
- Public and authenticated articles (`/articles/...`)
- Collaborators (`/collaborators`)
- Students and pending verification (`/students/...`)
- Moderators (`/moderators/...`)
- Repository documents (`/repository/documents`)
- Contact messages (`/contact`)
- Profile and password updates (`/profile/me`)
- Image upload/delete (`/images`)

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The included `.env.local` points to the existing deployed FastAPI backend. Update `NEXT_PUBLIC_API_URL` and `FASTAPI_BASE_URL` only if the backend location changes.

## Production build

```bash
npm run build
npm start
```

The project is pinned to Next.js 15.5.25 with React 19.0.0. If dependencies were installed from an older copy, remove `node_modules`, `.next`, and `package-lock.json`, then run `npm install` again.

## v5.0.4 UI and editor pass

- Locked the intended light color scheme so supported browser dark-mode transforms do not recolor the dashboard.
- Reworked Admin and Moderator student management for narrow windows and phones: stacked search/header, mobile record cards, larger touch actions, and desktop tables only when there is room.
- Improved registration layout on split-screen/small displays and added client-side validation for malformed email addresses, usernames, batches, and password length.
- Added password visibility control and cleaner OTP states.
- Rebuilt the article editor with Write / Preview / Split modes, LaTeX insertion helpers, responsive full-height editing, and MathJax preview.
- Public article pages now typeset LaTeX math while preserving the raw article source stored by the existing FastAPI backend.
- Preserved the existing backend contracts used by the editor and UI. The separate Lab Member label feature adds its own migration and endpoints.
- Included the Netlify Next.js runtime configuration so the SSR routes continue to deploy correctly.

## v5.0.4 interface and article-editor audit

- Locked the application to a light color scheme and added a Dark Reader opt-out meta flag so browser dark-mode tools do not recolor the cyan/off-white dashboard palette.
- Reworked admin and moderator student management for narrow desktop windows, tablets and phones, including stacked controls and card views below the table breakpoint.
- Removed the redundant global floating-home control so it no longer competes with hosting/provider badges; navigation back to the portfolio remains available in auth screens and the dashboard sidebar.
- Added stricter registration validation for full name, username, email, student batch and password, with inline feedback before the OTP step.
- Rebuilt the article writing experience with Write / Preview / Split modes, LaTeX insertion helpers and live MathJax rendering. Public article pages use the same renderer.
- Adjusted article-editor heights and mode controls for short phone displays so the editor and save controls remain reachable.
- Improved collaborator, moderator and message dialogs as mobile bottom sheets with touch-sized actions.
- Standardized remaining primary actions to the cyan palette and removed stale/technical placeholder copy from public resource, publication and contact views.
- Removed unused legacy UI components that were no longer referenced by any route.
- No FastAPI route, backend source file or database contract was changed.

## v5.1.0 premium editor, lab members, and login flow

- Rebuilt Admin/Moderator article creation around the rich editor pattern from the supplied previous project: WYSIWYG formatting, headings, lists, links, responsive media grids, tables, image uploads, and source-preserving LaTeX equations.
- Added local MathJax assets and a live LaTeX equation dialog with inline/display modes and example formulas. Article pages render the same stored equations, tables, links, and media.
- Replaced the public Community destination with **Lab Members**. Active members are loaded from the existing students APIs and enriched from each member detail endpoint; the old `/contributors` URL redirects to `/lab-members`.
- Changed successful login behavior for every role so users return to the public landing page. The dashboard remains available from the site navigation.
- No FastAPI/backend route or database change is required.

## v5.1.1 sticky article editor toolbar

- The premium article formatting toolbar is now sticky inside the article modal.
- As the article body grows and the editor scrolls, formatting, media, table, link, and LaTeX controls stay pinned at the top of the editor viewport.
- The toolbar remains horizontally scrollable on narrow phones while staying pinned vertically.
- No backend or article payload format changes are required.

## Lab Members developer credits and labels

The public **Lab Members** page has a static **Special Thanks** section for the two portal developers, followed by dynamically labelled student lab members.

Developer photos are loaded from:

- `public/developers/tanvir.jpg`
- `public/developers/mahruf.jpg`

If either photo is missing, the UI uses an initials placeholder. Add the real files using those exact names before deployment.

Admin and Moderator can label/unlabel active students from **Students**. The public page only loads students with `is_lab_member = true`.

## v5.4.0 – Custom landing section

- Split the right-side landing rail into Recent publications and a dashboard-managed Custom Section.
- Added Admin > Custom Section for a custom header and ordered content items.
- Each item supports a name plus description, link, or both; description items open in a modal and link-only items open directly.
- Custom-section data is stored through the existing portfolio metadata payload, so no additional backend endpoint is required.
