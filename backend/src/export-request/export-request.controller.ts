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
  Request,
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

@Controller('export-requests')
@UseGuards(JwtAuthGuard)
export class ExportRequestController {
  constructor(private readonly exportRequestService: ExportRequestService) {}

  @Post()
  async create(@Body() createExportRequestDto: CreateExportRequestDto, @Request() req) {
    return this.exportRequestService.create(createExportRequestDto, req.user.sub);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.exportRequestService.findAll(paginationDto);
  }

  @Get('my-requests')
  async findMyRequests(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.exportRequestService.findMyRequests(req.user.sub, paginationDto);
  }

  @Get('pending-for-me')
  async findPendingForMe(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.exportRequestService.findRequestsForMe(req.user.sub, paginationDto);
  }

  // ADD THESE MISSING ENDPOINTS FOR FRONTEND COMPATIBILITY
  @Get('received')
  async getReceived(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.exportRequestService.findRequestsForMe(req.user.sub, paginationDto);
  }

  @Get('sent')
  async getSent(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.exportRequestService.findMyRequests(req.user.sub, paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const exportRequest = await this.exportRequestService.findOne(id);
    if (
      exportRequest.fromShopId !== req.user.sub &&
      exportRequest.toShopId !== req.user.sub
    ) {
      throw new ForbiddenException('You are not authorized to view this export request');
    }
    return exportRequest;
  }

  @Patch(':id/accept')
  async acceptRequest(
    @Param('id') id: string,
    @Request() req,
    @Body() acceptDto: AcceptExportRequestDto,
  ) {
    return this.exportRequestService.acceptRequest(id, req.user.sub, acceptDto);
  }

  @Patch(':id/reject')
  async rejectRequest(
    @Param('id') id: string,
    @Request() req,
    @Body() rejectDto: RejectExportRequestDto,
  ) {
    return this.exportRequestService.rejectRequest(id, req.user.sub, rejectDto);
  }

  @Patch(':id/cancel')
  async cancelRequest(@Param('id') id: string, @Request() req) {
    return this.exportRequestService.cancelRequest(id, req.user.sub);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const exportRequest = await this.exportRequestService.findOne(id);

    if (exportRequest.fromShopId !== req.user.sub) {
      throw new ForbiddenException('You can only delete your own export requests');
    }

    if (exportRequest.status !== ExportRequestStatus.PENDING) {
      throw new BadRequestException('You can only delete pending export requests');
    }

    return this.exportRequestService.remove(id);
  }
}