import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TripPOI, DayScheduleSimple } from '@/data/mock';
import { tripApi } from '@/api/trip';

function isLoggedIn(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}

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

interface BackendTripPoi {
  id: string;
  name: string;
  type: string;
  duration: string;
  price: number;
  image: string;
  latitude?: number;
  longitude?: number;
  day: number;
  order: number;
}

interface BackendTrip {
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
  pois: BackendTripPoi[];
}

function backendTripToFrontend(backendTrip: BackendTrip): Trip {
  const pois: TripPOI[] = backendTrip.pois.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type as 'scenic' | 'food' | 'hotel' | 'shopping',
    duration: p.duration,
    price: Number(p.price),
    image: p.image,
    latitude: p.latitude ? Number(p.latitude) : undefined,
    longitude: p.longitude ? Number(p.longitude) : undefined,
  }));

  const daysMap = new Map<number, TripPOI[]>();
  const sortedPois = [...backendTrip.pois].sort((a, b) => a.order - b.order);
  for (const poi of sortedPois) {
    if (!daysMap.has(poi.day)) {
      daysMap.set(poi.day, []);
    }
    daysMap.get(poi.day)!.push({
      id: poi.id,
      name: poi.name,
      type: poi.type as 'scenic' | 'food' | 'hotel' | 'shopping',
      duration: poi.duration,
      price: Number(poi.price),
      image: poi.image,
      latitude: poi.latitude ? Number(poi.latitude) : undefined,
      longitude: poi.longitude ? Number(poi.longitude) : undefined,
    });
  }

  const daysList: DayScheduleSimple[] = [];
  for (let i = 1; i <= (backendTrip.days || 1); i++) {
    const dayPois = daysMap.get(i) || [];
    const mid = Math.ceil(dayPois.length / 2);
    daysList.push({
      day: i,
      morning: dayPois.slice(0, mid),
      afternoon: dayPois.slice(mid),
    });
  }

  return {
    id: backendTrip.id,
    name: backendTrip.name,
    destination: backendTrip.destination,
    days: backendTrip.days,
    nights: backendTrip.nights,
    people: backendTrip.people,
    startDate: backendTrip.startDate,
    status: backendTrip.status,
    coverImage: backendTrip.coverImage,
    createdAt: backendTrip.createdAt,
    budget: backendTrip.budget ? Number(backendTrip.budget) : undefined,
    spent: backendTrip.spent ? Number(backendTrip.spent) : undefined,
    pois,
    daysList,
  };
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
  loading: boolean;
  loadTrips: () => Promise<void>;
  loadTripDetail: (tripId: string) => Promise<Trip | null>;
  createTrip: (trip: Partial<Trip> & { name: string; destination: string; days: number; startDate: string; schedules?: DayScheduleSimple[]; pois?: TripPOI[] }) => Promise<Trip>;
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
  removeTrip: (tripId: string) => Promise<void>;
  undo: () => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  addPOIToTrip: (tripId: string, poi: TripPOI, day?: number) => Promise<void>;
  removePOIFromTrip: (tripId: string, poiId: string) => Promise<void>;
  movePOIToDay: (tripId: string, poiId: string, targetDay: number) => Promise<void>;
  reorderPoisInDay: (tripId: string, day: number, fromIndex: number, toIndex: number) => void;
  addDayToTrip: (tripId: string) => Promise<void>;
  removeDayFromTrip: (tripId: string, day: number) => Promise<void>;
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
    (set, get) => ({
      trips: [],
      currentTripId: null,
      expenses: [],
      budgets: [],
      favoritePOIs: [],
      visitedCities: [],
      pendingTrip: null,
      undoStack: [],
      loading: false,

      loadTrips: async () => {
        if (!isLoggedIn()) return;
        set({ loading: true });
        try {
          const trips = await tripApi.list();
          const converted = trips.map(backendTripToFrontend);
          set({ trips: converted });
        } catch (e) {
          console.error('加载行程失败:', e);
        } finally {
          set({ loading: false });
        }
      },

      loadTripDetail: async (tripId: string) => {
        if (!isLoggedIn()) return null;
        try {
          const trip = await tripApi.detail(tripId);
          const converted = backendTripToFrontend(trip as any);
          set((state) => ({
            trips: state.trips.map((t) => (t.id === tripId ? converted : t)),
          }));
          return converted;
        } catch (e) {
          console.error('加载行程详情失败:', e);
          return null;
        }
      },

      createTrip: async (tripData) => {
        const { pois, schedules, ...baseData } = tripData as any;
        
        const createLocalTrip = (): Trip => ({
          id: `trip-${Date.now()}`,
          name: baseData.name,
          destination: baseData.destination,
          days: baseData.days,
          nights: baseData.nights,
          people: baseData.people,
          startDate: baseData.startDate,
          status: baseData.status || 'planning',
          budget: baseData.budget,
          spent: baseData.spent || 0,
          coverImage: baseData.coverImage,
          pois: pois || [],
          daysList: schedules,
          createdAt: new Date().toISOString(),
        });

        if (!isLoggedIn()) {
          const localTrip = createLocalTrip();
          set((state) => ({
            trips: [localTrip, ...state.trips],
            currentTripId: state.currentTripId || localTrip.id,
          }));
          return localTrip;
        }

        try {
          const created = await tripApi.create(baseData);
          
          if (schedules && schedules.length > 0) {
            for (const daySchedule of schedules) {
              const allPois = [...(daySchedule.morning || []), ...(daySchedule.afternoon || []), ...(daySchedule.evening || [])];
              for (const poi of allPois) {
                await tripApi.addPOI(created.id, { ...poi, day: daySchedule.day } as any);
              }
            }
          } else if (pois && pois.length > 0) {
            for (let i = 0; i < pois.length; i++) {
              const poi = pois[i];
              const day = poi.day || Math.floor(i / 3) + 1;
              await tripApi.addPOI(created.id, { ...poi, day } as any);
            }
          }

          const tripWithPois = await tripApi.detail(created.id);
          const finalConverted = backendTripToFrontend(tripWithPois as any);
          
          set((state) => ({
            trips: [finalConverted, ...state.trips],
            currentTripId: state.currentTripId || finalConverted.id,
          }));
          return finalConverted;
        } catch (e) {
          console.error('创建行程失败，使用本地模式:', e);
          const localTrip = createLocalTrip();
          set((state) => ({
            trips: [localTrip, ...state.trips],
            currentTripId: state.currentTripId || localTrip.id,
          }));
          return localTrip;
        }
      },

      setPendingTrip: (trip) => set({ pendingTrip: trip }),
      clearPendingTrip: () => set({ pendingTrip: null }),
      setCurrentTrip: (tripId) => set({ currentTripId: tripId }),
      addTrip: (trip) => set((state) => ({ trips: [trip, ...state.trips], currentTripId: state.currentTripId || trip.id })),
      removeTrip: async (tripId) => {
        const deletedTrip = get().trips.find((t) => t.id === tripId);
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== tripId),
          undoStack: deletedTrip
            ? [...state.undoStack, { type: 'removeTrip', payload: deletedTrip }]
            : state.undoStack,
        }));
        if (!isLoggedIn()) return;
        try {
          await tripApi.delete(tripId);
        } catch (e) {
          if (deletedTrip) {
            set((state) => ({
              trips: [...state.trips, deletedTrip].sort((a, b) =>
                new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
              ),
            }));
          }
          throw e;
        }
      },
      updateTrip: async (tripId, updates) => {
        const oldTrip = get().trips.find((t) => t.id === tripId);
        set((state) => ({
          trips: state.trips.map((t) => (t.id === tripId ? { ...t, ...updates } : t)),
        }));
        if (!isLoggedIn()) return;
        try {
          await tripApi.update(tripId, updates);
        } catch (e) {
          if (oldTrip) {
            set((state) => ({
              trips: state.trips.map((t) => (t.id === tripId ? oldTrip : t)),
            }));
          }
          throw e;
        }
      },
      addPOIToTrip: async (tripId, poi, day = 1) => {
        set((state) => ({
          trips: state.trips.map((t) => {
            if (t.id !== tripId) return t;
            const newDaysList = t.daysList ? [...t.daysList] : [];
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
            return {
              ...t,
              pois: [...t.pois, poi],
              daysList: newDaysList,
              days: computeDays(newDaysList, t.days),
            };
          }),
        }));
        if (!isLoggedIn()) return;
        try {
          await tripApi.addPOI(tripId, { ...poi, day } as any);
        } catch (e) {
          set((state) => ({
            trips: state.trips.map((t) => {
              if (t.id !== tripId) return t;
              return {
                ...t,
                pois: t.pois.filter((p) => p.id !== poi.id),
                daysList: (t.daysList || []).map((d) => ({
                  ...d,
                  morning: (d.morning || []).filter((p) => p.id !== poi.id),
                  afternoon: (d.afternoon || []).filter((p) => p.id !== poi.id),
                  evening: (d.evening || []).filter((p) => p.id !== poi.id),
                })),
              };
            }),
          }));
          throw e;
        }
      },
      removePOIFromTrip: async (tripId, poiId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        const deletedPOI = trip?.pois.find((p) => p.id === poiId);
        set((state) => {
          const trip = state.trips.find((t) => t.id === tripId);
          if (!trip) return state;
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
            undoStack: deletedPOI
              ? [...state.undoStack, { type: 'removePOI', payload: { tripId, poi: deletedPOI } }]
              : state.undoStack,
          };
        });
        if (!isLoggedIn()) return;
        try {
          await tripApi.removePOI(tripId, poiId);
        } catch (e) {
          throw e;
        }
      },
      movePOIToDay: async (tripId, poiId, targetDay) => {
        const originalState = get().trips.find((t) => t.id === tripId);
        set((state) => ({
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
        }));
        if (!isLoggedIn()) return;
        try {
          await tripApi.movePOI(tripId, poiId, targetDay);
        } catch (e) {
          if (originalState) {
            set((state) => ({
              trips: state.trips.map((t) => (t.id === tripId ? originalState : t)),
            }));
          }
          throw e;
        }
      },
      reorderPoisInDay: (tripId, day, fromIndex, toIndex) => set((state) => ({
        trips: state.trips.map((t) => {
          if (t.id !== tripId) return t;
          const newDaysList = (t.daysList || []).map((d) => {
            if (d.day !== day) return d;
            const allPois = [...(d.morning || []), ...(d.afternoon || []), ...(d.evening || [])];
            if (fromIndex < 0 || fromIndex >= allPois.length || toIndex < 0 || toIndex >= allPois.length) {
              return d;
            }
            const [moved] = allPois.splice(fromIndex, 1);
            allPois.splice(toIndex, 0, moved);
            return { ...d, afternoon: allPois, morning: [], evening: [] };
          });
          return { ...t, daysList: newDaysList };
        }),
      })),
      addDayToTrip: async (tripId) => {
        const originalTrip = get().trips.find((t) => t.id === tripId);
        set((state) => ({
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
        }));
        if (!isLoggedIn()) return;
        try {
          await tripApi.addDay(tripId);
        } catch (e) {
          if (originalTrip) {
            set((state) => ({
              trips: state.trips.map((t) => (t.id === tripId ? originalTrip : t)),
            }));
          }
          throw e;
        }
      },
      removeDayFromTrip: async (tripId, day) => {
        const originalTrip = get().trips.find((t) => t.id === tripId);
        const deletedDay = (originalTrip?.daysList || []).find((d) => d.day === day);
        set((state) => {
          const trip = state.trips.find((t) => t.id === tripId);
          if (!trip) return state;
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
            undoStack: deletedDay
              ? [...state.undoStack, { type: 'removeDay', payload: { tripId, day: deletedDay } }]
              : state.undoStack,
          };
        });
        if (!isLoggedIn()) return;
        try {
          await tripApi.removeDay(tripId, day);
        } catch (e) {
          throw e;
        }
      },
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