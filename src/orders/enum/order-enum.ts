import { OrderStatus } from "generated/prisma";

export const OrderStatuslist =[
    OrderStatus.PENDING,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
]