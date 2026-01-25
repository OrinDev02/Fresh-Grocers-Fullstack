import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeliveryProfile, DeliveryProfileDocument } from '../database/schemas/delivery-profile.schema';
import { User, UserDocument } from '../database/schemas/user.schema';
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
    private emailService: EmailService,
  ) {}

  async getProfile(userId: string) {
    const profile = await this.deliveryProfileModel
      .findOne({ userId })
      .populate('userId', 'fullName email phone')
      .exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, updateDto: UpdateDeliveryProfileDto) {
    const profile = await this.deliveryProfileModel.findOne({ userId }).exec();

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

  async getApprovalStatus(userId: string) {
    const profile = await this.deliveryProfileModel
      .findOne({ userId })
      .exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    return {
      status: profile.status,
      isApproved: profile.isApproved,
      approvedAt: profile.approvedAt,
    };
  }

  async approveDeliveryPerson(
    deliveryPersonId: string,
    approveDto: ApproveDeliveryDto,
    approvedBy: string,
  ) {
    const profile = await this.deliveryProfileModel
      .findOne({ userId: deliveryPersonId })
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
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null },
      })
      .populate('userId', 'fullName email phone')
      .exec();

    const nearbyProfiles = allProfiles
      .map((profile) => {
        if (!profile.latitude || !profile.longitude) return null;

        const distance = getDistance(
          { latitude: nearbyDto.latitude, longitude: nearbyDto.longitude },
          { latitude: profile.latitude, longitude: profile.longitude },
        );

        const distanceInKm = distance / 1000; // Convert to km

        if (distanceInKm <= radius) {
          return {
            ...profile.toObject(),
            distance: distanceInKm,
          };
        }
        return null;
      })
      .filter((profile) => profile !== null)
      .sort((a, b) => {
        // Sort by distance first, then by rating
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        return b.averageRating - a.averageRating;
      });

    return nearbyProfiles;
  }

  async getStats(userId: string) {
    const profile = await this.deliveryProfileModel
      .findOne({ userId })
      .exec();

    if (!profile) {
      throw new NotFoundException('Delivery profile not found');
    }

    return {
      totalDeliveries: profile.totalDeliveries,
      totalEarnings: profile.totalEarnings,
      averageRating: profile.averageRating,
      totalRatings: profile.totalRatings,
    };
  }
}
