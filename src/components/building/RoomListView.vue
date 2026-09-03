<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoomStore } from '../../composables/useRoomStore'
import { useAssetStore } from '../../composables/useAssetStore'
import RoomFormModal from './RoomFormModal.vue'
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
  Active: '#6baa6e',
  Inactive: '#777d6e',
  Renovation: '#d8be76',
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
        <span class="chip-value" style="color: #e5baa4">{{ allBuildingAssets.length }}</span>
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
            <span class="status-badge" :style="{ color: statusColor[room.status], background: statusColor[room.status] + '22' }">
              {{ room.status }}
            </span>
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
  </div>
</template>

<style scoped>
.room-list { display: flex; flex-direction: column; min-height: 0; height: 100%; }

.list-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; border-bottom: 1px solid #2e3329; flex-shrink: 0;
}
.header-left { display: flex; align-items: center; gap: 8px; }
.header-left h3 { margin: 0; font-size: 13px; font-weight: 700; color: #ecebdc; }
.count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 20px; height: 20px; padding: 0 6px;
  background: #252a20; border: 1px solid #3a4033; border-radius: 10px;
  font-size: 10px; font-weight: 700; color: #9fa492;
}

.btn-add {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: #d8be76; color: #10120e;
  border: 0; border-radius: 7px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 150ms;
}
.btn-add:hover { background: #e0cc8e; }
.btn-add svg { width: 14px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2.2; }

.search-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px; border-bottom: 1px solid #252a20; flex-shrink: 0;
}
.search-icon { width: 14px; flex-shrink: 0; fill: none; stroke: #777d6e; stroke-linecap: round; stroke-width: 1.8; }
.search-input {
  flex: 1; background: transparent; border: 0; outline: none;
  color: #ecebdc; font-size: 12px;
}
.search-input::placeholder { color: #4a5041; }

.summary-bar {
  display: flex; gap: 1px; background: #252a20;
  border-bottom: 1px solid #2e3329; flex-shrink: 0;
}
.summary-chip {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  padding: 8px; background: #1a1e17;
}
.chip-value { font-size: 18px; font-weight: 700; color: #ecebdc; line-height: 1; }
.chip-label { font-size: 8px; color: #777d6e; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }

.empty-state {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 10px; padding: 48px; color: #777d6e;
}
.empty-state svg { width: 40px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.2; opacity: 0.5; }
.empty-state p { margin: 0; font-size: 13px; }
.btn-add-inline {
  padding: 8px 18px; background: transparent; color: #d8be76;
  border: 1px solid #d8be76; border-radius: 7px; font-size: 11px;
  font-weight: 600; cursor: pointer; transition: all 150ms; margin-top: 4px;
}
.btn-add-inline:hover { background: rgba(216,190,118,0.1); }

.room-grid {
  flex: 1; overflow-y: auto; padding: 16px; display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px; align-content: start;
  scrollbar-width: thin; scrollbar-color: #434936 transparent;
}

.room-card {
  background: #1e2219;
  border: 1px solid #2e3329;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 150ms, transform 150ms;
}
.room-card:hover { border-color: #3a4033; transform: translateY(-1px); }
.card-status-bar { height: 3px; flex-shrink: 0; }
.card-body { padding: 14px 14px 10px; flex: 1; }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.card-title-group { flex: 1; min-width: 0; }
.room-code { font-size: 9px; font-weight: 700; color: #777d6e; letter-spacing: 0.06em; text-transform: uppercase; }
.room-name { margin: 2px 0 0; font-size: 13px; font-weight: 700; color: #ecebdc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status-badge { flex-shrink: 0; padding: 2px 7px; border-radius: 10px; font-size: 8px; font-weight: 700; white-space: nowrap; }

.card-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.meta-item {
  display: flex; align-items: center; gap: 4px;
  font-size: 10px; color: #9fa492; background: #252a20;
  border: 1px solid #2e3329; border-radius: 4px; padding: 3px 6px;
}
.meta-item svg { width: 11px; flex-shrink: 0; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }

.card-unit {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; color: #777d6e; margin-top: 4px;
}
.card-unit svg { width: 11px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }

.card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 14px; border-top: 1px solid #252a20; background: #191d16;
}
.asset-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; background: transparent;
  border: 1px solid #3a4033; border-radius: 6px; color: #9fa492;
  font-size: 10px; font-weight: 600; cursor: pointer; transition: all 150ms;
}
.asset-btn:hover { background: #252a20; color: #d8be76; border-color: #d8be76; }
.asset-btn svg { width: 12px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }
.asset-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 16px; height: 16px; padding: 0 4px;
  background: #3a4033; border-radius: 8px; font-size: 9px; font-weight: 700;
}
.card-actions { display: flex; gap: 4px; }
.icon-btn {
  display: inline-grid; width: 26px; height: 26px; place-items: center;
  background: transparent; border: 1px solid transparent; border-radius: 5px;
  cursor: pointer; transition: all 120ms;
}
.icon-btn svg { width: 13px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.icon-btn.edit { color: #777d6e; }
.icon-btn.edit:hover { background: #252a20; color: #d8be76; border-color: #3a4033; }
.icon-btn.delete { color: #777d6e; }
.icon-btn.delete:hover { background: #2a1a1a; color: #c96a56; border-color: #5a2a2a; }

/* Confirm dialog */
.confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px); display: flex; align-items: center;
  justify-content: center; z-index: 300;
}
.confirm-box {
  background: #1a1e17; border: 1px solid #3a4033; border-radius: 10px;
  padding: 24px; max-width: 320px; text-align: center;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.confirm-box h4 { margin: 0 0 8px; color: #ecebdc; font-size: 14px; }
.confirm-box p { margin: 0 0 18px; color: #9fa492; font-size: 11px; line-height: 1.5; }
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-danger {
  padding: 8px 16px; background: #c96a56; color: #fff;
  border: 0; border-radius: 7px; font-size: 12px; font-weight: 700;
  cursor: pointer; transition: all 150ms;
}
.btn-danger:hover { background: #d47a68; }
.btn-secondary {
  padding: 8px 14px; background: transparent; color: #9fa492;
  border: 1px solid #3a4033; border-radius: 7px; font-size: 12px;
  font-weight: 600; cursor: pointer; transition: all 150ms;
}
.btn-secondary:hover { background: #1f231b; color: #ecebdc; }
</style>
