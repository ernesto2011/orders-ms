import { IsEnum, IsUUID } from "class-validator";
import { OrderStatuslist } from "../enum/order-enum";
import { OrderStatus } from "generated/prisma";

export class ChangeOrderStatusDto{
    @IsUUID(4)
    id:string;
    @IsEnum(OrderStatuslist,{
        message: `Status must be one of the following values: ${OrderStatuslist.join(', ')}`
    })
    status: OrderStatus;
}