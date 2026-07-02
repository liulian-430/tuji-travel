import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { showToast } from '@/store/useToastStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
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
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      showToast('没有权限', 'error');
    } else if (error.response?.status === 500) {
      showToast('服务器错误', 'error');
    } else {
      const message = (error.response?.data as any)?.message || error.message || '请求失败';
      showToast(message, 'error');
    }
    return Promise.reject(error);
  }
);

export default api;
