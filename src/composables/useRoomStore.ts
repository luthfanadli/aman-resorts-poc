import { computed, ref, watch } from 'vue'
import type { Room, RoomDraft } from '../types/room'

const STORAGE_KEY = 'tl_rooms'

function generateId(rooms: Room[]): string {
  const max = rooms.reduce((acc, r) => {
    const n = parseInt(r.id.replace('ROOM-', ''), 10)
    return isNaN(n) ? acc : Math.max(acc, n)
  }, 0)
  return `ROOM-${String(max + 1).padStart(3, '0')}`
}

function now(): string {
  return new Date().toISOString()
}

function loadFromStorage(): Room[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Room[]
  } catch {
    // ignore
  }
  return seedRooms()
}

function seedRooms(): Room[] {
  const ts = now()
  return [
    {
      id: 'ROOM-001',
      code: '1F-101',
      name: 'Main Lobby',
      buildingId: '0',
      floor: '1',
      type: 'Lobby',
      description: 'Main entrance lobby of the resort',
      area: 240,
      capacity: 80,
      status: 'Active',
      responsibleUnit: 'Front Office',
      photo: '',
      floorPlan: '',
      notes: 'Open 24 hours',
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'ROOM-002',
      code: '1F-102',
      name: 'Meeting Room Alpha',
      buildingId: '0',
      floor: '1',
      type: 'Meeting Room',
      description: 'Conference room for up to 20 people',
      area: 60,
      capacity: 20,
      status: 'Active',
      responsibleUnit: 'Administration',
      photo: '',
      floorPlan: '',
      notes: 'Projector and whiteboard available',
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'ROOM-003',
      code: '2F-201',
      name: 'Server Room',
      buildingId: '0',
      floor: '2',
      type: 'Server Room',
      description: 'IT infrastructure room',
      area: 30,
      capacity: 5,
      status: 'Active',
      responsibleUnit: 'IT Department',
      photo: '',
      floorPlan: '',
      notes: 'Restricted access — IT staff only',
      createdAt: ts,
      updatedAt: ts,
    },
    {
      id: 'ROOM-004',
      code: '1F-103',
      name: 'Restaurant',
      buildingId: '1',
      floor: '1',
      type: 'Dining',
      description: 'Main dining area for guests',
      area: 180,
      capacity: 60,
      status: 'Active',
      responsibleUnit: 'F&B Department',
      photo: '',
      floorPlan: '',
      notes: 'Open daily 07:00-22:00',
      createdAt: ts,
      updatedAt: ts,
    },
  ]
}

// Singleton state
const rooms = ref<Room[]>(loadFromStorage())

watch(
  rooms,
  (val) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  },
  { deep: true },
)

export function useRoomStore() {
  function getRoomsForBuilding(buildingId: string) {
    return computed(() => rooms.value.filter((r) => r.buildingId === buildingId))
  }

  function addRoom(draft: RoomDraft): Room {
    const room: Room = {
      ...draft,
      id: generateId(rooms.value),
      createdAt: now(),
      updatedAt: now(),
    }
    rooms.value = [...rooms.value, room]
    return room
  }

  function updateRoom(id: string, data: Partial<RoomDraft>): void {
    rooms.value = rooms.value.map((r) =>
      r.id === id ? { ...r, ...data, updatedAt: now() } : r,
    )
  }

  function deleteRoom(id: string): void {
    rooms.value = rooms.value.filter((r) => r.id !== id)
  }

  function getRoom(id: string): Room | undefined {
    return rooms.value.find((r) => r.id === id)
  }

  return { rooms, getRoomsForBuilding, addRoom, updateRoom, deleteRoom, getRoom }
}
