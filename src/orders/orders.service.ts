import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order from order-microservices';
  }

  findAll() {
    return `This action returns all orders from order-microservices`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order from order-microservices`;
  }

  
}
