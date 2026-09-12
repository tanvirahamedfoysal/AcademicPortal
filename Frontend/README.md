# Researcher's Eden — Academic Research Portal Frontend

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
