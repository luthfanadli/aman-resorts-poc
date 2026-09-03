# Amandari Land Map

Web map Vue 3 + MapLibre untuk menampilkan bidang tanah Amandari di atas satellite imagery. 
Atribut bidang dapat dicari dan dibuka melalui popup.

## Struktur frontend

- `App.vue` hanya mengatur state dan komunikasi antar-komponen.
- `components/map/ParcelMap.vue` memiliki seluruh lifecycle MapLibre.
- `components/sidebar/` berisi pencarian, kontrol layer, ringkasan, dan detail.
- `composables/useParcelData.ts` memuat dan memvalidasi GeoJSON satu kali.
- `lib/map/` berisi konstanta layer dan helper geometri.


## Development

```sh
pnpm dev
```