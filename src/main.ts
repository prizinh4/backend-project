import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import './metrics/prometheus';
import { AppModule } from './app.module';
import { httpRequestDuration, httpRequestTotal } from './metrics/prometheus';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const route = req.route?.path || req.path;
      httpRequestDuration.labels(req.method, route, res.statusCode).observe(duration);
      httpRequestTotal.labels(req.method, route, res.statusCode).inc();
    });
    next();
  });
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