# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:


 # Goalunit Club Analysis

A football club analytics dashboard built with React, TypeScript, and Vite using a sample of Goalunit club and player datasets.

The dashboard demonstrates a small data-to-interface workflow for recruitment and club analysis:

- Compare Transfer KPI values across Premier League clubs.
- Rank players by estimated fair price.
- Display contract expiration years alongside player values.
- Derive a main insight by comparing a selected club with the dataset average.
- Surface club value, revenue, squad structure, and recruitment signals in a responsive dashboard.

## Tech Stack

- React 19
- TypeScript
- Vite
- CSS
- Oxlint

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

The original CSV files are not loaded directly by the browser. In a production version, the files could be processed by a Python or Airflow pipeline, stored in PostgreSQL, and exposed to the frontend through an API.

## Project Structure

```text
src/
  components/
    PlayerValueTable.tsx
    TransferKpiChart.tsx
  data/
    goalunitData.ts
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

## Scope

This is a portfolio prototype for exploring Goalunit-style football intelligence. The player sample currently does not include a club ID, so player rankings represent a cross-club market sample rather than a complete club-specific squad valuation.
