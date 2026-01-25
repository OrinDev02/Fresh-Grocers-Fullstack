import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from '../database/schemas/order.schema';
import { Cart, CartSchema } from '../database/schemas/cart.schema';
import { Product, ProductSchema } from '../database/schemas/product.schema';
import {
  DeliveryProfile,
  DeliveryProfileSchema,
} from '../database/schemas/delivery-profile.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema },
      { name: DeliveryProfile.name, schema: DeliveryProfileSchema },
    ]),
    EmailModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
