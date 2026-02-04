import { DataSourceOptions } from 'typeorm';
import { User } from './users/user.entity';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  replication: {
    master: {
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'backend_project',
    },
    slaves: [
      {
        host: process.env.DB_REPLICA_HOST || process.env.DB_HOST || 'localhost',
        port: 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'backend_project',
      },
    ],
  },
  entities: [User],
  synchronize: process.env.APP_INSTANCE === '1' || !process.env.APP_INSTANCE,
};
