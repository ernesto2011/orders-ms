import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { OrderStatus } from "generated/prisma";
import { OrderStatuslist } from "../enum/order-enum";

export class CreateOrderDto {
    @IsNumber()
    @IsPositive()
    totalAmount: number;

    @IsNumber()
    @IsPositive()
    totalItems: number;

    @IsEnum(OrderStatuslist,{
        message: `Status must be one of the following values: ${OrderStatuslist.join(', ')}`
    })
    @IsOptional()
    status:OrderStatus = OrderStatus.PENDING;

    @IsOptional()
    @IsBoolean()
    paid: boolean = false;


}
