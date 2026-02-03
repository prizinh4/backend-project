import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use((req, _res, next) => {
    const instance = process.env.HOSTNAME || 'unknown-instance';
    console.log(`[${instance}] ${req.method} ${req.url}`);
    next();
  });
  await app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap error:', err);
  process.exit(1);
});