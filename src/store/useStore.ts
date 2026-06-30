import { create } from 'zustand';
import { Trip, DaySchedule, Budget, Expense, mockTrips, mockDaySchedules, mockBudgets, mockExpenses } from '../data/mock';

interface TripStore {
  trips: Trip[];
  currentTrip: Trip | null;
  schedules: DaySchedule[];
  budgets: Budget[];
  expenses: Expense[];
  addTrip: (trip: Trip) => void;
  setCurrentTrip: (trip: Trip | null) => void;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
}

export const useTripStore = create<TripStore>((set) => ({
  trips: mockTrips,
  currentTrip: null,
  schedules: mockDaySchedules,
  budgets: mockBudgets,
  expenses: mockExpenses,
  addTrip: (trip) => set((state) => ({ trips: [...state.trips, trip] })),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  updateTrip: (id, updates) => set((state) => ({
    trips: state.trips.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),
  deleteTrip: (id) => set((state) => ({
    trips: state.trips.filter((t) => t.id !== id),
  })),
}));

interface POIStore {
  pois: typeof import('../data/mock').mockPOIs;
  favorites: string[];
  addFavorite: (poiId: string) => void;
  removeFavorite: (poiId: string) => void;
}

export const usePOIStore = create<POIStore>((set) => ({
  pois: [],
  favorites: [],
  addFavorite: (poiId) => set((state) => ({ favorites: [...state.favorites, poiId] })),
  removeFavorite: (poiId) => set((state) => ({ favorites: state.favorites.filter((id) => id !== poiId) })),
}));
