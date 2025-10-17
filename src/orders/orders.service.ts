import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChangeOrderStatusDto, CreateOrderDto, OrderPaginationDto } from './dto';
import { PrismaClient } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('OrdersService');
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }
  async create(createOrderDto: CreateOrderDto) {
    return await this.order.create({ data: createOrderDto })
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    })
    const perPage = orderPaginationDto.limit;
    const lastPage = Math.ceil(totalPages / perPage!);
    const currentPage = orderPaginationDto.page;
    if (currentPage! > lastPage) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Page ${currentPage} not found`
      });
    }
    return {
      data: await this.order.findMany({
        skip: (currentPage! - 1) * perPage!,
        take: perPage,
        where:{
          status: orderPaginationDto.status
        }
      }),
      meta:{
        total: totalPages,
        currentPage,
        lastPage: Math.ceil(totalPages / perPage!)
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({ where: { id } });
    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`
      });
    }
    return order;
  }

  async changeOrderStatus(changeOrderStatusDto:ChangeOrderStatusDto ) {
    const {id, status} = changeOrderStatusDto;
    const order = await this.findOne(id);
    if(order.status === status){
      return order;
    }
    return await this.order.update({
      where: { id },
      data: { status }
    });
    
  }
  
}
