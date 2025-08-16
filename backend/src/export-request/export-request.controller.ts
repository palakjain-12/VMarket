// backend/src/export-request/export-request.controller.ts - Add missing endpoints
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ExportRequestService } from './export-request.service';
import { CreateExportRequestDto } from './dto/create-export-request.dto';
import { AcceptExportRequestDto } from './dto/accept-export-request.dto';
import { RejectExportRequestDto } from './dto/reject-export-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ExportRequestStatus } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

interface JwtPayload {
  email: string;
  sub: number;
  shopName: string;
}

@Controller('export-requests')
@UseGuards(JwtAuthGuard)
export class ExportRequestController {
  constructor(private readonly exportRequestService: ExportRequestService) {}

  @Post()
  async create(
    @Body() createExportRequestDto: CreateExportRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.exportRequestService.create(
      createExportRequestDto,
      user.sub.toString(),
    );
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.exportRequestService.findAll(paginationDto);
  }

  @Get('my-requests')
  async findMyRequests(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.exportRequestService.findMyRequests(
      user.sub.toString(),
      paginationDto,
    );
  }

  @Get('pending-for-me')
  async findPendingForMe(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.exportRequestService.findRequestsForMe(
      user.sub.toString(),
      paginationDto,
    );
  }

  // ADD THESE MISSING ENDPOINTS FOR FRONTEND COMPATIBILITY
  @Get('received')
  async getReceived(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.exportRequestService.findRequestsForMe(
      user.sub.toString(),
      paginationDto,
    );
  }

  @Get('sent')
  async getSent(
    @CurrentUser() user: JwtPayload,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.exportRequestService.findMyRequests(
      user.sub.toString(),
      paginationDto,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const exportRequest = await this.exportRequestService.findOne(id);
    if (
      exportRequest.fromShopId !== user.sub.toString() &&
      exportRequest.toShopId !== user.sub.toString()
    ) {
      throw new ForbiddenException(
        'You are not authorized to view this export request',
      );
    }
    return exportRequest;
  }

  @Patch(':id/accept')
  async acceptRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() acceptDto: AcceptExportRequestDto,
  ) {
    return this.exportRequestService.acceptRequest(
      id,
      user.sub.toString(),
      acceptDto,
    );
  }

  @Patch(':id/reject')
  async rejectRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() rejectDto: RejectExportRequestDto,
  ) {
    return this.exportRequestService.rejectRequest(
      id,
      user.sub.toString(),
      rejectDto,
    );
  }

  @Patch(':id/cancel')
  async cancelRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.exportRequestService.cancelRequest(id, user.sub.toString());
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const exportRequest = await this.exportRequestService.findOne(id);

    if (exportRequest.fromShopId !== user.sub.toString()) {
      throw new ForbiddenException(
        'You can only delete your own export requests',
      );
    }

    if (exportRequest.status !== ExportRequestStatus.PENDING) {
      throw new BadRequestException(
        'You can only delete pending export requests',
      );
    }

    return this.exportRequestService.remove(id);
  }
}
