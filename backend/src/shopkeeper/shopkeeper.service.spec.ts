import { Test, TestingModule } from '@nestjs/testing';
import { ShopkeeperService } from './shopkeeper.service';

describe('ShopkeeperService', () => {
  let service: ShopkeeperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopkeeperService],
    }).compile();

    service = module.get<ShopkeeperService>(ShopkeeperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
