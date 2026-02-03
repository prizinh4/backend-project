import { DataSource } from 'typeorm';
import { User } from './users/users.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'postgres',
  database: process.env.DB_NAME || 'backend_project',
  entities: [User],
  synchronize: true, // dev only
});