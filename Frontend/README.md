# Dr. Tania Islam — Academic Research Portal Frontend

Premium Next.js frontend for the existing FastAPI academic portal backend.

## Design direction

- Researcher-first international academic portfolio aesthetic
- Information-dense landing page with live research/publication/resource/community signals
- Forest, ivory, warm gold visual system with serif-led scholarly typography
- Responsive public navigation and role-based workspaces
- Public portfolio, publications, resource repository, collaborations, community, and contact pages
- Consistent Admin, Moderator, and Student workspace shell

## Existing FastAPI integration

The backend API was not modified. The frontend is aligned to the existing `/api/v1` contracts, including:

- OAuth-style login (`/auth/login`)
- Portfolio (`/portfolio`)
- Public and authenticated articles (`/articles/...`)
- Collaborators (`/collaborators`)
- Students and pending verification (`/students/...`)
- Moderators (`/moderators/...`)
- Repository documents (`/repository/documents`)
- Contact messages (`/contact`)
- Profile and password updates (`/profile/me`)

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

The included `.env.local` points to the current deployed FastAPI backend. If you deploy to a different backend, update `NEXT_PUBLIC_API_URL` and `FASTAPI_BASE_URL`.

## Production build

```bash
npm run build
npm start
```

## Dependency compatibility note

This frontend is pinned to Next.js 15.5.25 with React 19.0.0. If you previously installed dependencies from an older copy, remove `node_modules`, `.next`, and `package-lock.json` before running `npm install` again.

## Personal researcher landing page update

The main portfolio now centers Dr. Tania Islam immediately below the unchanged public navbar:

- vertical social/researcher-account rail powered by the existing portfolio URL fields
- dedicated rectangular **Portfolio Photo** (separate from the account/profile photo)
- quick researcher information for name, occupation, education, designation, phone, and email
- prominent About Me panel
- achievement/photo-gallery slideshow with up to 10 images
- per-photo description and optional related links
- live recent papers/publications rail sourced from `/articles/public`
- researcher-centered supporting sections below the portfolio stage

### Admin media workflow

Admin navigation now includes **Necessary Photos** at `/admin/photos`.

It uses only existing backend routes:

- `POST /api/v1/images` for image upload
- `DELETE /api/v1/images` for asset cleanup/removal
- `GET/PUT /api/v1/portfolio` for portfolio media references and gallery metadata

Because the current backend does not expose a dedicated gallery table/endpoint and the backend must remain unchanged, the frontend stores a reserved structured metadata record inside `research_interests`. The UI filters that reserved record out everywhere research interests are displayed. This allows portfolio-photo/gallery data to persist using the current FastAPI contract without a backend migration.

The admin **Profile Settings** page also supports uploading the account profile photo through `/images`. For the admin account, its About Me/description field is synchronized to `portfolio.public_bio`, which is the public field the landing page can read without exposing an authenticated token.

## Pastel theme + mobile responsiveness update

The current frontend uses Dr. Tania Islam as the site identity throughout. The visual system centers off-white (`#fffaf7` / `#fffdfb`), baby pink (`#f8dce7`), light cyan (`#dff7f6`), and lightest blue (`#edf6ff`), with deeper rose/cyan accents only where extra contrast is required for controls.

The personal portfolio stage is responsive down to small phone widths. Portfolio and achievement/gallery media use full-image containment on phones/tablets so uploaded photos are not cut off, while large desktop breakpoints retain the editorial crop. Navigation, dashboard sidebar, auth screens, public pages, cards, and dashboard headers share the same pastel system.
