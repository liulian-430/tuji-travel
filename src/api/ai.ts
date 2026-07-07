import api from '@/utils/http';

export interface AiTripItem {
  name: string;
  type: 'scenic' | 'food' | 'hotel' | 'transport';
  startTime: string;
  endTime: string;
  description?: string;
  estimatedCost?: number;
  address?: string;
}

export interface AiTripDay {
  day: number;
  date: string;
  items: AiTripItem[];
}

export interface GenerateTripParams {
  userInput?: string;
  destination?: string;
  days?: number;
  people?: number;
  budget?: number;
  startDate?: string;
  preferences?: {
    poisText?: string;
    foodsText?: string;
    hotelsText?: string;
  };
}

export const aiApi = {
  /**
   * 检查 AI 服务是否可用
   */
  isAvailable: () => api.get<{ available: boolean }>('/ai/available'),
  /**
   * 调用 AI 生成行程
   */
  generateTrip: (params: GenerateTripParams) => api.post<AiTripDay[]>('/ai/generate-trip', params),
};
