import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface TripDay {
  day: number;
  date: string;
  items: TripItem[];
}

export interface TripItem {
  poiId?: string;
  name: string;
  type: 'scenic' | 'food' | 'hotel' | 'transport';
  startTime: string;
  endTime: string;
  description?: string;
  estimatedCost?: number;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface AIGenerateParams {
  userInput: string;
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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private readonly model: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('DOUBAO_API_KEY') || '';
    this.apiBaseUrl = this.configService.get('DOUBAO_API_BASE_URL') || 'https://ark.cn-beijing.volces.com/api/v3';
    // 兜底使用常见豆包端点 ID（用户也可在 .env 自定义）
    this.model = this.configService.get('DOUBAO_MODEL') || 'ep-20240620-xxxxx';
  }

  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * 调用豆包大模型生成行程
   */
  async generateTrip(params: AIGenerateParams): Promise<TripDay[]> {
    if (!this.isAvailable()) {
      this.logger.warn('豆包 API Key 未配置，使用模拟数据');
      return this.mockGenerate(params);
    }

    try {
      const prompt = this.buildPrompt(params);
      const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的旅行规划助手，擅长根据用户需求生成详细的旅行行程安排。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        this.logger.error(`豆包 API 调用失败: ${response.status} - ${errText}`);
        throw new Error(`豆包 API 调用失败: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      this.logger.log(`豆包 AI 返回内容长度: ${content.length}`);

      return this.parseTripResponse(content, params);
    } catch (error) {
      this.logger.error(`AI 生成行程失败: ${error.message}`);
      // 失败时返回模拟数据作为降级
      return this.mockGenerate(params);
    }
  }

  /**
   * 构建提示词
   */
  private buildPrompt(params: AIGenerateParams): string {
    const { userInput, destination, days, people, budget, startDate, preferences } = params;

    let prompt = `请帮我规划一次旅行，要求如下：\n\n`;

    if (userInput) {
      prompt += `【用户需求】\n${userInput}\n\n`;
    }

    if (destination) {
      prompt += `【目的地】\n${destination}\n\n`;
    }

    if (days) {
      prompt += `【行程天数】\n${days}天\n\n`;
    }

    if (people) {
      prompt += `【出行人数】\n${people}人\n\n`;
    }

    if (budget) {
      prompt += `【预算】\n${budget}元\n\n`;
    }

    if (startDate) {
      prompt += `【出发日期】\n${startDate}\n\n`;
    }

    if (preferences) {
      if (preferences.poisText) prompt += `【想去的景点】\n${preferences.poisText}\n\n`;
      if (preferences.foodsText) prompt += `【想吃的美食】\n${preferences.foodsText}\n\n`;
      if (preferences.hotelsText) prompt += `【住宿要求】\n${preferences.hotelsText}\n\n`;
    }

    prompt += `【输出要求】\n`;
    prompt += `1. 严格按照 JSON 数组格式输出\n`;
    prompt += `2. 每个元素代表一天的行程\n`;
    prompt += `3. 每天包含 2-4 个项目（景点/美食/住宿）\n`;
    prompt += `4. 每个项目包含：name（名称）、type（scenic/food/hotel）、startTime（如09:00）、endTime（如11:00）、description（简介）、estimatedCost（预计花费）\n`;
    prompt += `5. 行程安排要合理，时间不冲突，考虑景点距离和开放时间\n`;
    prompt += `6. 必须输出纯 JSON，不要包含任何 Markdown 代码块标记\n\n`;
    prompt += `【输出格式示例】\n`;
    prompt += `[{"day":1,"items":[{"name":"故宫","type":"scenic","startTime":"09:00","endTime":"12:00","description":"明清皇家宫殿","estimatedCost":60}]}]\n\n`;
    prompt += `请开始输出：`;

    return prompt;
  }

  /**
   * 解析 AI 返回的 JSON 内容
   */
  private parseTripResponse(content: string, params: AIGenerateParams): TripDay[] {
    try {
      // 清理可能包含的 Markdown 代码块标记
      let cleaned = content.trim();
      cleaned = cleaned.replace(/^```json\s*/i, '');
      cleaned = cleaned.replace(/^```\s*/, '');
      cleaned = cleaned.replace(/```\s*$/, '');
      cleaned = cleaned.replace(/`/g, '');
      cleaned = cleaned.trim();

      // 提取 JSON 数组
      const startIdx = cleaned.indexOf('[');
      const endIdx = cleaned.lastIndexOf(']');
      if (startIdx === -1 || endIdx === -1) {
        throw new Error('未找到 JSON 数组');
      }
      const jsonStr = cleaned.substring(startIdx, endIdx + 1);

      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) {
        throw new Error('解析结果不是数组');
      }

      const days = params.days || parsed.length || 2;
      const startDate = params.startDate || new Date().toISOString().split('T')[0];

      return parsed.slice(0, days).map((day: any, idx: number) => ({
        day: day.day || idx + 1,
        date: this.calcDate(startDate, idx),
        items: (day.items || []).map((item: any) => ({
          name: item.name || '',
          type: ['scenic', 'food', 'hotel', 'transport'].includes(item.type) ? item.type : 'scenic',
          startTime: item.startTime || '09:00',
          endTime: item.endTime || '11:00',
          description: item.description || '',
          estimatedCost: Number(item.estimatedCost) || 0,
        })),
      }));
    } catch (e) {
      this.logger.error(`解析 AI 响应失败: ${e.message}, 原始内容: ${content.substring(0, 200)}`);
      return this.mockGenerate(params);
    }
  }

  /**
   * 计算日期
   */
  private calcDate(startDate: string, offset: number): string {
    const d = new Date(startDate);
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }

  /**
   * 降级使用的模拟数据
   */
  private mockGenerate(params: AIGenerateParams): TripDay[] {
    const days = params.days || 2;
    const startDate = params.startDate || new Date().toISOString().split('T')[0];
    const dest = params.destination || '北京';

    const defaultItems = [
      { name: `${dest}博物馆`, type: 'scenic' as const, startTime: '09:00', endTime: '11:30', description: `了解${dest}的历史文化`, estimatedCost: 50 },
      { name: `老字号餐厅`, type: 'food' as const, startTime: '12:00', endTime: '13:30', description: '品尝当地特色美食', estimatedCost: 100 },
      { name: `${dest}公园`, type: 'scenic' as const, startTime: '14:30', endTime: '17:00', description: '漫步城市公园', estimatedCost: 0 },
      { name: '市中心酒店', type: 'hotel' as const, startTime: '18:00', endTime: '19:00', description: '舒适住宿', estimatedCost: 400 },
    ];

    return Array.from({ length: days }, (_, idx) => ({
      day: idx + 1,
      date: this.calcDate(startDate, idx),
      items: defaultItems.slice(0, idx === days - 1 ? 3 : 4),
    }));
  }
}
