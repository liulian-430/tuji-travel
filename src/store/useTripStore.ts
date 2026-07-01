import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, DaySchedule, TripPOI } from '@/data/mock';

interface TripState {
  trips: Trip[];
  pendingTrip: {
    name: string;
    destination: string;
    days: number;
    schedules: DaySchedule[];
    pois: TripPOI[];
  } | null;
  setPendingTrip: (trip: {
    name: string;
    destination: string;
    days: number;
    schedules: DaySchedule[];
    pois: TripPOI[];
  }) => void;
  clearPendingTrip: () => void;
  addTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  addPOIToTrip: (tripId: string, poi: TripPOI) => void;
  removePOIFromTrip: (tripId: string, poiId: string) => void;
  completeTrip: (tripId: string) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      pendingTrip: null,
      setPendingTrip: (trip) => set({ pendingTrip: trip }),
      clearPendingTrip: () => set({ pendingTrip: null }),
      addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips] })),
      removeTrip: (tripId) => set((state) => ({
        trips: state.trips.filter((t) => t.id !== tripId),
      })),
      updateTrip: (tripId, updates) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, ...updates } : t
        ),
      })),
      addPOIToTrip: (tripId, poi) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, pois: [...t.pois, poi] } : t
        ),
      })),
      removePOIFromTrip: (tripId, poiId) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId
            ? { ...t, pois: t.pois.filter((p) => p.id !== poiId) }
            : t
        ),
      })),
      completeTrip: (tripId) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, status: 'completed' as const } : t
        ),
      })),
    }),
    {
      name: 'tuji-trip-storage',
    }
  )
);
