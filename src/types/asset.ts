export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged'
export type AssetStatus = 'Active' | 'Inactive' | 'Under Repair' | 'Disposed' | 'Lost'
export type AcquisitionMethod = 'Purchase' | 'Donation' | 'Lease' | 'Transfer' | 'Rental' | 'Other'

export interface Asset {
  // Identification
  id: string            // AST-0001
  code: string          // FA-2026-001
  name: string          // Office Chair
  category: string      // Furniture
  type: string          // Chair
  description: string

  // Location
  parcel: string
  buildingId: string
  floor: string
  roomId: string        // FK → Room
  locationDetail: string

  // Specification
  brand: string
  model: string
  serialNumber: string
  quantity: number
  unit: string          // Unit, Pcs, Set, etc.

  // Acquisition
  acquisitionDate: string       // ISO date
  acquisitionMethod: AcquisitionMethod
  vendor: string
  purchasePrice: number | null  // IDR
  purchaseDocument: string      // Invoice/PO reference

  // Condition
  condition: AssetCondition
  status: AssetStatus
  usefulLife: number | null     // years
  maintenanceRoutine: number | null     // month
  lastMaintenanceDate: string   // ISO date
  warrantyExpiry: string        // ISO date

  // Management
  responsibleUnit: string
  pic: string                   // Person In Charge
  ownership: string

  // Documentation
  photo: string                 // base64 or URL
  document: string              // description of docs
  notes: string

  createdAt: string
  updatedAt: string
}

export type AssetDraft = Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>
