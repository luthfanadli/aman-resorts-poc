# Amandari Land Map

Web map Vue 3 + MapLibre untuk menampilkan 91 bidang tanah Amandari di atas
Google satellite imagery. Atribut bidang dapat dicari dan dibuka melalui popup.

## Struktur frontend

- `App.vue` hanya mengatur state dan komunikasi antar-komponen.
- `components/map/ParcelMap.vue` memiliki seluruh lifecycle MapLibre.
- `components/sidebar/` berisi pencarian, kontrol layer, ringkasan, dan detail.
- `composables/useParcelData.ts` memuat dan memvalidasi GeoJSON satu kali.
- `lib/map/` berisi konstanta layer dan helper geometri.

MapLibre v6 memakai worker URL eksplisit agar Vite membundel worker GeoJSON.
Tanpa konfigurasi ini basemap raster dapat tampil, tetapi layer persil tidak
akan diproses.

## Development

```sh
pnpm dev
```

## Memperbarui data

Letakkan komponen shapefile bernama `Polygon_Amandari_Join` di
`src/assets/data`, kemudian jalankan:

```sh
python scripts/convert_shapefile.py
```

Konverter tidak memakai dependency Python tambahan. Koordinat sumber
`DGN95 / Indonesia TM-3 zone 50.1` otomatis direproyeksi ke WGS84.
