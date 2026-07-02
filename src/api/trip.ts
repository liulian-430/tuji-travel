import api from '@/utils/http';
import type { Trip, TripPOI, DayScheduleSimple } from '@/data/mock';

export const tripApi = {
  list: () => api.get<Trip[]>('/trips'),
  detail: (id: string) => api.get<Trip>(`/trips/${id}`),
  create: (data: Partial<Trip>) => api.post<Trip>('/trips', data),
  update: (id: string, data: Partial<Trip>) => api.put<Trip>(`/trips/${id}`, data),
  delete: (id: string) => api.delete(`/trips/${id}`),
  addPOI: (tripId: string, poi: TripPOI) => api.post(`/trips/${tripId}/pois`, poi),
  removePOI: (tripId: string, poiId: string) => api.delete(`/trips/${tripId}/pois/${poiId}`),
  movePOI: (tripId: string, poiId: string, day: number) => 
    api.patch(`/trips/${tripId}/pois/${poiId}/day`, { day }),
  reorderPOIs: (tripId: string, day: number, fromIndex: number, toIndex: number) =>
    api.patch(`/trips/${tripId}/days/${day}/pois/reorder`, { fromIndex, toIndex }),
  addDay: (tripId: string) => api.post(`/trips/${tripId}/days`),
  removeDay: (tripId: string, day: number) => api.delete(`/trips/${tripId}/days/${day}`),
};
