# Amandari Land Map

A Vue 3 and MapLibre GL proof of concept for exploring Amandari land parcels and building footprints in Kedewatan, Ubud. The application presents the data on an interactive map with searchable parcel records, attribute popups, a detail sidebar, layer controls, and multiple basemaps.

## Features

- Displays parcel polygons and building footprints from local GeoJSON files.
- Searches parcels by their available attributes and focuses the selected parcel on the map.
- Shows a popup and a detailed sidebar record for both parcels and buildings.
- Highlights the active parcel or building with a dedicated outline; parcel and building outlines use distinct colours for clarity.
- Clears the sidebar detail and map highlight when a map popup is closed.
- Provides adjustable visibility, fill opacity, and outline opacity for parcel and building layers.
- Calculates the parcel summary from the `LUASTERTUL` field and labels it as the total written land-parcel area.
- Keeps long parcel and building records scrollable within the detail panel.
- Includes Google Imagery, OpenStreetMap, OSM Humanitarian, and OpenFreeMap Dark basemap options.
- Uses the Aman wordmark as a local header asset.

## Technology

- Vue 3
- TypeScript
- Vite
- MapLibre GL JS
- GeoJSON
- pnpm

## Project structure

```text
src/
├── assets/
│   ├── aman-logo.svg
│   └── data/
│       ├── Bangunan.geojson
│       └── Polygon Amandari.geojson
├── components/
│   ├── map/          # MapLibre map, popups, and basemap control
│   └── sidebar/      # Search, layer controls, summary, and detail panels
├── composables/      # GeoJSON loading and validation
├── lib/map/          # Map sources, layer IDs, styles, and geometry helpers
├── types/            # Parcel and building TypeScript types
└── App.vue           # Application state and component coordination
```

## Getting started

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later

### Install dependencies

```sh
pnpm install
```

### Start the development server

```sh
pnpm dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

### Create a production build

```sh
pnpm build
```

### Preview the production build

```sh
pnpm preview
```

## Data expectations

The parcel dataset must be a non-empty GeoJSON `FeatureCollection` whose features use `Polygon` geometries and numeric IDs. The building dataset must be a non-empty GeoJSON `FeatureCollection` whose features use `MultiPolygon` geometries.

The sidebar summary uses the parcel `LUASTERTUL` property when available. This represents the written parcel area, not an area calculated from the map geometry.

## Basemaps

The first three basemaps are raster tile layers. OpenFreeMap Dark is loaded as an external vector style and therefore needs network access when selected. Tile and style providers may impose their own terms, usage limits, and attribution requirements; review those terms before deploying the application publicly.

## Notes

This repository is a proof of concept. The Aman brand assets and the spatial datasets must only be used with the appropriate permission and in accordance with their applicable terms.
