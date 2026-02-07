import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChangeOrderStatusDto, CreateOrderDto, OrderPaginationDto } from './dto';
import { PrismaClient } from 'generated/prisma';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { NATS_SERVICE } from 'src/config';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {
    super()
  }
  
  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');
  }
  async create(createOrderDto: CreateOrderDto) {
    try {
      const productIds = createOrderDto.items.map(item=> item.productId)
      const products = 
      await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productIds)
      )
      const totalAmount = createOrderDto.items.reduce((acc,orderItem)=>{
        const price =products.find(product => product.id === orderItem.productId).price
        return price * orderItem.quantity
      },0)

      const totalItems = createOrderDto.items.reduce((acc, orderItem)=>{
        return acc + orderItem.quantity
      },0)

      const order = await this.order.create({
        data:{
          totalAmount:totalAmount,
          totalItems:totalItems,
          OrderItem:{
            createMany:{
              data: createOrderDto.items.map((orderItem)=>({
                price: products.find((product) => product.id === orderItem.productId).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity
              }))
            }
          }
        },
        include:{
          OrderItem:{
            select:{
              price: true,
              quantity:true,
              productId:true,
            }
          }
        }
      })
      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem)=>({
          ...orderItem,
          name: products.find((product)=>product.id === orderItem.productId).name
        }))
      }
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: "Check logs!!!",
        error: error
      })
    }
    
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status,
      },
    });

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      data: await this.order.findMany({
        skip: (currentPage! - 1) * perPage!,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage!),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({ where: { id },
      include:{
        OrderItem:{
          select:{
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    });
    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`
      });
    }

    const productIds = order.OrderItem.map(orderItem => orderItem.productId)

    const products = await firstValueFrom(this.client.send({ cmd: 'validate_products' }, productIds))

    return {
      ...order,
      OrderItem: order.OrderItem.map(orderItem=>({
        ...orderItem,
        name: products.find(product=> product.id === orderItem.productId).name
      }))
    }
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
