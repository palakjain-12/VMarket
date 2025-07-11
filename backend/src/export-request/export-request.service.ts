// backend/src/export-request/export-request.service.ts
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExportRequestDto } from './dto/create-export-request.dto';
import { AcceptExportRequestDto } from './dto/accept-export-request.dto';
import { RejectExportRequestDto } from './dto/reject-export-request.dto';
import { ExportRequest, ExportRequestStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ExportRequestService {
  constructor(private prisma: PrismaService) {}

  async create(createExportRequestDto: CreateExportRequestDto, fromShopId: string): Promise<ExportRequest> {
    const { productId, toShopId, quantity, message } = createExportRequestDto;

    // Validate product exists and belongs to the requesting shop
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { shopkeeper: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.shopkeeperId !== fromShopId) {
      throw new ForbiddenException('You can only export your own products');
    }

    // Check if product has sufficient quantity
    if (product.quantity < quantity) {
      throw new BadRequestException(`Insufficient quantity. Available: ${product.quantity}, Requested: ${quantity}`);
    }

    // Check if target shop exists
    const targetShop = await this.prisma.shopkeeper.findUnique({
      where: { id: toShopId },
    });

    if (!targetShop) {
      throw new NotFoundException('Target shop not found');
    }

    // Cannot export to self
    if (fromShopId === toShopId) {
      throw new BadRequestException('Cannot export to your own shop');
    }

    // Check if there's already a pending request for this product to the same shop
    const existingRequest = await this.prisma.exportRequest.findFirst({
      where: {
        productId,
        fromShopId,
        toShopId,
        status: ExportRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new BadRequestException('There is already a pending export request for this product to the same shop');
    }

    return this.prisma.exportRequest.create({
      data: {
        productId,
        fromShopId,
        toShopId,
        quantity,
        message,
      },
      include: {
        product: {
          include: {
            shopkeeper: {
              select: {
                id: true,
                name: true,
                shopName: true,
                address: true,
              },
            },
          },
        },
        fromShop: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
        toShop: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
      },
    });
  }

  async findAll(paginationDto: PaginationDto): Promise<{
    data: ExportRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [exportRequests, total] = await Promise.all([
      this.prisma.exportRequest.findMany({
        skip,
        take,
        include: {
          product: {
            include: {
              shopkeeper: {
                select: {
                  id: true,
                  name: true,
                  shopName: true,
                  address: true,
                },
              },
            },
          },
          fromShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
          toShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.exportRequest.count(),
    ]);

    return {
      data: exportRequests,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async findMyRequests(shopkeeperId: string, paginationDto: PaginationDto): Promise<{
    data: ExportRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [exportRequests, total] = await Promise.all([
      this.prisma.exportRequest.findMany({
        where: { fromShopId: shopkeeperId },
        skip,
        take,
        include: {
          product: {
            include: {
              shopkeeper: {
                select: {
                  id: true,
                  name: true,
                  shopName: true,
                  address: true,
                },
              },
            },
          },
          fromShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
          toShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.exportRequest.count({
        where: { fromShopId: shopkeeperId },
      }),
    ]);

    return {
      data: exportRequests,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async findRequestsForMe(shopkeeperId: string, paginationDto: PaginationDto): Promise<{
    data: ExportRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [exportRequests, total] = await Promise.all([
      this.prisma.exportRequest.findMany({
        where: { toShopId: shopkeeperId },
        skip,
        take,
        include: {
          product: {
            include: {
              shopkeeper: {
                select: {
                  id: true,
                  name: true,
                  shopName: true,
                  address: true,
                },
              },
            },
          },
          fromShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
          toShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.exportRequest.count({
        where: { toShopId: shopkeeperId },
      }),
    ]);

    return {
      data: exportRequests,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async findOne(id: string): Promise<ExportRequest> {
    const exportRequest = await this.prisma.exportRequest.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            shopkeeper: {
              select: {
                id: true,
                name: true,
                shopName: true,
                address: true,
              },
            },
          },
        },
        fromShop: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
        toShop: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
      },
    });

    if (!exportRequest) {
      throw new NotFoundException('Export request not found');
    }

    return exportRequest;
  }

  // ADD MISSING METHODS:
  async findByStatus(
    shopkeeperId: string,
    status: ExportRequestStatus,
    paginationDto: PaginationDto
  ): Promise<{
    data: ExportRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    const [exportRequests, total] = await Promise.all([
      this.prisma.exportRequest.findMany({
        where: {
          status,
          OR: [
            { fromShopId: shopkeeperId },
            { toShopId: shopkeeperId },
          ],
        },
        skip,
        take,
        include: {
          product: {
            include: {
              shopkeeper: {
                select: {
                  id: true,
                  name: true,
                  shopName: true,
                  address: true,
                },
              },
            },
          },
          fromShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
          toShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.exportRequest.count({
        where: {
          status,
          OR: [
            { fromShopId: shopkeeperId },
            { toShopId: shopkeeperId },
          ],
        },
      }),
    ]);

    return {
      data: exportRequests,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async findByProduct(
    productId: string,
    shopkeeperId: string,
    paginationDto: PaginationDto
  ): Promise<{
    data: ExportRequest[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { skip, take } = paginationDto;

    // Verify the product belongs to the shopkeeper
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { shopkeeperId: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.shopkeeperId !== shopkeeperId) {
      throw new ForbiddenException('You can only view export requests for your own products');
    }

    const [exportRequests, total] = await Promise.all([
      this.prisma.exportRequest.findMany({
        where: { productId },
        skip,
        take,
        include: {
          product: {
            include: {
              shopkeeper: {
                select: {
                  id: true,
                  name: true,
                  shopName: true,
                  address: true,
                },
              },
            },
          },
          fromShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
          toShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.exportRequest.count({
        where: { productId },
      }),
    ]);

    return {
      data: exportRequests,
      total,
      page: paginationDto.page ?? 1,
      limit: paginationDto.limit ?? 10,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const exportRequest = await this.prisma.exportRequest.findUnique({
      where: { id },
    });

    if (!exportRequest) {
      throw new NotFoundException('Export request not found');
    }

    await this.prisma.exportRequest.delete({
      where: { id },
    });

    return { message: 'Export request deleted successfully' };
  }

  async acceptRequest(id: string, shopkeeperId: string, acceptDto: AcceptExportRequestDto): Promise<ExportRequest> {
    const exportRequest = await this.prisma.exportRequest.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!exportRequest) {
      throw new NotFoundException('Export request not found');
    }

    // Only the target shop can accept the request
    if (exportRequest.toShopId !== shopkeeperId) {
      throw new ForbiddenException('You can only accept requests directed to your shop');
    }

    // Check if request is still pending
    if (exportRequest.status !== ExportRequestStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending');
    }

    // Check if the product still has sufficient quantity
    if (exportRequest.product.quantity < exportRequest.quantity) {
      throw new BadRequestException(`Insufficient quantity. Available: ${exportRequest.product.quantity}, Requested: ${exportRequest.quantity}`);
    }

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (prisma) => {
      // Update the export request status
      const updatedRequest = await prisma.exportRequest.update({
        where: { id },
        data: {
          status: ExportRequestStatus.ACCEPTED,
          message: acceptDto.message,
        },
        include: {
          product: {
            include: {
              shopkeeper: {
                select: {
                  id: true,
                  name: true,
                  shopName: true,
                  address: true,
                },
              },
            },
          },
          fromShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
          toShop: {
            select: {
              id: true,
              name: true,
              shopName: true,
              address: true,
            },
          },
        },
      });

      // Reduce quantity from the original product
      await prisma.product.update({
        where: { id: exportRequest.productId },
        data: {
          quantity: {
            decrement: exportRequest.quantity,
          },
        },
      });

      // Check if the accepting shop already has this product
      const existingProduct = await prisma.product.findFirst({
        where: {
          shopkeeperId: shopkeeperId,
          name: exportRequest.product.name,
        },
      });

      if (existingProduct) {
        // If product exists, increase quantity
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            quantity: {
              increment: exportRequest.quantity,
            },
          },
        });
      } else {
        // If product doesn't exist, create new product
        await prisma.product.create({
          data: {
            name: exportRequest.product.name,
            description: exportRequest.product.description,
            price: exportRequest.product.price,
            quantity: exportRequest.quantity,
            expiryDate: exportRequest.product.expiryDate,
            category: exportRequest.product.category,
            shopkeeperId: shopkeeperId,
          },
        });
      }

      return updatedRequest;
    });
  }

  async rejectRequest(id: string, shopkeeperId: string, rejectDto: RejectExportRequestDto): Promise<ExportRequest> {
    const exportRequest = await this.prisma.exportRequest.findUnique({
      where: { id },
    });

    if (!exportRequest) {
      throw new NotFoundException('Export request not found');
    }

    // Only the target shop can reject the request
    if (exportRequest.toShopId !== shopkeeperId) {
      throw new ForbiddenException('You can only reject requests directed to your shop');
    }

    // Check if request is still pending
    if (exportRequest.status !== ExportRequestStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending');
    }

    return this.prisma.exportRequest.update({
      where: { id },
      data: {
        status: ExportRequestStatus.REJECTED,
        message: rejectDto.message,
      },
      include: {
        product: {
          include: {
            shopkeeper: {
              select: {
                id: true,
                name: true,
                shopName: true,
                address: true,
              },
            },
          },
        },
        fromShop: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
        toShop: {
          select: {
            id: true,
            name: true,
            shopName: true,
            address: true,
          },
        },
      },
    });
  }

  async cancelRequest(id: string, shopkeeperId: string): Promise<void> {
    const exportRequest = await this.prisma.exportRequest.findUnique({
      where: { id },
    });

    if (!exportRequest) {
      throw new NotFoundException('Export request not found');
    }

    // Only the requesting shop can cancel the request
    if (exportRequest.fromShopId !== shopkeeperId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    // Check if request is still pending
    if (exportRequest.status !== ExportRequestStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending');
    }

    await this.prisma.exportRequest.delete({
      where: { id },
    });
  }
}