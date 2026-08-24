# Goalunit Club Analysis

A football club analytics dashboard built with React, TypeScript, and Vite using a sample of Goalunit club and player datasets.

The dashboard demonstrates a small data-to-interface workflow for recruitment and club analysis:

- Compare Transfer KPI values across Premier League clubs.
- Switch between clubs and seasons with recalculated dashboard values.
- Rank each selected club's players by estimated fair price.
- Display contract expiration years alongside player values.
- Derive insights from KPI extremes, fair-price concentration, contract risk, revenue efficiency, and year-over-year movement.
- Surface club value, revenue, squad structure, and recruitment signals in a responsive dashboard.

## Tech Stack

- React 19
- TypeScript
- Vite
- CSS
- Oxlint
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app is then available at the local URL shown by Vite, usually `http://localhost:5173`.

## Data

The current prototype uses a compact, typed dataset in [`src/data/goalunitData.ts`](src/data/goalunitData.ts). It is based on the supplied `clubs.csv` and `players.csv` files and includes:

- Club competition and season
- Transfer KPI
- Total assets and revenue
- Player fair price
- Contract expiration
- Club-to-player mapping for the current club-specific sample

The dashboard labels the source snapshot as `2025-05-19`. Transfer KPI comparisons use the mean of all clubs in the selected season. Fair-price leaders are sorted in descending order by `fairPrice`, while contract risk includes players whose `contractExpiration` falls within two years of the season end.

The original CSV files are not loaded directly by the browser. In a production version, the files could be processed by a Python or Airflow pipeline, stored in PostgreSQL, and exposed to the frontend through an API.

## Data Boundary

The React application reads through [`src/data/goalunitRepository.ts`](src/data/goalunitRepository.ts), which provides the API-shaped `getClubOverview()` function and selector helpers. The repository currently uses local TypeScript data, but it is designed to be replaced by a Go/PostgreSQL service without changing the dashboard components.

`getClubOverview()` returns the selected club, season comparison records, player rankings, contract-risk records, financial ratios, year-over-year KPI movement, and the generated insight in one view model.

To regenerate a typed dataset from the supplied files:

```bash
npm run prepare:data -- \
  --clubs /path/to/clubs.csv \
  --players /path/to/players.csv
```

This writes `src/data/goalunitData.generated.ts`. Empty CSV values become `null`, numeric fields are converted to numbers, and duplicate player snapshots are reduced to the highest fair-price record for each player and season. The supplied `players.csv` does not include `clubId`, so the preparation output retains `clubId: null`; the current dashboard sample uses an explicit club mapping for its selected-club view.

## Project Structure

```text
src/
  components/
    PlayerValueTable.tsx
    TransferKpiChart.tsx
  data/
    goalunitData.ts
    goalunitData.test.ts
    goalunitRepository.ts
    goalunitRepository.test.ts
scripts/
  prepare_data.py
tests/
  test_prepare_data.py
App.tsx
App.css
index.css
```

## Validation

Run the production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

Run the data preparation tests:

```bash
npm test
```

The test command runs both the Python preparation tests and the Vitest frontend data-layer tests.

## Scope

This is a portfolio prototype for exploring Goalunit-style football intelligence. The current sample supports club-specific views for the four comparison clubs and includes prior-season club records for year-over-year KPI analysis. Player-to-club relationships should eventually come from a maintained source dataset or backend join rather than manual mapping.
