import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './ormconfig';

async function bootstrap() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
    console.log('Database initialized');
  }

  const app = await NestFactory.create(AppModule);
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