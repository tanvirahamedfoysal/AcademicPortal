# Dr. Tania Islam — Academic Research Portal Frontend

Next.js frontend for Dr. Tania Islam's personal academic portfolio and the existing FastAPI academic portal.

## Current design

- Researcher-first landing page centered on Dr. Tania Islam
- Off-white, light cyan, and lightest-blue visual system
- No baby-pink theme colors
- Responsive public pages and role-based workspaces
- Full-image fitting for portfolio/gallery media on phones and tablets
- Dedicated portfolio photo, photo gallery, publications, resources, collaborators, community, and contact areas
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

## Existing FastAPI integration

The backend API is not modified. The frontend continues to use the existing `/api/v1` routes, including:

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
