## What this repo is

- Next.js (app router) app generated with create-next-app. Main UI lives in the `app/` directory.
- Next version: 16.x, React 19.x, TypeScript (strict). Tailwind + PostCSS are present.

## Quick dev commands (use from repo root)

- Start dev server (default port 3000): `npm run dev` (also works with yarn/pnpm/bun)
- Build for production: `npm run build`
- Run production server (after build): `npm start`
- Lint: `npm run lint` (runs `eslint`)

## Key files to inspect / edit

- `app/layout.tsx` — root layout; fonts loaded via `next/font/google` (Geist / Geist_Mono in this project).
- `app/page.tsx` — home page. Good starting point for small UI changes.
- `app/globals.css` — global styles / Tailwind entry (edit for global CSS changes).
- `public/` — static assets (SVGs referenced by `next/image` in `app/page.tsx`).
- `package.json` — scripts and dependencies (Next/Tailwind/ESLint versions).
- `tsconfig.json` — TypeScript is strict and sets a path alias `@/* => ./*`.

## Discoverable conventions and patterns (do this in PRs)

- App Router: add new routes under `app/` using `page.tsx`/`route.ts` conventions. Prefer server components by default. If you need client behavior (hooks/state), add `"use client"` at the top of the file.
- Fonts: project uses `next/font/google` in `app/layout.tsx`; change font variables there and use the CSS variables in components.
- Styling: Tailwind utility classes are used inline in JSX; global rules belong in `app/globals.css`.
- Images: use `next/image` with assets placed in `public/` (see `app/page.tsx`).
- TypeScript: strict mode enabled. Make type-safe edits and run the dev server to catch type errors early. No emitted JS via `tsconfig` (noEmit: true).

## Integrations & external notes

- Deployment: README suggests Vercel. The project is a typical Next.js app and will deploy to Vercel without special changes.
- Build system: standard `next build` / `next start` lifecycle. No custom build pipeline detected in the repo root.
- PostCSS/Tailwind: `postcss.config.mjs` and `tailwindcss` devDependency indicate Tailwind processing; edit `app/globals.css` rather than adding raw global CSS in components.

## AI agent guidance — practical rules of engagement

1. Always prefer small, incremental edits and run the dev server to verify (fast feedback loop).
2. When adding interactivity that uses state or effects, add `"use client"` to the top of the component file and keep the scope minimal.
3. Respect the TypeScript config and path alias `@/*`. When adding imports, use `@/...` where appropriate.
4. Avoid changing runtime config (`next.config.ts`) unless necessary — it currently contains no custom settings.
5. Run `npm run lint` after changes and fix lint errors before opening a PR.

## Examples (where to change things)

- Change home heading: edit `app/page.tsx` (the H1 currently says "To get started, edit the page.tsx file.").
- Change fonts: edit `app/layout.tsx` (the Geist/Geist_Mono next/font setup and CSS variable usage).
- Add a global utility: edit `app/globals.css` and rebuild if needed.

If anything in this doc is unclear or you want more detail (tests, CI, or preferred PR style), tell me which part to expand and I'll iterate.

## Generic Coding Instructions

- Use generic package/Component names.

## Evaluation Criteria

- Must adopt clean code practices

- Readability: Self-explanatory variable, method, and class names & Consistent formatting & style (indentation, spacing, naming conventions)

- Low Cyclomatic complexity

- Well-structured into small, reusable functions/classes

- Low coupling, high cohesion

- Single Responsibility Principle (each Component/class/function does one thing)

- Uniform error handling strategy

- Unit Test coverage > 70%

- Minimal comments — the code itself explains intent

- Use of latest React 18 features
