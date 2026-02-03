import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) {}

  async findAll(page = 1, limit = 10) {
    const cacheKey = `users_page_${page}_limit_${limit}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      cacheHits.inc();
      return cached;
    }

    cacheMisses.inc();
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    const result = { data, total, page, last_page: Math.ceil(total / limit) };
    await this.cacheManager.set(cacheKey, result, 300);
    return result;
  }
}