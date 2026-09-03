<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { BASEMAP_OPTIONS } from '../../lib/map/constants'
import type { BasemapId } from '../../lib/map/constants'

defineProps<{ activeBasemap: BasemapId }>()

const emit = defineEmits<{
  select: [basemap: BasemapId]
}>()

const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

function selectBasemap(basemap: BasemapId) {
  emit('select', basemap)
  isOpen.value = false
}

function handlePointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) isOpen.value = false
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') isOpen.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', handlePointerDown)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handlePointerDown)
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div ref="root" class="basemap-control">
    <div v-if="isOpen" class="basemap-menu" role="radiogroup" aria-label="Pilihan basemap">
      <div class="basemap-heading">
        <strong>Basemap</strong>
        <button type="button" aria-label="Tutup pilihan basemap" @click="isOpen = false">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m7 7 10 10M17 7 7 17" />
          </svg>
        </button>
      </div>
      <div class="basemap-grid">
        <button v-for="basemap in BASEMAP_OPTIONS" :key="basemap.id" class="basemap-option" type="button" role="radio"
          :aria-checked="activeBasemap === basemap.id" :class="{ active: activeBasemap === basemap.id }"
          @click="selectBasemap(basemap.id)">
          <span class="basemap-preview" :style="{ backgroundImage: `url(${basemap.previewUrl})` }"
            aria-hidden="true"></span>
          <span>{{ basemap.label }}</span>
        </button>
      </div>
    </div>

    <button class="basemap-trigger" type="button" aria-label="Pilih basemap" aria-haspopup="true"
      :aria-expanded="isOpen" @click="isOpen = !isOpen">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m3 7 9-4 9 4-9 4-9-4Zm0 5 9 4 9-4M3 17l9 4 9-4" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.basemap-control {
  position: absolute;
  z-index: 6;
  right: 12px;
  bottom: 58px;
}

.basemap-trigger {
  display: grid;
  width: 36px;
  height: 36px;
  padding: 0;
  place-items: center;
  color: #e8e7db;
  background: #171a14;
  border: 1px solid #3e4435;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.24);
  cursor: pointer;
}

.basemap-trigger:hover {
  background: #20241c;
}

.basemap-trigger svg {
  width: 19px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.basemap-menu {
  position: absolute;
  right: 0;
  bottom: 44px;
  width: 222px;
  padding: 11px;
  color: #e7e6da;
  background: #171a14;
  border: 1px solid #454b3b;
  border-radius: 8px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
}

.basemap-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 9px;
}

.basemap-heading strong {
  font-size: 11px;
  font-weight: 700;
}

.basemap-heading button {
  display: grid;
  width: 23px;
  height: 23px;
  padding: 0;
  place-items: center;
  color: #929787;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.basemap-heading svg {
  width: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.7;
}

.basemap-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.basemap-option {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 5px;
  padding: 4px;
  color: #a8ad9d;
  background: transparent;
  border: 1px solid #353a2f;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
}

.basemap-option:hover {
  border-color: #626753;
}

.basemap-option.active {
  color: #f0dfac;
  border-color: #c6a953;
  box-shadow: inset 0 0 0 1px #c6a953;
}

.basemap-preview {
  width: 100%;
  height: 58px;
  background-color: #2b3027;
  background-position: center;
  background-size: cover;
  border-radius: 3px;
}

.basemap-option>span:last-child {
  overflow: hidden;
  padding: 0 2px 1px;
  font-size: 9px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 760px) {
  .basemap-control {
    right: 10px;
    bottom: 56px;
  }

  .basemap-menu {
    width: min(222px, calc(100vw - 28px));
  }
}
</style>
