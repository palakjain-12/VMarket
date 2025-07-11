import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShopkeeperService } from './shopkeeper.service';
import { CreateShopkeeperDto } from './dto/create-shopkeeper.dto';
import { UpdateShopkeeperDto } from './dto/update-shopkeeper.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('shopkeepers')
@UseGuards(JwtAuthGuard)
export class ShopkeeperController {
  constructor(private readonly shopkeeperService: ShopkeeperService) {}

  @Public()
  @Post()
  create(@Body() createShopkeeperDto: CreateShopkeeperDto) {
    return this.shopkeeperService.create(createShopkeeperDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.shopkeeperService.findAll(paginationDto);
  }

  @Get('me')
  getMyProfile(@CurrentUser() user: any) {
    return this.shopkeeperService.findOne(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shopkeeperService.findOne(id);
  }

  @Patch('me')
  updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateShopkeeperDto: UpdateShopkeeperDto,
  ) {
    return this.shopkeeperService.update(user.id, updateShopkeeperDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateShopkeeperDto: UpdateShopkeeperDto,
  ) {
    return this.shopkeeperService.update(id, updateShopkeeperDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopkeeperService.remove(id);
  }
}