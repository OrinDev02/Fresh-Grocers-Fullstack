import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryProfile, DeliveryProfileDocument } from '../database/schemas/delivery-profile.schema';
import { User, UserDocument } from '../database/schemas/user.schema';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';
import { ApproveDeliveryDto } from './dto/approve-delivery.dto';
import { NearbyDeliveryDto } from './dto/nearby-delivery.dto';
import { EmailService } from '../email/email.service';
import { getDistance } from 'geolib';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectModel(DeliveryProfile.name)
    private deliveryProfileModel: Model<DeliveryProfileDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private emailService: EmailService,
  ) {}

  async getProfile(userId: string | Types.ObjectId) {
    const userIdString = String(userId);
    const profile = await this.deliveryProfileModel
      .findOne({ userId: userIdString })
      .populate('userId', 'fullName email phone')
      .exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string | Types.ObjectId, updateDto: UpdateDeliveryProfileDto) {
    const userIdString = String(userId);
    const profile = await this.deliveryProfileModel.findOne({ userId: userIdString }).exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    if (updateDto.city) profile.city = updateDto.city;
    if (updateDto.district) profile.district = updateDto.district;
    if (updateDto.province) profile.province = updateDto.province;
    if (updateDto.latitude !== undefined)
      profile.latitude = updateDto.latitude;
    if (updateDto.longitude !== undefined)
      profile.longitude = updateDto.longitude;
    if (updateDto.vehicleType) profile.vehicleType = updateDto.vehicleType;

    await profile.save();

    return profile;
  }

  async getApprovalStatus(userId: string | Types.ObjectId) {
    // Convert userId to string to ensure proper matching
    const userIdString = String(userId);
    
    const profile = await this.deliveryProfileModel
      .findOne({ userId: userIdString })
      .populate('userId', 'fullName email phone')
      .exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    return profile;
  }

  async approveDeliveryPerson(
    deliveryPersonId: string | Types.ObjectId,
    approveDto: ApproveDeliveryDto,
    approvedBy: string,
  ) {
    const userIdString = String(deliveryPersonId);
    const profile = await this.deliveryProfileModel
      .findOne({ userId: userIdString })
      .exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    if (profile.status !== 'PENDING') {
      throw new BadRequestException(
        'Delivery person has already been processed',
      );
    }

    profile.status = approveDto.status;
    profile.isApproved = approveDto.status === 'APPROVED';
    profile.approvedAt = new Date();
    profile.approvedBy = approvedBy as any;

    await profile.save();

    if (approveDto.status === 'APPROVED') {
      const user = await this.userModel.findById(deliveryPersonId).exec();
      if (user) {
        await this.emailService.sendDeliveryApproval(
          user.email,
          user.fullName,
        );
      }
    }

    return profile;
  }

  async findNearbyDeliveryPersons(nearbyDto: NearbyDeliveryDto) {
    const radius = nearbyDto.radius || 5; // Default 5km

    const allProfiles = await this.deliveryProfileModel
      .find({
        isApproved: true,
        status: 'APPROVED',
      })
      .populate('userId', 'fullName email phone')
      .exec();

    // First, try to find by GPS distance if coordinates are valid
    const gpsMatches: any[] = [];
    const districtMatches: any[] = [];

    for (const profile of allProfiles) {
      // Try GPS matching first if both have valid coordinates
      if (
        profile.latitude &&
        profile.longitude &&
        nearbyDto.latitude !== 0 &&
        nearbyDto.longitude !== 0
      ) {
        const distance = getDistance(
          { latitude: nearbyDto.latitude, longitude: nearbyDto.longitude },
          { latitude: profile.latitude, longitude: profile.longitude },
        );

        const distanceInKm = distance / 1000; // Convert to km

        if (distanceInKm <= radius) {
          gpsMatches.push({
            ...profile.toObject(),
            distance: distanceInKm,
            matchType: 'gps',
          });
          continue; // Skip district matching if GPS match found
        }
      }

      // Fallback: Try district matching
      if (nearbyDto.district && profile.district) {
        if (
          profile.district.toLowerCase() === nearbyDto.district.toLowerCase()
        ) {
          districtMatches.push({
            ...profile.toObject(),
            distance: 0, // Set distance to 0 for district-matched results
            matchType: 'district',
          });
        }
      }
    }

    // Combine results: GPS matches first, then district matches
    const nearbyProfiles = [...gpsMatches, ...districtMatches].sort((a, b) => {
      // Sort by distance first (GPS matches have actual distance, district matches have 0)
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // Then by rating
      return b.averageRating - a.averageRating;
    });

    return nearbyProfiles;
  }

  async getStats(userId: string | Types.ObjectId) {
    const userIdString = String(userId);
    const profile = await this.deliveryProfileModel
      .findOne({ userId: userIdString })
      .exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    // Get today's completed deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await this.orderModel
      .find({
        deliveryPersonId: profile._id,
        status: 'DELIVERED',
        deliveredAt: {
          $gte: today,
          $lt: tomorrow,
        },
      })
      .exec();

    const completedToday = todayDeliveries.length;
    const todayEarnings = todayDeliveries.reduce(
      (sum, order) => sum + (order.deliveryFee || 0),
      0,
    );

    return {
      totalDeliveries: profile.totalDeliveries,
      totalEarnings: profile.totalEarnings,
      averageRating: profile.averageRating,
      totalRatings: profile.totalRatings,
      completedToday,
      todayEarnings,
    };
  }
}
