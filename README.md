# Amandari Land Map

A proof of concept (POC) for exploring Amandari land parcels and building footprints in Kedewatan, Ubud, while managing rooms and assets for the selected building. The application runs entirely in the browser: spatial data is loaded from local GeoJSON files, while room and asset data is stored in browser local storage.

## Features

### Map and spatial data

- Displays land-parcel polygons and building footprints from local GeoJSON files.
- Selects a parcel or building from the map and shows its popup and detail panel.
- Searches parcels by NIB or rights type, and buildings by number or location code.
- Highlights the selected feature and focuses the map on its area.
- Shows parcel counts, total `LUASTERTUL`, and a parcel breakdown by rights type.
- Adjusts visibility, fill opacity, and outline opacity for parcel and building layers.
- Provides Google Imagery, OSM Humanitarian, OpenStreetMap, and OpenFreeMap Dark basemaps.
- Includes navigation controls, a metric scale, visible-feature statistics, and a responsive mobile layout.

### Rooms and assets

- Opens a **Manage Rooms & Assets** panel from the selected building's details.
- Adds, views, edits, deletes, and searches rooms within each building.
- Stores a room's status, type, floor, area, capacity, responsible unit, notes, and multiple photos.
- Shows a room photo gallery with left/right keyboard navigation and `Esc` to close.
- Adds, edits, and deletes assets within a room, including identification, location, specification, acquisition, condition, maintenance, ownership, documentation, and photo data.
- Shows a room-status summary and the total number of assets for the active building.

### Appearance

- Supports light and dark modes; the selected mode is persisted in the browser.
- Uses the local Aman wordmark asset in the header.

## Technology

- Vue 3 + TypeScript
- Vite
- MapLibre GL JS
- GeoJSON
- pnpm

## Prerequisites

- Node.js `^20.19.0` or `>=22.12.0`
- pnpm 9 or later

## Getting started

Install dependencies:

```sh
pnpm install
```

Start the development server:

```sh
pnpm dev
```

Open the address printed by Vite, usually `http://localhost:5173`.

Create a production build, including TypeScript type checking:

```sh
pnpm build
```

Preview the production build locally:

```sh
pnpm preview
```

## Usage flow

1. Select **Search buildings** in the left panel, or click a building footprint on the map.
2. Select a building to view its details.
3. Click **Manage Rooms & Assets**.
4. Add or select a room. From a room card, click **Assets** to manage the assets associated with that room.

## Room and asset storage

Rooms and assets are not connected to an API or database yet. They are stored in `localStorage` for the active browser and device:

| Data | `localStorage` key |
| --- | --- |
| Rooms | `tl_rooms` |
| Assets | `tl_assets` |
| Theme preference | `amandari-land-map-theme` |

As a result, changes are not synchronized to other users or devices and can be lost when site storage is cleared. Room and asset photos are converted to data URLs before being stored; large or numerous uploads can exceed the browser's `localStorage` quota.

To restore the sample room and asset data, remove the `tl_rooms` and `tl_assets` keys in browser DevTools and reload the page. The seed data will be created again.

## Spatial data

The source data is located in `src/assets/data/`:

| File | Data | Expected format |
| --- | --- | --- |
| `Polygon Amandari.geojson` | Land parcels | A non-empty GeoJSON `FeatureCollection` with `Polygon` geometries, numeric feature `id` values, and numeric `properties.OBJECTID` values for map interaction. |
| `Bangunan.geojson` | Buildings | A non-empty GeoJSON `FeatureCollection` with `MultiPolygon` geometries. |

The parcel-area summary uses the source data's `LUASTERTUL` value. It is the recorded parcel area, not an area calculated from map geometry.

Room and asset records currently use the building feature index, starting at `0`, as their building identifier. If the feature order in `Bangunan.geojson` changes after room or asset data has been saved, remove `tl_rooms` and `tl_assets` so those records cannot be associated with the wrong building.

## Project structure

```text
src/
├── assets/
│   ├── aman-logo.svg
│   └── data/
│       ├── Bangunan.geojson
│       └── Polygon Amandari.geojson
├── components/
│   ├── building/       # Room and asset modals, lists, details, and forms
│   ├── map/            # MapLibre map and basemap control
│   └── sidebar/        # Search, summary, layer, and spatial-detail panels
├── composables/        # GeoJSON loaders and localStorage-backed room/asset stores
├── lib/                # Map constants and parcel utilities
├── types/              # Spatial, room, asset, and theme data types
└── App.vue             # Application state and component coordination
```

## Deployment notes

The GeoJSON files and Aman assets are bundled locally, but every basemap fetches tiles or a style from a third-party provider and requires an internet connection. Review the terms of use, usage limits, and attribution requirements for Google, OpenStreetMap/HOT, and OpenFreeMap before publishing the application.

This repository is a POC. Use Aman brand assets and spatial datasets only with the appropriate permission and in accordance with the applicable terms. For production use, replace `localStorage` with an API and database that provide authentication, authorization, upload validation, and backups.
