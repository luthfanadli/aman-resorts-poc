<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Room } from '../../types/room'
import RoomPhotoGalleryModal from './RoomPhotoGalleryModal.vue'

const props = defineProps<{
  room: Room
  assetCount: number
}>()

const emit = defineEmits<{ close: [] }>()
const showGallery = ref(false)
const galleryIndex = ref(0)

function openGallery(index = 0) {
  galleryIndex.value = index
  showGallery.value = true
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !showGallery.value) emit('close')
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="detail-backdrop" @mousedown.self="emit('close')">
      <section class="detail-modal" role="dialog" aria-modal="true" :aria-labelledby="`room-detail-${room.id}`">
        <header class="detail-header">
          <div>
            <span>{{ room.code }}</span>
            <h2 :id="`room-detail-${room.id}`">{{ room.name }}</h2>
          </div>
          <button type="button" class="close-btn" aria-label="Tutup detail room" @click="emit('close')">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div class="detail-content">
          <div v-if="room.photos.length" class="detail-photos" :class="`count-${Math.min(room.photos.length, 3)}`">
            <button
              v-for="(photo, index) in room.photos.slice(0, 3)"
              :key="`${photo.slice(-24)}-${index}`"
              type="button"
              class="detail-photo"
              :aria-label="index === 2 ? 'Lihat semua foto' : `Lihat foto ${index + 1}`"
              @click="openGallery(index)"
            >
              <img :src="photo" :alt="`${room.name}, foto ${index + 1}`" />
              <span v-if="index === 2" class="all-photos">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                Lihat semua foto
                <small>{{ room.photos.length }} foto</small>
              </span>
            </button>
          </div>
          <div v-else class="no-photo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
            Belum ada foto ruangan
          </div>

          <dl class="detail-grid">
            <div><dt>Status</dt><dd><span class="status-dot" :class="room.status.toLowerCase()" />{{ room.status }}</dd></div>
            <div><dt>Tipe room</dt><dd>{{ room.type }}</dd></div>
            <div><dt>Lantai</dt><dd>{{ room.floor }}</dd></div>
            <div><dt>Luas</dt><dd>{{ room.area !== null ? `${room.area} m²` : '—' }}</dd></div>
            <div><dt>Kapasitas</dt><dd>{{ room.capacity !== null ? `${room.capacity} orang` : '—' }}</dd></div>
            <div><dt>Total asset</dt><dd>{{ assetCount }}</dd></div>
            <div><dt>Unit penanggung jawab</dt><dd>{{ room.responsibleUnit || '—' }}</dd></div>
            <div><dt>Terakhir diperbarui</dt><dd>{{ formatDate(room.updatedAt) }}</dd></div>
          </dl>

          <section v-if="room.description" class="text-section">
            <h3>Deskripsi</h3>
            <p>{{ room.description }}</p>
          </section>
          <section v-if="room.floorPlan" class="text-section">
            <h3>Floor Plan / Spatial Data</h3>
            <p>{{ room.floorPlan }}</p>
          </section>
          <section v-if="room.notes" class="text-section">
            <h3>Catatan</h3>
            <p>{{ room.notes }}</p>
          </section>
        </div>

        <footer class="detail-footer">
          <button type="button" @click="emit('close')">Tutup</button>
        </footer>
      </section>
    </div>

    <RoomPhotoGalleryModal
      v-if="showGallery"
      :photos="room.photos"
      :room-name="room.name"
      :initial-index="galleryIndex"
      @close="showGallery = false"
    />
  </Teleport>
</template>

<style scoped>
.detail-backdrop { position: fixed; inset: 0; z-index: 400; display: grid; place-items: center; padding: 16px; background: var(--backdrop-strong); }
.detail-modal { width: min(700px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); display: flex; flex-direction: column; overflow: hidden; background: var(--surface-raised); border: 1px solid var(--border-strong); border-radius: 10px; box-shadow: 0 8px 24px var(--shadow-strong); }
.detail-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
.detail-header span { color: var(--accent); font-size: 9px; font-weight: 700; letter-spacing: 0.06em; }
.detail-header h2 { margin: 3px 0 0; color: var(--text); font-size: 17px; }
.close-btn { display: grid; width: 32px; height: 32px; place-items: center; color: var(--muted); background: transparent; border: 1px solid var(--border-strong); border-radius: 6px; cursor: pointer; }
.close-btn:hover { color: var(--text); background: var(--surface-hover); }
.close-btn svg { width: 15px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 1.8; }
.detail-content { overflow-y: auto; padding: 20px; scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) transparent; }
.detail-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; height: 190px; margin-bottom: 20px; }
.detail-photos.count-1 { grid-template-columns: 1fr; }
.detail-photos.count-2 { grid-template-columns: repeat(2, 1fr); }
.detail-photo { position: relative; min-width: 0; padding: 0; overflow: hidden; background: var(--surface-subtle); border: 1px solid var(--border-strong); border-radius: 7px; cursor: pointer; }
.detail-photo img { width: 100%; height: 100%; display: block; object-fit: cover; transition: opacity 150ms; }
.detail-photo:hover img { opacity: 0.88; }
.all-photos { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; padding: 12px; color: #fff; background: rgba(5, 7, 4, 0.56); font-size: 11px; font-weight: 700; }
.all-photos svg { width: 20px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.all-photos small { font-size: 9px; font-weight: 500; opacity: 0.8; }
.no-photo { height: 118px; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 20px; color: var(--muted-faint); background: var(--surface-subtle); border: 1px dashed var(--border-strong); border-radius: 7px; font-size: 11px; }
.no-photo svg { width: 18px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.5; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin: 0; overflow: hidden; background: var(--border); border: 1px solid var(--border); border-radius: 7px; }
.detail-grid > div { min-width: 0; padding: 11px 12px; background: var(--surface-subtle); }
.detail-grid dt { margin-bottom: 4px; color: var(--muted-faint); font-size: 9px; }
.detail-grid dd { display: flex; align-items: center; gap: 6px; margin: 0; overflow-wrap: anywhere; color: var(--text-soft); font-size: 11px; font-weight: 600; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--muted-faint); }
.status-dot.active { background: var(--status-good); }
.status-dot.renovation { background: var(--accent); }
.text-section { margin-top: 18px; }
.text-section h3 { margin: 0 0 6px; color: var(--muted); font-size: 10px; font-weight: 650; }
.text-section p { margin: 0; color: var(--text-soft); font-size: 11px; line-height: 1.6; white-space: pre-wrap; overflow-wrap: anywhere; }
.detail-footer { display: flex; justify-content: flex-end; padding: 12px 20px; background: var(--surface-raised); border-top: 1px solid var(--border); }
.detail-footer button { padding: 8px 16px; color: var(--muted); background: transparent; border: 1px solid var(--border-strong); border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
.detail-footer button:hover { color: var(--text); background: var(--surface-hover); }

@media (max-width: 560px) {
  .detail-content { padding: 14px; }
  .detail-photos { height: 150px; gap: 5px; }
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
