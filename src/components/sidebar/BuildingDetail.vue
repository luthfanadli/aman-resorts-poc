<script setup lang="ts">
import type { BuildingFeature } from '../../types/parcel'

const props = defineProps<{ building: BuildingFeature }>()
const emit = defineEmits<{ close: [] }>()

function numberValue(key: string, digits = 1) {
  const value = Number(props.building.properties[key])
  return Number.isFinite(value)
    ? new Intl.NumberFormat('id-ID', { maximumFractionDigits: digits }).format(value)
    : '—'
}

function coordinateValue(key: 'latitude' | 'longitude') {
  const value = Number(props.building.properties[key])
  return Number.isFinite(value) ? value.toFixed(6) : '—'
}

function confidenceValue() {
  const value = Number(props.building.properties.confidence)
  return Number.isFinite(value) ? `${Math.round(value * 100)}%` : '—'
}

const locationCode = typeof props.building.properties.full_plus === 'string'
  ? props.building.properties.full_plus
  : '—'
</script>

<template>
  <section class="building-detail">
    <div class="section-heading">
      <h2>Detail bangunan</h2>
      <button type="button" @click="emit('close')">Tutup</button>
    </div>
    <strong class="building-title">{{ locationCode === '—' ? 'Bangunan' : `Bangunan ${locationCode}` }}</strong>
    <dl>
      <div><dt>Luas terdeteksi</dt><dd>{{ numberValue('area_in_me') }} m²</dd></div>
      <div><dt>Confidence</dt><dd>{{ confidenceValue() }}</dd></div>
      <div><dt>Kode lokasi</dt><dd>{{ locationCode }}</dd></div>
      <div><dt>Latitude</dt><dd>{{ coordinateValue('latitude') }}</dd></div>
      <div><dt>Longitude</dt><dd>{{ coordinateValue('longitude') }}</dd></div>
      <div><dt>Layer sumber</dt><dd>{{ building.properties.layer ?? '—' }}</dd></div>
    </dl>
  </section>
</template>

<style scoped>
.building-detail { max-height: 320px; padding: 18px 20px; overflow-y: auto; overscroll-behavior: contain; color: var(--text-soft); background: var(--surface-raised); border-bottom: 1px solid var(--border); scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); scrollbar-width: thin; }
.building-detail::-webkit-scrollbar { width: 8px; }
.building-detail::-webkit-scrollbar-track { background: var(--scrollbar-track); }
.building-detail::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border: 2px solid var(--scrollbar-track); border-radius: 4px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
h2 { margin: 0; color: var(--muted-strong); font-size: 11px; font-weight: 700; }
button { padding: 0; color: var(--accent); background: none; border: 0; cursor: pointer; font-size: 10px; }
.building-title { display: block; margin-bottom: 12px; color: var(--building-accent); font-size: 13px; overflow-wrap: anywhere; }
dl, dl div { margin: 0; }
dl div { display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px; padding: 7px 0; border-top: 1px solid var(--border-subtle); font-size: 10px; }
dt { color: var(--muted); }
dd { color: var(--text-soft); overflow-wrap: anywhere; text-align: right; }
</style>
