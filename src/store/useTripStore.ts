import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripPOI, DayScheduleSimple } from '@/data/mock';

export interface Trip {
  id: string;
  name: string;
  destination: string;
  days: number;
  nights?: number;
  people?: number;
  startDate: string;
  status: 'planning' | 'in_progress' | 'completed';
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

export interface UserProfile {
  nickname: string;
  bio: string;
  avatar: string;
}

export interface Collaborator {
  id: string;
  nickname: string;
  avatar: string;
  role: 'owner' | 'editor' | 'viewer';
  tripId: string;
}

interface UndoAction {
  type: 'removeTrip' | 'removePOI' | 'removeDay' | 'removeExpense';
  payload: unknown;
}

interface TripState {
  trips: Trip[];
  currentTripId: string | null;
  expenses: Expense[];
  budgets: Budget[];
  favoritePOIs: string[];
  visitedCities: string[];
  pendingTrip: {
    name: string;
    destination: string;
    days: number;
    nights?: number;
    people?: number;
    budget?: number;
    schedules: DayScheduleSimple[];
    pois: TripPOI[];
  } | null;
  undoStack: UndoAction[];
  setPendingTrip: (trip: {
    name: string;
    destination: string;
    days: number;
    nights?: number;
    people?: number;
    budget?: number;
    schedules: DayScheduleSimple[];
    pois: TripPOI[];
  }) => void;
  clearPendingTrip: () => void;
  setCurrentTrip: (tripId: string | null) => void;
  addTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;
  undo: () => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  addPOIToTrip: (tripId: string, poi: TripPOI, day?: number) => void;
  removePOIFromTrip: (tripId: string, poiId: string) => void;
  movePOIToDay: (tripId: string, poiId: string, targetDay: number) => void;
  addDayToTrip: (tripId: string) => void;
  removeDayFromTrip: (tripId: string, day: number) => void;
  completeTrip: (tripId: string) => void;
  addExpense: (expense: Expense) => void;
  removeExpense: (expenseId: string) => void;
  updateBudget: (tripId: string, budget: Budget) => void;
  toggleFavoritePOI: (poiId: string) => void;
  addVisitedCity: (city: string) => void;
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  collaborators: Collaborator[];
  addCollaborator: (collaborator: Omit<Collaborator, 'id'>) => void;
  removeCollaborator: (collaboratorId: string) => void;
  updateCollaboratorRole: (collaboratorId: string, role: Collaborator['role']) => void;
}

function computeDays(daysList?: DayScheduleSimple[], fallback?: number): number {
  if (!daysList || daysList.length === 0) return fallback ?? 1;
  return Math.max(...daysList.map((d) => d.day));
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: [],
      currentTripId: null,
      expenses: [],
      budgets: [],
      favoritePOIs: [],
      visitedCities: [],
      pendingTrip: null,
      undoStack: [],
      setPendingTrip: (trip) => set({ pendingTrip: trip }),
      clearPendingTrip: () => set({ pendingTrip: null }),
      setCurrentTrip: (tripId) => set({ currentTripId: tripId }),
      addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips], currentTripId: state.currentTripId || trip.id })),
      removeTrip: (tripId) => set((state) => {
        const deletedTrip = state.trips.find((t) => t.id === tripId);
        if (!deletedTrip) return state;
        return {
          trips: state.trips.filter((t) => t.id !== tripId),
          undoStack: [...state.undoStack, { type: 'removeTrip', payload: deletedTrip }],
        };
      }),
      updateTrip: (tripId, updates) => set((state) => ({
        trips: state.trips.map((t) =>
          t.id === tripId ? { ...t, ...updates } : t
        ),
      })),
      addPOIToTrip: (tripId, poi, day) => set((state) => ({
        trips: state.trips.map((t) => {
          if (t.id !== tripId) return t;
          const newDaysList = t.daysList ? [...t.daysList] : [];
          if (day !== undefined) {
            const dayIdx = newDaysList.findIndex((d) => d.day === day);
            if (dayIdx >= 0) {
              newDaysList[dayIdx] = {
                ...newDaysList[dayIdx],
                afternoon: [...(newDaysList[dayIdx].afternoon || []), poi],
              };
            } else {
              newDaysList.push({ day, afternoon: [poi] });
              newDaysList.sort((a, b) => a.day - b.day);
            }
          }
          return {
            ...t,
            pois: [...t.pois, poi],
            daysList: newDaysList,
            days: computeDays(newDaysList, t.days),
          };
        }),
      })),
      removePOIFromTrip: (tripId, poiId) => set((state) => {
        const trip = state.trips.find((t) => t.id === tripId);
        if (!trip) return state;
        const deletedPOI = trip.pois.find((p) => p.id === poiId);
        if (!deletedPOI) return state;
        return {
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            const newDaysList = (t.daysList || []).map((d) => ({
              ...d,
              morning: (d.morning || []).filter((p) => p.id !== poiId),
              afternoon: (d.afternoon || []).filter((p) => p.id !== poiId),
              evening: (d.evening || []).filter((p) => p.id !== poiId),
            }));
            return {
              ...t,
              pois: t.pois.filter((p) => p.id !== poiId),
              daysList: newDaysList,
              days: computeDays(newDaysList, t.days),
            };
          }),
          undoStack: [...state.undoStack, { type: 'removePOI', payload: { tripId, poi: deletedPOI } }],
        };
      }),
      movePOIToDay: (tripId, poiId, targetDay) => set((state) => ({
        trips: state.trips.map((t) => {
          if (t.id !== tripId) return t;
          const poi = t.pois.find((p) => p.id === poiId);
          if (!poi) return t;
          const newDaysList: DayScheduleSimple[] = (t.daysList || []).map((d) => ({
            day: d.day,
            morning: (d.morning || []).filter((p) => p.id !== poiId),
            afternoon: (d.afternoon || []).filter((p) => p.id !== poiId),
            evening: (d.evening || []).filter((p) => p.id !== poiId),
          }));
          const targetIdx = newDaysList.findIndex((d) => d.day === targetDay);
          if (targetIdx >= 0) {
            newDaysList[targetIdx] = {
              ...newDaysList[targetIdx],
              afternoon: [...(newDaysList[targetIdx].afternoon || []), poi],
            };
          } else {
            newDaysList.push({ day: targetDay, afternoon: [poi] });
            newDaysList.sort((a, b) => a.day - b.day);
          }
          return {
            ...t,
            daysList: newDaysList,
            days: computeDays(newDaysList, t.days),
          };
        }),
      })),
      addDayToTrip: (tripId) => set((state) => ({
        trips: state.trips.map((t) => {
          if (t.id !== tripId) return t;
          const nextDay = (t.days || 0) + 1;
          const newDaysList = t.daysList ? [...t.daysList] : [];
          if (!newDaysList.find((d) => d.day === nextDay)) {
            newDaysList.push({ day: nextDay });
            newDaysList.sort((a, b) => a.day - b.day);
          }
          return {
            ...t,
            days: nextDay,
            daysList: newDaysList,
          };
        }),
      })),
      removeDayFromTrip: (tripId, day) => set((state) => {
        const trip = state.trips.find((t) => t.id === tripId);
        if (!trip) return state;
        const deletedDay = (trip.daysList || []).find((d) => d.day === day);
        if (!deletedDay) return state;
        return {
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            const filteredList = (t.daysList || []).filter((d) => d.day !== day);
            const newDaysList = filteredList
              .sort((a, b) => a.day - b.day)
              .map((d, idx) => ({ ...d, day: idx + 1 }));
            return {
              ...t,
              days: newDaysList.length,
              daysList: newDaysList.length > 0 ? newDaysList : undefined,
            };
          }),
          undoStack: [...state.undoStack, { type: 'removeDay', payload: { tripId, day: deletedDay } }],
        };
      }),
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
          undoStack: [...state.undoStack, { type: 'removeExpense', payload: expense }],
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
      userProfile: {
        nickname: '旅行爱好者',
        bio: '世界那么大，一起去看看',
        avatar: '旅',
      },
      updateUserProfile: (updates) => set((state) => ({
        userProfile: { ...state.userProfile, ...updates },
      })),
      collaborators: [],
      addCollaborator: (collaborator) => set((state) => ({
        collaborators: [
          { ...collaborator, id: `col-${Date.now()}` },
          ...state.collaborators,
        ],
      })),
      removeCollaborator: (collaboratorId) => set((state) => ({
        collaborators: state.collaborators.filter((c) => c.id !== collaboratorId),
      })),
      updateCollaboratorRole: (collaboratorId, role) => set((state) => ({
        collaborators: state.collaborators.map((c) =>
          c.id === collaboratorId ? { ...c, role } : c
        ),
      })),
      undo: () => set((state) => {
        if (state.undoStack.length === 0) return state;
        const lastAction = state.undoStack[state.undoStack.length - 1];
        const newStack = state.undoStack.slice(0, -1);
        if (lastAction.type === 'removeTrip') {
          const trip = lastAction.payload as Trip;
          return {
            trips: [...state.trips, trip].sort((a, b) =>
              new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
            ),
            undoStack: newStack,
          };
        }
        if (lastAction.type === 'removePOI') {
          const { tripId, poi } = lastAction.payload as { tripId: string; poi: TripPOI };
          return {
            trips: state.trips.map((t) => {
              if (t.id !== tripId) return t;
              return { ...t, pois: [...t.pois, poi] };
            }),
            undoStack: newStack,
          };
        }
        if (lastAction.type === 'removeDay') {
          const { tripId, day } = lastAction.payload as { tripId: string; day: DayScheduleSimple };
          return {
            trips: state.trips.map((t) => {
              if (t.id !== tripId) return t;
              const newDaysList = [...(t.daysList || []), day].sort((a, b) => a.day - b.day);
              return { ...t, days: newDaysList.length, daysList: newDaysList };
            }),
            undoStack: newStack,
          };
        }
        if (lastAction.type === 'removeExpense') {
          const expense = lastAction.payload as Expense;
          const trip = state.trips.find((t) => t.id === expense.tripId);
          const newSpent = (trip?.spent || 0) + expense.amount;
          return {
            expenses: [expense, ...state.expenses],
            trips: state.trips.map((t) => t.id === expense.tripId ? { ...t, spent: newSpent } : t),
            undoStack: newStack,
          };
        }
        return state;
      }),
    }),
    {
      name: 'tuji-trip-storage',
    }
  )
);