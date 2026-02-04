import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DataSource } from 'typeorm';

// Mock repository
const mockRepo = {
  findAndCount: jest.fn().mockResolvedValue([[{ id: 1, name: 'Test User' }], 1]),
};

// Mock cache
const mockCache = {
  get: jest.fn().mockResolvedValue(undefined),
  set: jest.fn(),
};

// Mock DataSource with QueryBuilder
const mockQueryBuilder = {
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[{ id: 1, name: 'Test User' }], 1]),
};

const mockDataSource = {
  getRepository: jest.fn().mockReturnValue({
    createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
  }),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: 'CACHE_MANAGER', useValue: mockCache },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  it('should return users with pagination', async () => {
    const result: any = await service.findAll(1, 10);
    expect(result.data[0].name).toBe('Test User');
    expect(result.total).toBe(1);
  });
});