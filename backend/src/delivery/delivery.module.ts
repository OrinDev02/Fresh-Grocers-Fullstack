import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import {
  DeliveryProfile,
  DeliveryProfileSchema,
} from '../database/schemas/delivery-profile.schema';
import { User, UserSchema } from '../database/schemas/user.schema';
import { Order, OrderSchema } from '../database/schemas/order.schema';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryProfile.name, schema: DeliveryProfileSchema },
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    EmailModule,
  ],
  controllers: [DeliveryController],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
