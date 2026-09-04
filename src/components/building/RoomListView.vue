<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoomStore } from '../../composables/useRoomStore'
import { useAssetStore } from '../../composables/useAssetStore'
import RoomFormModal from './RoomFormModal.vue'
import RoomDetailModal from './RoomDetailModal.vue'
import RoomPhotoGalleryModal from './RoomPhotoGalleryModal.vue'
import AssetListView from './AssetListView.vue'
import type { Room, RoomDraft } from '../../types/room'

const props = defineProps<{ buildingId: string }>()

const { getRoomsForBuilding, addRoom, updateRoom, deleteRoom } = useRoomStore()
const { getAssetsForBuilding } = useAssetStore()

const rooms = getRoomsForBuilding(props.buildingId)
const allBuildingAssets = getAssetsForBuilding(props.buildingId)

const showForm = ref(false)
const editingRoom = ref<Room | null>(null)
const confirmDeleteId = ref<string | null>(null)
const activeRoomForAssets = ref<Room | null>(null)
const detailRoom = ref<Room | null>(null)
const galleryRoom = ref<Room | null>(null)
const galleryIndex = ref(0)
const searchQuery = ref('')

const filteredRooms = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return rooms.value
  return rooms.value.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.responsibleUnit.toLowerCase().includes(q),
  )
})

function openAdd() {
  editingRoom.value = null
  showForm.value = true
}
function openEdit(r: Room) {
  editingRoom.value = r
  showForm.value = true
}
function closeForm() {
  showForm.value = false
  editingRoom.value = null
}
function handleSave(draft: RoomDraft) {
  if (editingRoom.value) {
    updateRoom(editingRoom.value.id, draft)
  } else {
    addRoom(draft)
  }
  closeForm()
}
function openAssets(r: Room) { activeRoomForAssets.value = r }
function backFromAssets() { activeRoomForAssets.value = null }
function openDetail(room: Room) { detailRoom.value = room }
function openGallery(room: Room, index = 0) {
  galleryRoom.value = room
  galleryIndex.value = index
}

function confirmDelete(id: string) { confirmDeleteId.value = id }
function cancelDelete() { confirmDeleteId.value = null }
function executeDelete() {
  if (confirmDeleteId.value) deleteRoom(confirmDeleteId.value)
  confirmDeleteId.value = null
}

function assetCountForRoom(roomId: string) {
  return allBuildingAssets.value.filter((a) => a.roomId === roomId).length
}

const statusColor: Record<string, string> = {
  Active: 'var(--status-good)',
  Inactive: 'var(--muted-faint)',
  Renovation: 'var(--accent)',
}

function statusBackground(status: string) {
  return `color-mix(in srgb, ${statusColor[status]} 14%, transparent)`
}
</script>

<template>
  <!-- Asset detail view (when a room is selected) -->
  <AssetListView
    v-if="activeRoomForAssets"
    :room="activeRoomForAssets"
    :building-id="buildingId"
    @back="backFromAssets"
  />

  <!-- Room list view -->
  <div v-else class="room-list">
    <div class="list-header">
      <div class="header-left">
        <h3>Rooms</h3>
        <span class="count-badge">{{ rooms.length }}</span>
      </div>
      <button type="button" class="btn-add" @click="openAdd">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        Tambah Room
      </button>
    </div>

    <!-- Search -->
    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Cari room, kode, tipe..."
        class="search-input"
      />
    </div>

    <!-- Summary -->
    <div class="summary-bar">
      <div v-for="status in ['Active', 'Inactive', 'Renovation']" :key="status" class="summary-chip">
        <span class="chip-value" :style="{ color: statusColor[status] }">
          {{ rooms.filter((r) => r.status === status).length }}
        </span>
        <span class="chip-label">{{ status }}</span>
      </div>
      <div class="summary-chip">
        <span class="chip-value asset-total">{{ allBuildingAssets.length }}</span>
        <span class="chip-label">Total Assets</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="filteredRooms.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <p v-if="searchQuery">Tidak ada room yang cocok dengan "{{ searchQuery }}"</p>
      <p v-else>Belum ada room di bangunan ini</p>
      <button v-if="!searchQuery" type="button" class="btn-add-inline" @click="openAdd">
        Tambah Room Pertama
      </button>
    </div>

    <!-- Room cards grid -->
    <div v-else class="room-grid">
      <div v-for="room in filteredRooms" :key="room.id" class="room-card">
        <!-- Status indicator -->
        <div class="card-status-bar" :style="{ background: statusColor[room.status] }" />

        <div class="card-body">
          <div class="card-top">
            <div class="card-title-group">
              <span class="room-code">{{ room.code }}</span>
              <h4 class="room-name">{{ room.name }}</h4>
            </div>
            <span class="status-badge" :style="{ color: statusColor[room.status], background: statusBackground(room.status) }">
              {{ room.status }}
            </span>
          </div>

          <div v-if="room.photos.length" class="card-photos" :class="`count-${Math.min(room.photos.length, 3)}`">
            <button
              v-for="(photo, index) in room.photos.slice(0, 3)"
              :key="`${photo.slice(-24)}-${index}`"
              type="button"
              class="card-photo"
              :aria-label="index === 2 ? 'Lihat semua foto' : `Lihat foto ${index + 1}`"
              @click="openGallery(room, index)"
            >
              <img :src="photo" :alt="`${room.name}, foto ${index + 1}`" />
              <span v-if="index === 2" class="card-photo-overlay">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
                Lihat semua
                <small>+{{ room.photos.length - 2 }}</small>
              </span>
            </button>
          </div>

          <div class="card-meta">
            <span class="meta-item">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
              {{ room.type }}
            </span>
            <span class="meta-item">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
              Lantai {{ room.floor }}
            </span>
            <span v-if="room.area" class="meta-item">
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h18M3 15h18" /></svg>
              {{ room.area }} m²
            </span>
            <span v-if="room.capacity" class="meta-item">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              {{ room.capacity }} orang
            </span>
          </div>

          <div v-if="room.responsibleUnit" class="card-unit">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            {{ room.responsibleUnit }}
          </div>
        </div>

        <div class="card-footer">
          <button type="button" class="asset-btn" @click="openAssets(room)">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            Assets
            <span class="asset-count">{{ assetCountForRoom(room.id) }}</span>
          </button>
          <div class="card-actions">
            <button type="button" class="icon-btn detail" title="Lihat detail room" aria-label="Lihat detail room" @click="openDetail(room)">
              <svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>
            </button>
            <button type="button" class="icon-btn edit" title="Edit room" @click="openEdit(room)">
              <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
            </button>
            <button type="button" class="icon-btn delete" title="Hapus room" @click="confirmDelete(room.id)">
              <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirm -->
    <div v-if="confirmDeleteId" class="confirm-overlay" @mousedown.self="cancelDelete">
      <div class="confirm-box">
        <h4>Hapus Room?</h4>
        <p>Semua asset dalam room ini tidak akan terhapus, namun room tidak bisa dikembalikan.</p>
        <div class="confirm-actions">
          <button type="button" class="btn-secondary" @click="cancelDelete">Batal</button>
          <button type="button" class="btn-danger" @click="executeDelete">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Room Form -->
    <RoomFormModal
      v-if="showForm"
      :building-id="buildingId"
      :room="editingRoom"
      @save="handleSave"
      @cancel="closeForm"
    />

    <RoomDetailModal
      v-if="detailRoom"
      :room="detailRoom"
      :asset-count="assetCountForRoom(detailRoom.id)"
      @close="detailRoom = null"
    />

    <RoomPhotoGalleryModal
      v-if="galleryRoom"
      :photos="galleryRoom.photos"
      :room-name="galleryRoom.name"
      :initial-index="galleryIndex"
      @close="galleryRoom = null"
    />
  </div>
</template>

<style scoped>
.room-list { display: flex; flex-direction: column; min-height: 0; height: 100%; }

.list-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-left h3 { margin: 0; font-size: 13px; font-weight: 700; color: var(--text); }
.count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  background: var(--surface-hover); border: 1px solid var(--border-strong); border-radius: 10px;
  font-size: 10px; font-weight: 700; color: var(--muted);
}

.btn-add {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: var(--accent); color: var(--accent-text);
  border: 0; border-radius: 7px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 150ms;
}
.btn-add:hover { background: var(--accent-light); }
.btn-add svg { width: 14px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2.2; }

.search-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-bottom: 1px solid var(--border-subtle); flex-shrink: 0;
}
.search-icon { width: 14px; flex-shrink: 0; fill: none; stroke: var(--muted-faint); stroke-linecap: round; stroke-width: 1.8; }
.search-input {
  flex: 1; background: transparent; border: 0; outline: none;
  color: var(--text); font-size: 12px;
}
.search-input::placeholder { color: var(--muted-faint); }

.summary-bar {
  display: flex; gap: 1px; background: var(--border-subtle);
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.summary-chip {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 8px; background: var(--surface-raised);
}
.chip-value { font-size: 18px; font-weight: 700; color: var(--text); line-height: 1; }
.asset-total { color: var(--building-accent); }
.chip-label { font-size: 8px; color: var(--muted-faint); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }

.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 48px; color: var(--muted-faint);
}
.empty-state svg { width: 40px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.2; opacity: 0.5; }
.empty-state p { margin: 0; font-size: 13px; }
.btn-add-inline {
  padding: 8px 18px; background: transparent; color: var(--accent);
  border: 1px solid var(--accent); border-radius: 7px; font-size: 11px;
  font-weight: 600; cursor: pointer; transition: all 150ms; margin-top: 4px;
}
.btn-add-inline:hover { background: var(--accent-surface); }

.room-grid {
  flex: 1; overflow-y: auto; padding: 16px; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px; align-content: start;
  scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) transparent;
}

.room-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 150ms, transform 150ms;
}
.room-card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.card-status-bar { height: 3px; flex-shrink: 0; }
.card-body { padding: 14px 14px 10px; flex: 1; }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.card-title-group { flex: 1; min-width: 0; }
.room-code { font-size: 9px; font-weight: 700; color: var(--muted-faint); letter-spacing: 0.06em; text-transform: uppercase; }
.room-name { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status-badge { flex-shrink: 0; padding: 2px 7px; border-radius: 10px; font-size: 8px; font-weight: 700; white-space: nowrap; }

.card-photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; height: 82px; margin-bottom: 10px; }
.card-photos.count-1 { grid-template-columns: 1fr; }
.card-photos.count-2 { grid-template-columns: repeat(2, 1fr); }
.card-photo { position: relative; min-width: 0; padding: 0; overflow: hidden; background: var(--surface-subtle); border: 0; border-radius: 4px; cursor: pointer; }
.card-photo img { width: 100%; height: 100%; display: block; object-fit: cover; transition: opacity 150ms; }
.card-photo:hover img { opacity: 0.86; }
.card-photo-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; padding: 5px; color: #fff; background: rgba(5, 7, 4, 0.58); font-size: 8px; font-weight: 700; white-space: nowrap; }
.card-photo-overlay svg { width: 14px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.card-photo-overlay small { font-size: 8px; font-weight: 500; opacity: 0.82; }

.card-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.meta-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; color: var(--muted); background: var(--surface-hover);
  border: 1px solid var(--border); border-radius: 4px; padding: 3px 6px;
}
.meta-item svg { width: 11px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }

.card-unit {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; color: var(--muted-faint); margin-top: 4px;
}
.card-unit svg { width: 11px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }

.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-top: 1px solid var(--border-subtle); background: var(--surface-raised);
}
.asset-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; background: transparent;
  border: 1px solid var(--border-strong); border-radius: 6px; color: var(--muted);
  font-size: 10px; font-weight: 600; cursor: pointer; transition: all 150ms;
}
.asset-btn:hover { background: var(--surface-hover); color: var(--accent); border-color: var(--accent); }
.asset-btn svg { width: 12px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.asset-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: var(--border-strong); border-radius: 8px; font-size: 9px; font-weight: 700;
}
.card-actions { display: flex; gap: 4px; }
.icon-btn {
  display: inline-grid; width: 26px; height: 26px; place-items: center;
  background: transparent; border: 1px solid transparent; border-radius: 5px;
  cursor: pointer; transition: all 120ms;
}
.icon-btn svg { width: 13px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.icon-btn.edit { color: var(--muted-faint); }
.icon-btn.edit:hover { background: var(--surface-hover); color: var(--accent); border-color: var(--border-strong); }
.icon-btn.detail { color: var(--muted-faint); }
.icon-btn.detail:hover { background: var(--surface-hover); color: var(--text); border-color: var(--border-strong); }
.icon-btn.delete { color: var(--muted-faint); }
.icon-btn.delete:hover { background: var(--error-surface); color: var(--error); border-color: var(--error-border); }

/* Confirm dialog */
.confirm-overlay {
  position: fixed; inset: 0; background: var(--backdrop);
  backdrop-filter: blur(2px); display: flex; align-items: center;
  justify-content: center; z-index: 300;
}
.confirm-box {
  background: var(--surface-raised); border: 1px solid var(--border-strong); border-radius: 10px;
  padding: 24px; max-width: 320px; text-align: center;
  box-shadow: 0 16px 48px var(--shadow-strong);
}
.confirm-box h4 { margin: 0 0 8px; color: var(--text); font-size: 14px; }
.confirm-box p { margin: 0 0 18px; color: var(--muted); font-size: 11px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-danger {
  padding: 8px 16px; background: var(--error); color: var(--error-contrast);
  border: 0; border-radius: 7px; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 150ms;
}
.btn-danger:hover { background: var(--error-hover); }
.btn-secondary {
  padding: 8px 14px; background: transparent; color: var(--muted);
  border: 1px solid var(--border-strong); border-radius: 7px; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: all 150ms;
}
.btn-secondary:hover { background: var(--surface-hover); color: var(--text); }
</style>
