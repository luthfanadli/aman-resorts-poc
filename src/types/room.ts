export type RoomStatus = 'Active' | 'Inactive' | 'Renovation'

export type RoomType =
  | 'Meeting Room'
  | 'Office'
  | 'Storage'
  | 'Lobby'
  | 'Reception'
  | 'Dining'
  | 'Kitchen'
  | 'Bathroom'
  | 'Corridor'
  | 'Server Room'
  | 'Security Room'
  | 'Other'

export interface Room {
  id: string            // ROOM-001
  code: string          // 2F-201
  name: string          // Meeting Room 1
  buildingId: string    // FK → building (GeoJSON feature index as string)
  floor: string         // 1, 2, B1, etc.
  type: RoomType
  description: string
  area: number | null   // m²
  capacity: number | null
  status: RoomStatus
  responsibleUnit: string
  photo: string         // base64 or URL
  floorPlan: string     // base64 or polygon string
  notes: string
  createdAt: string     // ISO date
  updatedAt: string     // ISO date
}

export type RoomDraft = Omit<Room, 'id' | 'createdAt' | 'updatedAt'>
