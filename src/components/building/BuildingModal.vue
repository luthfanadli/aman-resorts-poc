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
  background: rgba(0, 0, 0, 0.65);
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
  background: #171a14;
  border-left: 1px solid #3a4033;
  box-shadow: -24px 0 64px rgba(0, 0, 0, 0.5);
  animation: slideIn 250ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}
@keyframes slideIn { from { transform: translateX(60px); opacity: 0; } to { transform: none; opacity: 1; } }

.bmodal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #2e3329;
  flex-shrink: 0;
  background: linear-gradient(135deg, #1e2219 0%, #171a14 100%);
}
.header-info { display: flex; align-items: center; gap: 14px; }
.building-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  background: linear-gradient(135deg, #2a3024 0%, #1e2219 100%);
  border: 1px solid #3a4033;
  border-radius: 10px;
  flex-shrink: 0;
}
.building-icon svg {
  width: 22px;
  fill: none;
  stroke: #d8be76;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}
.header-eyebrow { margin: 0; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #d8be76; }
.header-title { margin: 4px 0 0; font-size: 17px; font-weight: 700; color: #ecebdc; }
.header-sub { margin: 4px 0 0; font-size: 10px; color: #777d6e; }

.close-btn {
  display: grid; width: 34px; height: 34px; place-items: center;
  background: transparent; border: 1px solid #3a4033; border-radius: 7px;
  cursor: pointer; color: #9fa492; transition: all 150ms; flex-shrink: 0;
}
.close-btn:hover { background: #252a20; color: #ecebdc; border-color: #4a5041; }
.close-btn svg { width: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.8; }

.bmodal-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
