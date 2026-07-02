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
    nights?: number;
    people?: number;
    budget?: number;
    schedules: DayScheduleSimple[];
    pois: TripPOI[];
  } | null;
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
  addTrip: (trip: Trip) => void;
  removeTrip: (tripId: string) => void;
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
            days: day !== undefined
              ? Math.max(t.days, day)
              : t.days,
          };
        }),
      })),
      removePOIFromTrip: (tripId, poiId) => set((state) => ({
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
          };
        }),
      })),
      movePOIToDay: (tripId, poiId, targetDay) => set((state) => ({
        trips: state.trips.map((t) => {
          if (t.id !== tripId) return t;
          const poi = t.pois.find((p) => p.id === poiId);
          if (!poi) return t;
          let newDaysList: DayScheduleSimple[] = (t.daysList || []).map((d) => ({
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
          newDaysList = newDaysList.filter(
            (d) => (d.morning?.length || 0) + (d.afternoon?.length || 0) + (d.evening?.length || 0) > 0
          );
          const maxDay = newDaysList.length > 0 ? Math.max(...newDaysList.map((d) => d.day)) : t.days;
          return {
            ...t,
            daysList: newDaysList,
            days: Math.max(t.days, maxDay),
          };
        }),
      })),
      addDayToTrip: (tripId) => set((state) => ({
        trips: state.trips.map((t) => {
          if (t.id !== tripId) return t;
          const nextDay = t.days + 1;
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
      removeDayFromTrip: (tripId, day) => set((state) => ({
        trips: state.trips.map((t) => {
          if (t.id !== tripId) return t;
          const newDaysList = (t.daysList || []).filter((d) => d.day !== day);
          const poisInDay = (t.daysList || [])
            .find((d) => d.day === day)
            ?.afternoon || [];
          const newPois = t.pois.filter(
            (p) => !poisInDay.find((pp) => pp.id === p.id)
          );
          return {
            ...t,
            pois: newPois,
            daysList: newDaysList,
          };
        }),
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
    }),
    {
      name: 'tuji-trip-storage',
    }
  )
);
