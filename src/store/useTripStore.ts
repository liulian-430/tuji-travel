import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripPOI } from '@/data/mock';

export interface DayScheduleSimple {
  day: number;
  morning?: TripPOI[];
  afternoon?: TripPOI[];
  evening?: TripPOI[];
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  days: number;
  nights?: number;
  people?: number;
  startDate: string;
  status: 'planning' | 'in_progress' | 'ongoing' | 'completed';
  coverImage?: string;
  createdAt?: string;
  budget?: number;
  spent?: number;
  pois: TripPOI[];
  daysList?: DayScheduleSimple[];
}

export interface Expense {
  id: string;
  tripId: string;
  category: 'transportation' | 'accommodation' | 'food' | 'ticket' | 'shopping' | 'other';
  amount: number;
  date: string;
  note: string;
}

export interface Budget {
  tripId: string;
  totalBudget: number;
  transportation: number;
  accommodation: number;
  food: number;
  ticket: number;
  shopping: number;
  other: number;
}

interface TripState {
  trips: Trip[];
  expenses: Expense[];
  budgets: Budget[];
  favoritePOIs: string[];
  visitedCities: string[];
  pendingTrip: {
    name: string;
    destination: string;
    days: number;
    schedules: DayScheduleSimple[];
    pois: TripPOI[];
  } | null;
  setPendingTrip: (trip: {
    name: string;
    destination: string;
    days: number;
    schedules: DayScheduleSimple[];
    pois: TripPOI[];
  }) => void;
  clearPendingTrip: () => void;
  addTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  addPOIToTrip: (tripId: string, poi: TripPOI) => void;
  removePOIFromTrip: (tripId: string, poiId: string) => void;
  completeTrip: (tripId: string) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (expenseId: string) => void;
  updateBudget: (tripId: string, budget: Budget) => void;
  toggleFavoritePOI: (poiId: string) => void;
  addVisitedCity: (city: string) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      expenses: [],
      budgets: [],
      favoritePOIs: [],
      visitedCities: [],
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
      addExpense: (expense) => set((state) => {
        const trip = state.trips.find((t) => t.id === expense.tripId);
        const newSpent = (trip?.spent || 0) + expense.amount;
        return {
          expenses: [expense, ...state.expenses],
          trips: state.trips.map((t) =>
            t.id === expense.tripId ? { ...t, spent: newSpent } : t
          ),
        };
      }),
      removeExpense: (expenseId) => set((state) => {
        const expense = state.expenses.find((e) => e.id === expenseId);
        if (!expense) return { expenses: state.expenses };
        const trip = state.trips.find((t) => t.id === expense.tripId);
        const newSpent = Math.max(0, (trip?.spent || 0) - expense.amount);
        return {
          expenses: state.expenses.filter((e) => e.id !== expenseId),
          trips: state.trips.map((t) =>
            t.id === expense.tripId ? { ...t, spent: newSpent } : t
          ),
        };
      }),
      updateBudget: (tripId, budget) => set((state) => {
        const existing = state.budgets.find((b) => b.tripId === tripId);
        return {
          budgets: existing
            ? state.budgets.map((b) => (b.tripId === tripId ? budget : b))
            : [...state.budgets, budget],
        };
      }),
      toggleFavoritePOI: (poiId) => set((state) => ({
        favoritePOIs: state.favoritePOIs.includes(poiId)
          ? state.favoritePOIs.filter((id) => id !== poiId)
          : [...state.favoritePOIs, poiId],
      })),
      addVisitedCity: (city) => set((state) => ({
        visitedCities: state.visitedCities.includes(city)
          ? state.visitedCities
          : [...state.visitedCities, city],
      })),
    }),
    {
      name: 'tuji-trip-storage',
    }
  )
);
