import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from '../database/schemas/rating.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { DeliveryProfile, DeliveryProfileDocument } from '../database/schemas/delivery-profile.schema';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(DeliveryProfile.name)
    private deliveryProfileModel: Model<DeliveryProfileDocument>,
  ) {}

  async create(customerId: string, createRatingDto: CreateRatingDto) {
    // Check if order exists and belongs to customer
    const order = await this.orderModel.findById(createRatingDto.orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.customerId.toString() !== customerId) {
      throw new ForbiddenException('You can only rate your own orders');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Order must be delivered before rating');
    }

    if (!order.deliveryPersonId) {
      throw new BadRequestException('Order has no delivery person assigned');
    }

    // Check if already rated
    const existingRating = await this.ratingModel
      .findOne({ orderId: createRatingDto.orderId })
      .exec();

    if (existingRating) {
      throw new BadRequestException('Order already rated');
    }

    // Create rating
    const rating = new this.ratingModel({
      orderId: createRatingDto.orderId,
      customerId,
      deliveryPersonId: order.deliveryPersonId,
      rating: createRatingDto.rating,
      comment: createRatingDto.comment,
    });

    await rating.save();

    // Update delivery person average rating
    await this.updateDeliveryPersonRating(order.deliveryPersonId.toString());

    return rating;
  }

  async getDeliveryPersonRatings(deliveryPersonId: string) {
    const ratings = await this.ratingModel
      .find({ deliveryPersonId })
      .populate('customerId', 'fullName')
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .exec();

    return ratings;
  }

  async checkOrderRated(orderId: string) {
    const rating = await this.ratingModel.findOne({ orderId }).exec();
    return {
      isRated: !!rating,
      rating: rating || null,
    };
  }

  private async updateDeliveryPersonRating(deliveryPersonId: string) {
    const ratings = await this.ratingModel
      .find({ deliveryPersonId })
      .exec();

    const totalRatings = ratings.length;
    const sumRatings = ratings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    const deliveryProfile = await this.deliveryProfileModel
      .findOne({ userId: deliveryPersonId })
      .exec();

    if (deliveryProfile) {
      deliveryProfile.averageRating = averageRating;
      deliveryProfile.totalRatings = totalRatings;
      await deliveryProfile.save();
    }
  }
}
