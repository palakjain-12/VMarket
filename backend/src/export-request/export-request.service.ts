// backend/src/export-request/export-request.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExportRequestDto } from './dto/create-export-request.dto';
import { AcceptExportRequestDto } from './dto/accept-export-request.dto';
import { RejectExportRequestDto } from './dto/reject-export-request.dto';
import { ExportRequest, ExportRequestStatus } from '@prisma/client';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ExportRequestService {
  constructor(private prisma: PrismaService) {}

  async create(
    createExportRequestDto: CreateExportRequestDto,
    fromShopId: string,
  ): Promise<ExportRequest> {
    const { productId, toShopId, quantity, message } = createExportRequestDto;

    // Validate product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { shopkeeper: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if this is a request for someone else's product or sending own product
    if (product.shopkeeperId !== fromShopId) {
      // This is a request for someone else's product (REQUEST_FROM_OTHER scenario)
      // In this case, toShopId should be the product owner's shop ID
      if (product.shopkeeperId !== toShopId) {
        throw new ForbiddenException(
          "When requesting products from other shops, the target shop must be the product owner's shop",
        );
      }
    } else {
      // This is sending own product to another shop (SEND_MY_PRODUCT scenario)
      // In this case, fromShopId (current user) should be the product owner
      // and toShopId should be different from fromShopId
      if (fromShopId === toShopId) {
        throw new ForbiddenException(
          'You cannot send products to your own shop',
        );
      }
    }

    // Check if product has sufficient quantity
    if (product.quantity < quantity) {
      throw new BadRequestException(
        `Insufficient quantity. Available: ${product.quantity}, Requested: ${quantity}`,
      );
    }

    // Check if target shop exists
    const targetShop = await this.prisma.shopkeeper.findUnique({
      where: { id: toShopId },
    });

    if (!targetShop) {
      throw new NotFoundException('Target shop not found');
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
      throw new BadRequestException(
        'There is already a pending export request for this product to the same shop',
      );
    }

    // Create the export request

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

  async findMyRequests(
    shopkeeperId: string,
    paginationDto: PaginationDto,
  ): Promise<{
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

  async findRequestsForMe(
    shopkeeperId: string,
    paginationDto: PaginationDto,
  ): Promise<{
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
    paginationDto: PaginationDto,
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
          OR: [{ fromShopId: shopkeeperId }, { toShopId: shopkeeperId }],
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
          OR: [{ fromShopId: shopkeeperId }, { toShopId: shopkeeperId }],
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
    paginationDto: PaginationDto,
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
      throw new ForbiddenException(
        'You can only view export requests for your own products',
      );
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

  async acceptRequest(
    id: string,
    shopkeeperId: string,
    acceptDto: AcceptExportRequestDto,
  ): Promise<ExportRequest> {
    console.log(
      `Starting acceptRequest for id: ${id}, shopkeeperId: ${shopkeeperId}`,
    );

    const exportRequest = await this.prisma.exportRequest.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    console.log(
      'Export request found:',
      JSON.stringify(exportRequest, null, 2),
    );

    if (!exportRequest) {
      throw new NotFoundException('Export request not found');
    }

    // Only the target shop can accept the request
    if (exportRequest.toShopId !== shopkeeperId) {
      throw new ForbiddenException(
        'You can only accept requests directed to your shop',
      );
    }

    // Check if request is still pending
    if (exportRequest.status !== ExportRequestStatus.PENDING) {
      throw new BadRequestException('This request is no longer pending');
    }

    // Check if the product still has sufficient quantity
    if (exportRequest.product.quantity < exportRequest.quantity) {
      throw new BadRequestException(
        `Insufficient quantity. Available: ${exportRequest.product.quantity}, Requested: ${exportRequest.quantity}`,
      );
    }

    console.log('All validation checks passed, proceeding with transaction');

    // Use transaction to ensure atomicity
    try {
      return await this.prisma.$transaction(async (prisma) => {
        console.log('Starting transaction');

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

        console.log('Export request updated to ACCEPTED');

        // Reduce quantity from the original product
        const originalProduct = await prisma.product.findUnique({
          where: { id: exportRequest.productId },
        });
        console.log(
          'Original product before update:',
          JSON.stringify(originalProduct, null, 2),
        );

        if (!originalProduct) {
          throw new NotFoundException(
            `Product with ID ${exportRequest.productId} not found`,
          );
        }

        // Calculate new quantity to ensure it's not negative
        const newQuantity = Math.max(
          0,
          originalProduct.quantity - exportRequest.quantity,
        );
        console.log(
          `Calculating new quantity: ${originalProduct.quantity} - ${exportRequest.quantity} = ${newQuantity}`,
        );

        const updatedOriginalProduct = await prisma.product.update({
          where: { id: exportRequest.productId },
          data: {
            quantity: newQuantity,
            updatedAt: new Date(), // Ensure updatedAt is set to trigger cache invalidation
          },
        });

        console.log(
          'Original product after update:',
          JSON.stringify(updatedOriginalProduct, null, 2),
        );

        // Check if the accepting shop already has this product
        const existingProduct = await prisma.product.findFirst({
          where: {
            shopkeeperId: shopkeeperId,
            name: exportRequest.product.name,
          },
        });

        console.log(
          'Checking if product exists in receiving shop:',
          existingProduct ? 'Found' : 'Not found',
        );

        if (existingProduct) {
          console.log(
            'Existing product before update:',
            JSON.stringify(existingProduct, null, 2),
          );

          // If product exists, increase quantity
          // Calculate new quantity to ensure it's correct
          // existingProduct cannot be null here because of the if check above
          const newQuantity = existingProduct.quantity + exportRequest.quantity;
          console.log(
            `Calculating new quantity for receiving shop: ${existingProduct.quantity} + ${exportRequest.quantity} = ${newQuantity}`,
          );

          const updatedExistingProduct = await prisma.product.update({
            where: { id: existingProduct.id },
            data: {
              quantity: newQuantity,
              updatedAt: new Date(), // Ensure updatedAt is set to trigger cache invalidation
            },
          });

          console.log(
            'Existing product after update:',
            JSON.stringify(updatedExistingProduct, null, 2),
          );
        } else {
          // If product doesn't exist, create new product
          console.log(
            `Creating new product in receiving shop with quantity: ${exportRequest.quantity}`,
          );

          const newProduct = await prisma.product.create({
            data: {
              name: exportRequest.product.name,
              description: exportRequest.product.description,
              price: exportRequest.product.price,
              quantity: exportRequest.quantity,
              expiryDate: exportRequest.product.expiryDate,
              category: exportRequest.product.category,
              shopkeeperId: shopkeeperId,
              createdAt: new Date(), // Ensure createdAt is explicitly set
              updatedAt: new Date(), // Ensure updatedAt is explicitly set
            },
          });

          console.log(
            'New product created:',
            JSON.stringify(newProduct, null, 2),
          );
        }

        console.log('Transaction completed successfully');
        return updatedRequest;
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      throw new BadRequestException(
        'Failed to process export request: ' + error.message,
      );
    }
  }

  async rejectRequest(
    id: string,
    shopkeeperId: string,
    rejectDto: RejectExportRequestDto,
  ): Promise<ExportRequest> {
    const exportRequest = await this.prisma.exportRequest.findUnique({
      where: { id },
    });

    if (!exportRequest) {
      throw new NotFoundException('Export request not found');
    }

    // Only the target shop can reject the request
    if (exportRequest.toShopId !== shopkeeperId) {
      throw new ForbiddenException(
        'You can only reject requests directed to your shop',
      );
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
