import { Body, Controller, Post, Get } from '@nestjs/common';
import { AiService, AIGenerateParams, TripDay } from './ai.service';

export interface GenerateTripDto {
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

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * 检查 AI 服务是否可用
   */
  @Get('available')
  available() {
    return {
      available: this.aiService.isAvailable(),
    };
  }

  /**
   * AI 生成行程
   */
  @Post('generate-trip')
  async generateTrip(@Body() dto: GenerateTripDto): Promise<{ code: number; message: string; data?: TripDay[] }> {
    try {
      const trips = await this.aiService.generateTrip(dto as AIGenerateParams);
      return {
        code: 200,
        message: 'success',
        data: trips,
      };
    } catch (error) {
      return {
        code: 500,
        message: error.message || 'AI 生成行程失败',
      };
    }
  }
}
