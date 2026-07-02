import api from '@/utils/http';

export interface LoginData {
  phone: string;
  code: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
}

export const userApi = {
  login: (data: LoginData) => api.post<{ token: string; user: UserProfile }>('/auth/login', data),
  sendCode: (phone: string) => api.post('/auth/send-code', { phone }),
  profile: () => api.get<UserProfile>('/user/profile'),
  updateProfile: (data: Partial<UserProfile>) => api.put('/user/profile', data),
};
