import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { showToast } from '@/store/useToastStore';
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response.data;
    if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
      if (data.code === 200) {
        return data.data;
      }
      if (!(response.config as any).silentError) {
        showToast(data.message || '请求失败', 'error');
      }
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    return data;
  },
  (error: AxiosError) => {
    const config = error.config as any;
    const silentError = config?.silentError;
    
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    } else if (!silentError) {
      if (error.response?.status === 403) {
        showToast('没有权限', 'error');
      } else if (error.response?.status === 500) {
        showToast('服务器错误', 'error');
      } else {
        const message = (error.response?.data as any)?.message || error.message || '请求失败';
        showToast(message, 'error');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
