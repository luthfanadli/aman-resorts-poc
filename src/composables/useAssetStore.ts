import { computed, ref, watch } from 'vue'
import type { Asset, AssetDraft } from '../types/asset'

const STORAGE_KEY = 'tl_assets'

function generateId(assets: Asset[]): string {
  const max = assets.reduce((acc, a) => {
    const n = parseInt(a.id.replace('AST-', ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return `AST-${String(max + 1).padStart(4, '0')}`
}

function now(): string {
  return new Date().toISOString()
}

function normalizeAsset(asset: Asset): Asset {
  return {
    ...asset,
    maintenanceRoutine: typeof asset.maintenanceRoutine === 'number'
      ? asset.maintenanceRoutine
      : null,
    lastMaintenanceDate: typeof asset.lastMaintenanceDate === 'string' && asset.lastMaintenanceDate
      ? asset.lastMaintenanceDate
      : null,
  }
}

function loadFromStorage(): Asset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return (JSON.parse(raw) as Asset[]).map(normalizeAsset)
  } catch {
    // ignore
  }
  return seedAssets()
}

function seedAssets(): Asset[] {
  const ts = now()
  return [
    {
      id: 'AST-0001',
      code: 'FA-2026-001',
      name: 'Ergonomic Office Chair',
      category: 'Furniture',
      type: 'Chair',
      description: 'High-back ergonomic chair with lumbar support',
      parcel: 'Parcel A',
      buildingId: '0',
      floor: '1',
      roomId: 'ROOM-002',
      locationDetail: 'East side near window',
      brand: 'Herman Miller',
      model: 'Aeron',
      serialNumber: 'SN-HM-123456',
      quantity: 5,
      unit: 'Unit',
      acquisitionDate: '2024-03-12',
      acquisitionMethod: 'Purchase',
      vendor: 'ABC Furniture Bali',
      purchasePrice: 2500000,
      purchaseDocument: 'INV-2024-0312',
      condition: 'Good',
      status: 'Active',
      usefulLife: 8,
      maintenanceRoutine: null,
      lastMaintenanceDate: null,
      warrantyExpiry: '2027-03-12',
      responsibleUnit: 'Administration',
      pic: 'Wayan Susila',
      ownership: 'Aman Group',
      photo: '',
      document: 'Invoice, Warranty Card',
      notes: 'Annual maintenance required',
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'AST-0002',
      code: 'FA-2026-002',
      name: 'Projector Epson EB-2265U',
      category: 'Electronics',
      type: 'Projector',
      description: 'Full HD projector for presentations',
      parcel: 'Parcel A',
      buildingId: '0',
      floor: '1',
      roomId: 'ROOM-002',
      locationDetail: 'Ceiling mount, center',
      brand: 'Epson',
      model: 'EB-2265U',
      serialNumber: 'EPS-789012',
      quantity: 1,
      unit: 'Unit',
      acquisitionDate: '2024-01-20',
      acquisitionMethod: 'Purchase',
      vendor: 'PT. Media Digital',
      purchasePrice: 18000000,
      purchaseDocument: 'PO-2024-0120',
      condition: 'Excellent',
      status: 'Active',
      usefulLife: 5,
      maintenanceRoutine: null,
      lastMaintenanceDate: null,
      warrantyExpiry: '2027-01-20',
      responsibleUnit: 'IT Department',
      pic: 'Made Artha',
      ownership: 'Aman Group',
      photo: '',
      document: 'Invoice, Warranty, Installation Report',
      notes: 'Lamp replacement due in 2026',
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'AST-0003',
      code: 'EL-2026-001',
      name: 'Dell PowerEdge R740 Server',
      category: 'IT Equipment',
      type: 'Server',
      description: '2U rack server for application hosting',
      parcel: 'Parcel A',
      buildingId: '0',
      floor: '2',
      roomId: 'ROOM-003',
      locationDetail: 'Rack 3, Slot 1-2',
      brand: 'Dell',
      model: 'PowerEdge R740',
      serialNumber: 'DELL-SRV-001',
      quantity: 1,
      unit: 'Unit',
      acquisitionDate: '2023-06-01',
      acquisitionMethod: 'Purchase',
      vendor: 'PT. Nusantara Tech',
      purchasePrice: 85000000,
      purchaseDocument: 'PO-2023-0601',
      condition: 'Good',
      status: 'Active',
      usefulLife: 5,
      maintenanceRoutine: null,
      lastMaintenanceDate: null,
      warrantyExpiry: '2028-06-01',
      responsibleUnit: 'IT Department',
      pic: 'Made Artha',
      ownership: 'Aman Group',
      photo: '',
      document: 'Invoice, BA Penerimaan, Warranty',
      notes: 'Backup power: UPS attached',
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'AST-0004',
      code: 'FA-2026-010',
      name: 'Dining Table Set',
      category: 'Furniture',
      type: 'Table',
      description: '6-person teak dining table with chairs',
      parcel: 'Parcel B',
      buildingId: '1',
      floor: '1',
      roomId: 'ROOM-004',
      locationDetail: 'Section A, Zone 1',
      brand: 'Teak Masters',
      model: 'Bali Classic 6',
      serialNumber: 'TM-2024-010',
      quantity: 10,
      unit: 'Set',
      acquisitionDate: '2024-05-15',
      acquisitionMethod: 'Purchase',
      vendor: 'Bali Wood Furniture',
      purchasePrice: 8500000,
      purchaseDocument: 'INV-2024-0515',
      condition: 'Good',
      status: 'Active',
      usefulLife: 10,
      maintenanceRoutine: null,
      lastMaintenanceDate: null,
      warrantyExpiry: '2026-05-15',
      responsibleUnit: 'F&B Department',
      pic: 'Nyoman Darma',
      ownership: 'Aman Group',
      photo: '',
      document: 'Invoice, Delivery Note',
      notes: 'Monthly cleaning and oiling required',
      createdAt: ts,
      updatedAt: ts,
    },
  ]
}

// Singleton state
const assets = ref<Asset[]>(loadFromStorage())

watch(
  assets,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true },
)

export function useAssetStore() {
  function getAssetsForRoom(roomId: string) {
    return computed(() => assets.value.filter((a) => a.roomId === roomId))
  }

  function getAssetsForBuilding(buildingId: string) {
    return computed(() => assets.value.filter((a) => a.buildingId === buildingId))
  }

  function addAsset(draft: AssetDraft): Asset {
    const asset: Asset = {
      ...draft,
      id: generateId(assets.value),
      createdAt: now(),
      updatedAt: now(),
    }
    assets.value = [...assets.value, asset]
    return asset
  }

  function updateAsset(id: string, data: Partial<AssetDraft>): void {
    assets.value = assets.value.map((a) =>
      a.id === id ? { ...a, ...data, updatedAt: now() } : a,
    )
  }

  function deleteAsset(id: string): void {
    assets.value = assets.value.filter((a) => a.id !== id)
  }

  function getAsset(id: string): Asset | undefined {
    return assets.value.find((a) => a.id === id)
  }

  return {
    assets,
    getAssetsForRoom,
    getAssetsForBuilding,
    addAsset,
    updateAsset,
    deleteAsset,
    getAsset,
  }
}
