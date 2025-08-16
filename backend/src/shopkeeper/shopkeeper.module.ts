import { Module } from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { ShopkeeperController } from './shopkeeper.controller';

@Module({
  controllers: [ShopkeeperController],
  providers: [ShopkeeperService],
  exports: [ShopkeeperService],
})
export class ShopkeeperModule {}
