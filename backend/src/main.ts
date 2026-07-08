import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 正在启动后端服务...');
  console.log('📍 PORT:', process.env.PORT || 3000);

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`✅ 后端服务已启动，监听端口: ${port}`);
}

bootstrap().catch((err) => {
  console.error('❌ 服务启动失败:', err);
  process.exit(1);
});
