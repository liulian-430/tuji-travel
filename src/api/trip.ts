import api from '@/utils/http';
import type { Trip, TripPOI } from '@/data/mock';

export interface CreateTripPOIData extends TripPOI {
  day: number;
}

const silentConfig = { silentError: true } as any;

export const tripApi = {
  list: () => (api.get('/trips', silentConfig) as unknown as Promise<any[]>),
  detail: (id: string) => (api.get(`/trips/${id}`, silentConfig) as unknown as Promise<any>),
  create: (data: Partial<Trip> & { name: string; destination: string; days: number; startDate: string }) => 
    (api.post('/trips', data, silentConfig) as unknown as Promise<any>),
  update: (id: string, data: Partial<Trip>) => (api.put(`/trips/${id}`, data, silentConfig) as unknown as Promise<any>),
  delete: (id: string) => (api.delete(`/trips/${id}`, silentConfig) as unknown as Promise<void>),
  addPOI: (tripId: string, poi: CreateTripPOIData) => (api.post(`/trips/${tripId}/pois`, poi, silentConfig) as unknown as Promise<any>),
  removePOI: (tripId: string, poiId: string) => (api.delete(`/trips/${tripId}/pois/${poiId}`, silentConfig) as unknown as Promise<void>),
  movePOI: (tripId: string, poiId: string, day: number) => 
    (api.patch(`/trips/${tripId}/pois/${poiId}/day`, { day }, silentConfig) as unknown as Promise<any>),
  reorderPOIs: (tripId: string, day: number, fromIndex: number, toIndex: number) =>
    (api.patch(`/trips/${tripId}/days/${day}/pois/reorder`, { fromIndex, toIndex }, silentConfig) as unknown as Promise<any[]>),
  addDay: (tripId: string) => (api.post(`/trips/${tripId}/days`, null, silentConfig) as unknown as Promise<any>),
  removeDay: (tripId: string, day: number) => (api.delete(`/trips/${tripId}/days/${day}`, silentConfig) as unknown as Promise<any>),
};
