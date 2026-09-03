<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAssetStore } from '../../composables/useAssetStore'
import AssetFormModal from './AssetFormModal.vue'
import type { Room } from '../../types/room'
import type { Asset, AssetDraft } from '../../types/asset'

const props = defineProps<{
  room: Room
  buildingId: string
}>()
const emit = defineEmits<{ back: [] }>()

const { getAssetsForRoom, addAsset, updateAsset, deleteAsset } = useAssetStore()
const assets = getAssetsForRoom(props.room.id)

const showForm = ref(false)
const editingAsset = ref<Asset | null>(null)
const confirmDeleteId = ref<string | null>(null)

function openAdd() {
  editingAsset.value = null
  showForm.value = true
}
function openEdit(a: Asset) {
  editingAsset.value = a
  showForm.value = true
}
function closeForm() {
  showForm.value = false
  editingAsset.value = null
}

function handleSave(draft: AssetDraft) {
  if (editingAsset.value) {
    updateAsset(editingAsset.value.id, draft)
  } else {
    addAsset(draft)
  }
  closeForm()
}

function confirmDelete(id: string) { confirmDeleteId.value = id }
function cancelDelete() { confirmDeleteId.value = null }
function executeDelete() {
  if (confirmDeleteId.value) deleteAsset(confirmDeleteId.value)
  confirmDeleteId.value = null
}

const conditionColor: Record<string, string> = {
  Excellent: '#9db361',
  Good: '#6baa6e',
  Fair: '#d8be76',
  Poor: '#e09a5a',
  Damaged: '#c96a56',
}
const statusColor: Record<string, string> = {
  Active: '#6baa6e',
  Inactive: '#777d6e',
  'Under Repair': '#d8be76',
  Disposed: '#c96a56',
  Lost: '#9b5e5e',
}

function formatPrice(val: number | null): string {
  if (val === null) return '—'
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(val)
}

const totalAssets = computed(() => assets.value.length)
const activeAssets = computed(() => assets.value.filter((a) => a.status === 'Active').length)
</script>

<template>
  <div class="asset-list">
    <!-- Header -->
    <div class="list-header">
      <div class="breadcrumb">
        <button type="button" class="back-btn" @click="emit('back')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          Rooms
        </button>
        <span class="separator">/</span>
        <span class="current">{{ room.name }}</span>
      </div>
      <button type="button" class="btn-add" @click="openAdd">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
        Tambah Asset
      </button>
    </div>

    <!-- Summary bar -->
    <div class="summary-bar">
      <div class="summary-chip">
        <span class="chip-value">{{ totalAssets }}</span>
        <span class="chip-label">Total Asset</span>
      </div>
      <div class="summary-chip">
        <span class="chip-value" style="color: #6baa6e">{{ activeAssets }}</span>
        <span class="chip-label">Active</span>
      </div>
      <div class="summary-chip">
        <span class="chip-value" style="color: #d8be76">{{ totalAssets - activeAssets }}</span>
        <span class="chip-label">Inactive / Other</span>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="assets.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14l-1.5 9H6.5L5 8ZM3 5h18M10 5l1-2h2l1 2" />
      </svg>
      <p>Belum ada asset di ruangan ini</p>
      <button type="button" class="btn-add-inline" @click="openAdd">Tambah Asset Pertama</button>
    </div>

    <!-- Asset table -->
    <div v-else class="table-wrap">
      <table class="asset-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama Asset</th>
            <th>Kategori</th>
            <th>Brand / Model</th>
            <th>Qty</th>
            <th>Harga</th>
            <th>Kondisi</th>
            <th>Status</th>
            <th>PIC</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in assets" :key="asset.id">
            <td class="id-cell">{{ asset.id }}</td>
            <td class="name-cell">
              <strong>{{ asset.name }}</strong>
              <small>{{ asset.code }}</small>
            </td>
            <td>{{ asset.category }}</td>
            <td class="muted-cell">
              {{ asset.brand || '—' }}
              <small v-if="asset.model">{{ asset.model }}</small>
            </td>
            <td class="center">{{ asset.quantity }} {{ asset.unit }}</td>
            <td class="price-cell">{{ formatPrice(asset.purchasePrice) }}</td>
            <td>
              <span class="badge" :style="{ background: conditionColor[asset.condition] + '22', color: conditionColor[asset.condition] }">
                {{ asset.condition }}
              </span>
            </td>
            <td>
              <span class="badge" :style="{ background: statusColor[asset.status] + '22', color: statusColor[asset.status] }">
                {{ asset.status }}
              </span>
            </td>
            <td class="muted-cell">{{ asset.pic || '—' }}</td>
            <td class="actions-cell">
              <button type="button" class="icon-btn edit" title="Edit" @click="openEdit(asset)">
                <svg viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" /></svg>
              </button>
              <button type="button" class="icon-btn delete" title="Hapus" @click="confirmDelete(asset.id)">
                <svg viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirm -->
    <div v-if="confirmDeleteId" class="confirm-overlay" @mousedown.self="cancelDelete">
      <div class="confirm-box">
        <h4>Hapus Asset?</h4>
        <p>Tindakan ini tidak dapat dibatalkan.</p>
        <div class="confirm-actions">
          <button type="button" class="btn-secondary" @click="cancelDelete">Batal</button>
          <button type="button" class="btn-danger" @click="executeDelete">Hapus</button>
        </div>
      </div>
    </div>

    <!-- Asset Form Modal -->
    <AssetFormModal
      v-if="showForm"
      :building-id="buildingId"
      :room-id="room.id"
      :asset="editingAsset"
      @save="handleSave"
      @cancel="closeForm"
    />
  </div>
</template>

<style scoped>
.asset-list { display: flex; flex-direction: column; min-height: 0; flex: 1; }

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #2e3329;
  flex-shrink: 0;
}
.breadcrumb { display: flex; align-items: center; gap: 8px; }
.back-btn {
  display: flex; align-items: center; gap: 5px;
  background: transparent; border: 0; color: #d8be76;
  font-size: 12px; font-weight: 600; cursor: pointer;
  padding: 0; transition: color 150ms;
}
.back-btn:hover { color: #e0cc8e; }
.back-btn svg { width: 16px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 2; }
.separator { color: #4a5041; font-size: 14px; }
.current { font-size: 12px; font-weight: 600; color: #ecebdc; }

.btn-add {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: #d8be76; color: #10120e;
  border: 0; border-radius: 7px; font-size: 11px; font-weight: 700;
  cursor: pointer; transition: all 150ms;
}
.btn-add:hover { background: #e0cc8e; }
.btn-add svg { width: 14px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-width: 2.2; }

.summary-bar {
  display: flex;
  gap: 1px;
  background: #252a20;
  border-bottom: 1px solid #2e3329;
  flex-shrink: 0;
}
.summary-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: #1a1e17;
}
.chip-value { font-size: 20px; font-weight: 700; color: #ecebdc; line-height: 1; }
.chip-label { font-size: 9px; color: #777d6e; margin-top: 3px; }

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

.table-wrap { flex: 1; overflow: auto; scrollbar-width: thin; scrollbar-color: #434936 transparent; }
.asset-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.asset-table thead th {
  position: sticky; top: 0; padding: 10px 14px;
  background: #171a14; color: #777d6e; font-size: 9px;
  font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
  text-align: left; white-space: nowrap; border-bottom: 1px solid #2e3329;
}
.asset-table tbody tr {
  border-bottom: 1px solid #20241b;
  transition: background 120ms;
}
.asset-table tbody tr:hover { background: #1e2219; }
.asset-table td { padding: 10px 14px; color: #dedfd1; vertical-align: middle; }
.id-cell { color: #9fa492; font-size: 10px; white-space: nowrap; }
.name-cell { min-width: 140px; }
.name-cell strong { display: block; color: #ecebdc; font-weight: 600; }
.name-cell small { display: block; color: #777d6e; font-size: 9px; margin-top: 2px; }
.muted-cell { color: #9fa492; }
.muted-cell small { display: block; font-size: 9px; color: #5e6457; margin-top: 2px; }
.center { text-align: center; }
.price-cell { white-space: nowrap; font-variant-numeric: tabular-nums; }

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
}

.actions-cell { white-space: nowrap; }
.icon-btn {
  display: inline-grid; width: 26px; height: 26px; place-items: center;
  background: transparent; border: 1px solid transparent; border-radius: 5px;
  cursor: pointer; transition: all 120ms;
}
.icon-btn svg { width: 13px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.icon-btn.edit { color: #9fa492; }
.icon-btn.edit:hover { background: #252a20; color: #d8be76; border-color: #3a4033; }
.icon-btn.delete { color: #9fa492; }
.icon-btn.delete:hover { background: #2a1a1a; color: #c96a56; border-color: #5a2a2a; }

/* Delete confirm */
.confirm-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px); display: flex; align-items: center;
  justify-content: center; z-index: 10;
}
.confirm-box {
  background: #1a1e17; border: 1px solid #3a4033; border-radius: 10px;
  padding: 24px; max-width: 300px; text-align: center;
  box-shadow: 0 16px 48px rgba(0,0,0,0.5);
}
.confirm-box h4 { margin: 0 0 8px; color: #ecebdc; font-size: 14px; }
.confirm-box p { margin: 0 0 18px; color: #9fa492; font-size: 11px; }
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
