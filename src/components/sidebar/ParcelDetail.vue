<script setup lang="ts">
import { formatArea, parcelLabel } from '../../lib/parcel'
import type { ParcelFeature } from '../../types/parcel'

defineProps<{ parcel: ParcelFeature }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <section class="parcel-detail">
    <div class="section-heading">
      <h2>Detail bidang</h2>
      <button type="button" @click="emit('close')">Tutup</button>
    </div>
    <strong class="parcel-title">{{ parcelLabel(parcel.properties) }}</strong>
    <dl>
      <div><dt>ID bidang</dt><dd>{{ parcel.properties.OBJECTID }}</dd></div>
      <div><dt>NIB</dt><dd>{{ parcel.properties.NIB ?? '—' }}</dd></div>
      <div><dt>NIB NIBEL</dt><dd>{{ parcel.properties.NIBNIBEL ?? '—' }}</dd></div>
      <div><dt>Nama</dt><dd>{{ parcel.properties.NAMA ?? '—' }}</dd></div>
      <div><dt>Tipe hak</dt><dd>{{ parcel.properties.TIPEHAK ?? '—' }}</dd></div>
      <div><dt>Asal hak</dt><dd>{{ parcel.properties.ASALHAK ?? '—' }}</dd></div>
      <div><dt>Kecamatan</dt><dd>{{ parcel.properties.KECAMATAN ?? '—' }}</dd></div>
      <div><dt>Kelurahan</dt><dd>{{ parcel.properties.KELURAHAN ?? '—' }}</dd></div>
      <div><dt>Tahap</dt><dd>{{ parcel.properties.Tahap ?? '—' }}</dd></div>
      <div><dt>Tipe</dt><dd>{{ parcel.properties.TIPE ?? '—' }}</dd></div>
      <div><dt>Nomor</dt><dd>{{ parcel.properties.NOMOR ?? '—' }}</dd></div>
      <div><dt>Luas peta</dt><dd>{{ formatArea(parcel.properties.LUASPETA) }}</dd></div>
      <div><dt>Luas tertulis</dt><dd>{{ formatArea(parcel.properties.LUASTERTUL) }}</dd></div>
      <div><dt>Daftar</dt><dd>{{ parcel.properties.DAFTAR ?? '—' }}</dd></div>
      <div><dt>Berakhir</dt><dd>{{ parcel.properties.BERAKHIR ?? '—' }}</dd></div>
    </dl>
  </section>
</template>

<style scoped>
.parcel-detail { max-height: 320px; padding: 18px 20px; overflow-y: auto; overscroll-behavior: contain; color: var(--text-soft); background: var(--surface-raised); border-bottom: 1px solid var(--border); scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); scrollbar-width: thin; }
.parcel-detail::-webkit-scrollbar { width: 8px; }
.parcel-detail::-webkit-scrollbar-track { background: var(--scrollbar-track); }
.parcel-detail::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border: 2px solid var(--scrollbar-track); border-radius: 4px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
h2 { margin: 0; color: var(--muted-strong); font-size: 11px; font-weight: 700; }
button { padding: 0; color: var(--accent); background: none; border: 0; cursor: pointer; font-size: 10px; }
.parcel-title { display: block; margin-bottom: 12px; color: var(--accent-strong); font-size: 14px; }
dl, dl div { margin: 0; }
dl div { display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px; padding: 7px 0; border-top: 1px solid var(--border-subtle); font-size: 10px; }
dt { color: var(--muted); }
dd { color: var(--text-soft); overflow-wrap: anywhere; text-align: right; }
</style>
