import { NestFactory } from '@nestjs/core';
import { ValidationPipe, LogLevel } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  console.log('🚀 正在启动后端服务...');
  console.log('📍 PORT:', process.env.PORT || 3000);
  console.log('📦 NODE_ENV:', process.env.NODE_ENV);
  console.log('💾 DB_TYPE:', process.env.DB_TYPE || 'sqlite');

  const logLevels: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];

  try {
    console.log('🔧 创建 Nest 应用...');
    const app = await NestFactory.create(AppModule, { logger: logLevels });
    console.log('✅ Nest 应用创建成功');

    console.log('🔧 配置 CORS...');
    app.enableCors({
      origin: true,
      credentials: true,
    });

    console.log('🔧 配置全局管道...');
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
    }));

    console.log('🔧 设置全局前缀...');
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    console.log('🔧 启动监听端口:', port);
    await app.listen(port, '0.0.0.0');
    console.log('✅ 后端服务已启动，监听端口:', port);
    console.log('🌐 服务地址:', `http://0.0.0.0:${port}`);
  } catch (err: any) {
    console.error('❌ 服务启动失败:', err?.message || err);
    console.error('📋 错误详情:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
    console.error('📋 错误堆栈:', err?.stack);
    process.exit(1);
  }
}

bootstrap().catch((err: any) => {
  console.error('💥 未捕获的启动错误:', err?.message || err);
  console.error('📋 错误堆栈:', err?.stack);
  process.exit(1);
});
