<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { Asset, AssetDraft, AssetCondition, AssetStatus, AcquisitionMethod } from '../../types/asset'

const props = defineProps<{
  buildingId: string
  roomId: string
  asset?: Asset | null
}>()

const emit = defineEmits<{
  save: [draft: AssetDraft]
  cancel: []
}>()

const CONDITIONS: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']
const STATUSES: AssetStatus[] = ['Active', 'Inactive', 'Under Repair', 'Disposed', 'Lost']
const ACQUISITION_METHODS: AcquisitionMethod[] = ['Purchase', 'Donation', 'Lease', 'Transfer', 'Rental', 'Other']
const UNITS = ['Unit', 'Pcs', 'Set', 'Box', 'Meter', 'Kg', 'Liter', 'Roll', 'Lembar']

type Section = 'identification' | 'location' | 'spec' | 'acquisition' | 'condition' | 'management' | 'documentation'
const openSections = ref<Set<Section>>(new Set(['identification', 'location', 'spec']))

function toggleSection(s: Section) {
  if (openSections.value.has(s)) {
    openSections.value.delete(s)
  } else {
    openSections.value.add(s)
  }
}

function blankDraft(): AssetDraft {
  return {
    code: '',
    name: '',
    category: '',
    type: '',
    description: '',
    parcel: '',
    buildingId: props.buildingId,
    floor: '',
    roomId: props.roomId,
    locationDetail: '',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: 1,
    unit: 'Unit',
    acquisitionDate: '',
    acquisitionMethod: 'Purchase',
    vendor: '',
    purchasePrice: null,
    purchaseDocument: '',
    condition: 'Good',
    status: 'Active',
    usefulLife: null,
    lastMaintenanceDate: '',
    maintenanceRoutine: null,
    warrantyExpiry: '',
    responsibleUnit: '',
    pic: '',
    ownership: 'Aman Group',
    photo: '',
    document: '',
    notes: '',
  }
}

const form = reactive<AssetDraft>(blankDraft())

watch(
  () => props.asset,
  (a) => {
    if (a) {
      Object.assign(form, { ...a })
    } else {
      Object.assign(form, blankDraft())
    }
  },
  { immediate: true },
)

function handlePhotoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => { form.photo = (ev.target?.result as string) ?? '' }
  reader.readAsDataURL(file)
}

function formatCurrency(val: number | null): string {
  if (val === null) return ''
  return new Intl.NumberFormat('id-ID').format(val)
}

function parseCurrency(str: string): number | null {
  const n = parseInt(str.replace(/\D/g, ''), 10)
  return isNaN(n) ? null : n
}

function onPriceInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  form.purchasePrice = parseCurrency(raw)
}

function submit() {
  emit('save', { ...form, buildingId: props.buildingId, roomId: props.roomId })
}
</script>

<template>
  <div class="form-modal-overlay" @mousedown.self="emit('cancel')">
    <div class="form-modal" role="dialog" aria-modal="true" aria-label="Asset Form">
      <header class="form-modal-header">
        <h2>{{ asset ? 'Edit Asset' : 'Tambah Asset' }}</h2>
        <button type="button" class="close-btn" aria-label="Tutup" @click="emit('cancel')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </header>

      <form class="form-body" @submit.prevent="submit">

        <!-- Identification -->
        <div class="accordion-section">
          <button type="button" class="accordion-header" @click="toggleSection('identification')">
            <span class="acc-badge">Identification</span>
            <svg class="acc-arrow" :class="{ open: openSections.has('identification') }" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div v-if="openSections.has('identification')" class="accordion-body">
            <div class="form-grid">
              <label class="field">
                <span>Asset Code <em>*</em></span>
                <input v-model="form.code" type="text" placeholder="FA-2026-001" required />
              </label>
              <label class="field">
                <span>Asset Name <em>*</em></span>
                <input v-model="form.name" type="text" placeholder="Office Chair" required />
              </label>
              <label class="field">
                <span>Category <em>*</em></span>
                <input v-model="form.category" type="text" placeholder="Furniture" required />
              </label>
              <label class="field">
                <span>Type</span>
                <input v-model="form.type" type="text" placeholder="Chair" />
              </label>
              <label class="field full">
                <span>Description</span>
                <textarea v-model="form.description" rows="2" placeholder="Deskripsi aset" />
              </label>
            </div>
          </div>
        </div>

        <!-- Location -->
        <div class="accordion-section">
          <button type="button" class="accordion-header" @click="toggleSection('location')">
            <span class="acc-badge">Location</span>
            <svg class="acc-arrow" :class="{ open: openSections.has('location') }" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div v-if="openSections.has('location')" class="accordion-body">
            <div class="form-grid">
              <label class="field">
                <span>Parcel</span>
                <input v-model="form.parcel" type="text" placeholder="Parcel A" />
              </label>
              <label class="field">
                <span>Floor</span>
                <input v-model="form.floor" type="text" placeholder="1" />
              </label>
              <label class="field full">
                <span>Location Detail</span>
                <input v-model="form.locationDetail" type="text" placeholder="East side near window" />
              </label>
            </div>
          </div>
        </div>

        <!-- Specification -->
        <div class="accordion-section">
          <button type="button" class="accordion-header" @click="toggleSection('spec')">
            <span class="acc-badge">Specification</span>
            <svg class="acc-arrow" :class="{ open: openSections.has('spec') }" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div v-if="openSections.has('spec')" class="accordion-body">
            <div class="form-grid">
              <label class="field">
                <span>Brand</span>
                <input v-model="form.brand" type="text" placeholder="Herman Miller" />
              </label>
              <label class="field">
                <span>Model</span>
                <input v-model="form.model" type="text" placeholder="Aeron" />
              </label>
              <label class="field">
                <span>Serial Number</span>
                <input v-model="form.serialNumber" type="text" placeholder="SN-123456" />
              </label>
              <label class="field">
                <span>Quantity</span>
                <input v-model.number="form.quantity" type="number" min="1" />
              </label>
              <label class="field">
                <span>Unit</span>
                <select v-model="form.unit">
                  <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <!-- Acquisition -->
        <div class="accordion-section">
          <button type="button" class="accordion-header" @click="toggleSection('acquisition')">
            <span class="acc-badge">Acquisition</span>
            <svg class="acc-arrow" :class="{ open: openSections.has('acquisition') }" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div v-if="openSections.has('acquisition')" class="accordion-body">
            <div class="form-grid">
              <label class="field">
                <span>Acquisition Date</span>
                <input v-model="form.acquisitionDate" type="date" />
              </label>
              <label class="field">
                <span>Acquisition Method</span>
                <select v-model="form.acquisitionMethod">
                  <option v-for="m in ACQUISITION_METHODS" :key="m" :value="m">{{ m }}</option>
                </select>
              </label>
              <label class="field">
                <span>Vendor / Supplier</span>
                <input v-model="form.vendor" type="text" placeholder="ABC Furniture" />
              </label>
              <label class="field">
                <span>Purchase Price (Rp)</span>
                <input type="text" :value="form.purchasePrice !== null ? formatCurrency(form.purchasePrice) : ''"
                  placeholder="2.500.000" @input="onPriceInput" />
              </label>
              <label class="field full">
                <span>Purchase Document</span>
                <input v-model="form.purchaseDocument" type="text" placeholder="Invoice / PO number" />
              </label>
            </div>
          </div>
        </div>

        <!-- Condition -->
        <div class="accordion-section">
          <button type="button" class="accordion-header" @click="toggleSection('condition')">
            <span class="acc-badge">Condition</span>
            <svg class="acc-arrow" :class="{ open: openSections.has('condition') }" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div v-if="openSections.has('condition')" class="accordion-body">
            <div class="form-grid">
              <label class="field">
                <span>Condition</span>
                <select v-model="form.condition">
                  <option v-for="c in CONDITIONS" :key="c" :value="c">{{ c }}</option>
                </select>
              </label>
              <label class="field">
                <span>Asset Status</span>
                <select v-model="form.status">
                  <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
                </select>
              </label>
              <label class="field">
                <span>Last Maintenance Date</span>
                <input v-model="form.lastMaintenanceDate" type="date" />
              </label>
              <label class="field">
                <span>Maintanance Routine (Month)</span>
                <input v-model.number="form.maintananceRoutine" type="number" min="0" placeholder="1" />
              </label>
              <label class="field">
                <span>Useful Life (Years)</span>
                <input v-model.number="form.usefulLife" type="number" min="0" placeholder="5" />
              </label>
              <label class="field">
                <span>Warranty Expiry</span>
                <input v-model="form.warrantyExpiry" type="date" />
              </label>
            </div>
          </div>
        </div>

        <!-- Management -->
        <div class="accordion-section">
          <button type="button" class="accordion-header" @click="toggleSection('management')">
            <span class="acc-badge">Management</span>
            <svg class="acc-arrow" :class="{ open: openSections.has('management') }" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div v-if="openSections.has('management')" class="accordion-body">
            <div class="form-grid">
              <label class="field">
                <span>Responsible Unit</span>
                <input v-model="form.responsibleUnit" type="text" placeholder="IT Department" />
              </label>
              <label class="field">
                <span>PIC</span>
                <input v-model="form.pic" type="text" placeholder="John Doe" />
              </label>
              <label class="field">
                <span>Ownership</span>
                <input v-model="form.ownership" type="text" placeholder="Aman Group" />
              </label>
            </div>
          </div>
        </div>

        <!-- Documentation -->
        <div class="accordion-section">
          <button type="button" class="accordion-header" @click="toggleSection('documentation')">
            <span class="acc-badge">Documentation</span>
            <svg class="acc-arrow" :class="{ open: openSections.has('documentation') }" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          <div v-if="openSections.has('documentation')" class="accordion-body">
            <div class="form-grid">
              <label class="field full">
                <span>Photo</span>
                <input type="file" accept="image/*" @change="handlePhotoUpload" />
                <img v-if="form.photo" :src="form.photo" class="photo-preview" alt="Preview" />
              </label>
              <label class="field full">
                <span>Documents</span>
                <input v-model="form.document" type="text" placeholder="Invoice, warranty, BA" />
              </label>
              <label class="field full">
                <span>Notes</span>
                <textarea v-model="form.notes" rows="2" placeholder="Catatan tambahan" />
              </label>
            </div>
          </div>
        </div>

        <footer class="form-footer">
          <button type="button" class="btn-secondary" @click="emit('cancel')">Batal</button>
          <button type="submit" class="btn-primary">{{ asset ? 'Simpan Perubahan' : 'Tambah Asset' }}</button>
        </footer>
      </form>
    </div>
  </div>
</template>

<style scoped>
.form-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 150ms ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.form-modal {
  width: 100%;
  max-width: 680px;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  background: #1a1e17;
  border: 1px solid #3a4033;
  border-radius: 12px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.7);
  animation: slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
}

@keyframes slideUp {
  from {
    transform: translateY(24px);
    opacity: 0;
  }

  to {
    transform: none;
    opacity: 1;
  }
}

.form-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #2e3329;
  flex-shrink: 0;
}

.form-modal-header h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #ecebdc;
}

.close-btn {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  background: transparent;
  border: 1px solid #3a4033;
  border-radius: 6px;
  cursor: pointer;
  color: #9fa492;
  transition: all 150ms;
}

.close-btn:hover {
  background: #252a20;
  color: #ecebdc;
}

.close-btn svg {
  width: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.form-body {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #434936 transparent;
}

.accordion-section {
  border-bottom: 1px solid #252a20;
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 24px;
  background: transparent;
  border: 0;
  cursor: pointer;
  text-align: left;
  transition: background 120ms;
}

.accordion-header:hover {
  background: #1e2219;
}

.acc-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #d8be76;
}

.acc-arrow {
  width: 14px;
  fill: none;
  stroke: #9fa492;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
  transition: transform 200ms;
}

.acc-arrow.open {
  transform: rotate(180deg);
}

.accordion-body {
  padding: 4px 24px 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field.full {
  grid-column: 1 / -1;
}

.field>span {
  font-size: 10px;
  color: #9fa492;
  font-weight: 500;
}

.field em {
  color: #c96a56;
  font-style: normal;
  margin-left: 2px;
}

.field input,
.field select,
.field textarea {
  background: #13160f;
  border: 1px solid #3a4033;
  border-radius: 6px;
  color: #ecebdc;
  font-size: 12px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 150ms;
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  border-color: #d8be76;
}

.field input[type="file"] {
  padding: 6px 10px;
  cursor: pointer;
  color: #9fa492;
}

.photo-preview {
  margin-top: 8px;
  max-height: 100px;
  border-radius: 6px;
  border: 1px solid #3a4033;
  object-fit: cover;
}

.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid #2e3329;
  flex-shrink: 0;
  background: #1a1e17;
}

.btn-primary {
  padding: 9px 20px;
  background: #d8be76;
  color: #10120e;
  border: 0;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 150ms;
}

.btn-primary:hover {
  background: #e0cc8e;
}

.btn-secondary {
  padding: 9px 16px;
  background: transparent;
  color: #9fa492;
  border: 1px solid #3a4033;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms;
}

.btn-secondary:hover {
  background: #1f231b;
  color: #ecebdc;
}
</style>
