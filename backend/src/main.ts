import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    logger.log('Starting application...');
    logger.log('PORT: ' + (process.env.PORT || 3000));

    const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log', 'debug', 'verbose'] });

    app.enableCors({ origin: true, credentials: true });

    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

    app.setGlobalPrefix('api');

    const port = process.env.PORT || 3000;
    logger.log('Listening on port: ' + port);
    await app.listen(port, '0.0.0.0');
    logger.log('Application started successfully on port ' + port);
  } catch (err: any) {
    logger.error('Failed to start application: ' + (err?.message || err));
    logger.error(err?.stack);
    process.exit(1);
  }
}

bootstrap().catch((err: any) => {
  const logger = new Logger('Bootstrap');
  logger.error('Unhandled error: ' + (err?.message || err));
  process.exit(1);
});
