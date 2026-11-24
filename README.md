# Feather

A fast, local-first packing list for weighing your gear and planning a lighter pack. A modern take on LighterPack.

Feather keeps everything in your browser — no account, no server, no tracking. Download a JSON backup whenever you want to move or restore your packs.

## Features

- Multiple packs with duplication, renaming and deletion
- Gear grouped into categories, with quantities and inline editing
- Base weight, worn weight, consumables and total weight, recalculated live
- Flexible weight entry: `450`, `1.2 kg`, `12 oz`, or `1 lb 2 oz`
- Grams, ounces, or pounds display, stored internally in grams
- Self-contained share links that put the whole pack in the URL
- Drag-and-drop reordering and cross-category moves on desktop
- Touch-friendly category picker for moving gear on phones
- Local autosave plus downloadable/uploadable JSON backups
- Restores merge matching packs instead of duplicating them
- Responsive layout and system dark mode

## Run locally

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:3000`.

## Build

```bash
npm run build
npm run preview
```

The production bundle is written to `dist/`.

## Data & backups

Every change is saved to `localStorage` under `feather.library.v1`. The **Download** action exports all packs as a JSON backup; **Upload** restores packs by id (falling back to name), updating existing packs instead of adding duplicates.

**Share** turns the active pack into a link with all of its details in the query string. Opening the link loads the pack into the recipient's local library; nothing is sent to a server.

## Deployment

Ready to deploy on Vercel from the `main` branch using the Vite preset:

- Build command: `npm run build`
- Output directory: `dist`
