<script setup lang="ts">
import { computed } from 'vue'
import type { BuildingFeature } from '../../types/parcel'

const props = defineProps<{
  building: BuildingFeature
  buildingId: number | null
}>()
const emit = defineEmits<{ close: []; 'manage-rooms': [] }>()

const buildingNumber = computed(() =>
  props.buildingId === null ? '—' : props.buildingId + 1,
)

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
    <strong class="building-title">Bangunan #{{ buildingNumber }}</strong>
    <dl>
      <div><dt>Luas terdeteksi</dt><dd>{{ numberValue('area_in_me') }} m²</dd></div>
      <div><dt>Confidence</dt><dd>{{ confidenceValue() }}</dd></div>
      <div><dt>Kode lokasi</dt><dd>{{ locationCode }}</dd></div>
      <div><dt>Latitude</dt><dd>{{ coordinateValue('latitude') }}</dd></div>
      <div><dt>Longitude</dt><dd>{{ coordinateValue('longitude') }}</dd></div>
      <div><dt>Layer sumber</dt><dd>{{ building.properties.layer ?? '—' }}</dd></div>
    </dl>
    <button type="button" class="manage-btn" @click="emit('manage-rooms')">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
      Kelola Rooms &amp; Assets
      <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
    </button>
  </section>
</template>

<style scoped>
.building-detail { max-height: 380px; padding: 18px 20px; overflow-y: auto; overscroll-behavior: contain; color: var(--text-soft); background: var(--surface-raised); border-bottom: 1px solid var(--border); scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); scrollbar-width: thin; }
.building-detail::-webkit-scrollbar { width: 8px; }
.building-detail::-webkit-scrollbar-track { background: var(--scrollbar-track); }
.building-detail::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border: 2px solid var(--scrollbar-track); border-radius: 4px; }
.section-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
h2 { margin: 0; color: var(--muted-strong); font-size: 11px; font-weight: 700; }
.section-heading button { padding: 0; color: var(--accent); background: none; border: 0; cursor: pointer; font-size: 10px; }
.building-title { display: block; margin-bottom: 12px; color: var(--building-accent); font-size: 13px; overflow-wrap: anywhere; }
dl, dl div { margin: 0; }
dl div { display: grid; grid-template-columns: 1fr 1.2fr; gap: 10px; padding: 7px 0; border-top: 1px solid var(--border-subtle); font-size: 10px; }
dt { color: var(--muted); }
dd { color: var(--text-soft); overflow-wrap: anywhere; text-align: right; }
.manage-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 14px;
  padding: 10px 14px;
  background: var(--surface-elevated);
  border: 1px solid var(--accent);
  border-radius: 8px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms;
}
.manage-btn:hover { background: var(--accent-surface); box-shadow: 0 0 0 1px var(--accent); }
.manage-btn svg { width: 14px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.manage-btn .arrow { margin-left: auto; opacity: 0.6; }
</style>
