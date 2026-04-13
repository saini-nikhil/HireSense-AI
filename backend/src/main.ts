import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;

  await app.listen(port);
  // ✅ LOG SERVER START
  const logger = new Logger('Bootstrap');
  console.log(`🚀 Server running on http://localhost:${port}`);
}
bootstrap();
