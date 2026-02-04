import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from './user.entity';
import { cacheHits, cacheMisses } from '../metrics/prometheus';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private dataSource: DataSource,
  ) {}

  async findAll(page = 1, limit = 10) {
    const cacheKey = `users_page_${page}_limit_${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      cacheHits.inc();
      return cached;
    }

    cacheMisses.inc();
    
    // Force read from replica by using getManager with read replication
    const slaveQueryRunner = this.dataSource.createQueryRunner('slave');
    
    try {
      await slaveQueryRunner.connect();
      const [data, total] = await slaveQueryRunner.manager
        .getRepository(User)
        .createQueryBuilder('user')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();
      
      const result = { data, total, page, last_page: Math.ceil(total / limit) };
      await this.cacheManager.set(cacheKey, result, 300);
      return result;
    } finally {
      await slaveQueryRunner.release();
    }
  }
}