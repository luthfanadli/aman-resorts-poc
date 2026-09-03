<script setup lang="ts">
import { computed } from 'vue'
import RoomListView from './RoomListView.vue'
import type { BuildingFeature } from '../../types/parcel'

const props = defineProps<{
  building: BuildingFeature
  buildingId: string
}>()
const emit = defineEmits<{ close: [] }>()

// Derive a human-readable building label
const buildingLabel = computed<string>(() => {
  const p = props.building.properties
  if (typeof p.full_plus === 'string' && p.full_plus) return `Bangunan ${p.full_plus}`
  if (typeof p.name === 'string' && p.name) return p.name
  if (typeof p.id === 'string' && p.id) return `Bangunan ${p.id}`
  return `Bangunan #${Number(props.buildingId) + 1}`
})

const buildingArea = computed<string>(() => {
  const v = Number(props.building.properties.area_in_me)
  return Number.isFinite(v) ? `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 }).format(v)} m²` : ''
})
</script>

<template>
  <div class="bmodal-overlay" @mousedown.self="emit('close')">
    <div class="bmodal" role="dialog" aria-modal="true" :aria-label="buildingLabel">
      <!-- Modal header -->
      <header class="bmodal-header">
        <div class="header-info">
          <div class="building-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
          </div>
          <div>
            <p class="header-eyebrow">Detail Bangunan</p>
            <h2 class="header-title">{{ buildingLabel }}</h2>
            <p v-if="buildingArea" class="header-sub">{{ buildingArea }} &bull; Bangunan #{{ Number(buildingId) + 1 }}</p>
          </div>
        </div>
        <button type="button" class="close-btn" aria-label="Tutup" @click="emit('close')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </header>

      <!-- Modal body — Room List -->
      <div class="bmodal-body">
        <RoomListView :building-id="buildingId" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bmodal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--backdrop);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: stretch;
  justify-content: flex-end;
  animation: overlayIn 180ms ease;
}
@keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

.bmodal {
  width: min(820px, 100vw);
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-left: 1px solid var(--border-strong);
  box-shadow: -24px 0 64px var(--shadow-strong);
  animation: slideIn 250ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
@keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: none; opacity: 1; } }

.bmodal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
  background: var(--surface-raised);
}
.header-info { display: flex; align-items: center; gap: 14px; }
.building-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  background: var(--surface-elevated);
  border: 1px solid var(--border-strong);
  border-radius: 10px;
  flex-shrink: 0;
}
.building-icon svg {
  width: 22px;
  fill: none;
  stroke: var(--accent);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}
.header-eyebrow { margin: 0; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
.header-title { margin: 4px 0 0; font-size: 17px; font-weight: 700; color: var(--text); }
.header-sub { margin: 4px 0 0; font-size: 10px; color: var(--muted-faint); }

.close-btn {
  display: grid; width: 34px; height: 34px; place-items: center;
  background: transparent; border: 1px solid var(--border-strong); border-radius: 7px;
  cursor: pointer; color: var(--muted); transition: all 150ms; flex-shrink: 0;
}
.close-btn:hover { background: var(--surface-hover); color: var(--text); border-color: var(--border-strong); }
.close-btn svg { width: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.8; }

.bmodal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
