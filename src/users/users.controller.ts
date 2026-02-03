import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationQueryDto } from './dto/pagination-query.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query.page, query.limit);
  }
}
