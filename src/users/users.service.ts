import { Injectable } from '@nestjs/common';
import { AppDataSource } from '../ormconfig';
import { User } from './users.entity';
@Injectable()
export class UsersService {
  private userRepository = AppDataSource.getRepository(User);

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, last_page: Math.ceil(total / limit) };
  }
}
