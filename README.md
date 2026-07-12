# The Allowlist Ledger

A personal registry for tracking your NFT whitelist spots — project, chain,
mint date, wallet used, and status — with full CRUD and live countdowns to
each mint. Data is stored in your browser's `localStorage`, so nothing leaves
your machine.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Stack

- React 18 + Vite
- Tailwind CSS
- lucide-react icons
- No backend — entries persist in `localStorage` under the key
  `allowlist-ledger.entries.v1`

## Features

- Add / edit / delete whitelist entries
- Set a mint date & time per entry, with a live countdown
- Status stamps: Guaranteed, Confirmed, Entered/Maybe, Missed, Minted
- Search by project name, filter by status, sort by mint date
- Track chain, mint price, wallet used, project X handle, mint link, notes
- Summary stats: total tracked, upcoming mints, minting this week, secured spots

## Extending it

The whole app is one `useWhitelists` hook (`src/utils/useWhitelists.js`)
wrapping localStorage reads/writes. To move to a real backend later, swap
that hook's internals for API calls — the rest of the app (`App.jsx` and
components) only calls `addEntry`, `updateEntry`, `deleteEntry`, and reads
`entries`, so nothing else needs to change.
