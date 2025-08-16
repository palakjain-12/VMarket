import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: [
      configService.get('cors.origin'),
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  const port = configService.get<number>('port') || 3001;
  const nodeEnv = configService.get<string>('nodeEnv');

  await app.listen(port);
  console.log(`VMarket API is running on: http://localhost:${port}`);
  console.log(`Environment: ${nodeEnv}`);
}
bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
