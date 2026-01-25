import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { Rating, RatingSchema } from '../database/schemas/rating.schema';
import { Order, OrderSchema } from '../database/schemas/order.schema';
import {
  DeliveryProfile,
  DeliveryProfileSchema,
} from '../database/schemas/delivery-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Order.name, schema: OrderSchema },
      { name: DeliveryProfile.name, schema: DeliveryProfileSchema },
    ]),
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
