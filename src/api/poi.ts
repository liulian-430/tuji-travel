import api from '@/utils/http';
import type { POI } from '@/data/mock';

export const poiApi = {
  list: (params?: { keyword?: string; city?: string; type?: string }) => 
    api.get<POI[]>('/pois', { params }),
  detail: (id: string) => api.get<POI>(`/pois/${id}`),
  search: (keyword: string) => api.get<POI[]>('/pois/search', { params: { keyword } }),
  recommend: (city?: string) => api.get<POI[]>('/pois/recommend', { params: { city } }),
};
