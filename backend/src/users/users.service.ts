import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../database/schemas/user.schema';
import { DeliveryProfile, DeliveryProfileDocument } from '../database/schemas/delivery-profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DeliveryProfile.name)
    private deliveryProfileModel: Model<DeliveryProfileDocument>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    let deliveryProfile: any = null;
    if (user.role === 'DELIVERY_PERSON') {
      deliveryProfile = await this.deliveryProfileModel
        .findOne({ userId: user._id })
        .exec();
    }

    return {
      ...user.toObject(),
      deliveryProfile,
    };
  }

  async updateProfile(userId: string, updateDto: UpdateProfileDto) {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.fullName) {
      user.fullName = updateDto.fullName;
    }
    if (updateDto.phone) {
      user.phone = updateDto.phone;
    }

    await user.save();

    return {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
    };
  }

  async getAllCustomers() {
    const customers = await this.userModel
      .find({ role: 'CUSTOMER' })
      .select('-password')
      .exec();

    return customers;
  }

  async getAllDeliveryPersons() {
    const deliveryPersons = await this.userModel
      .find({ role: 'DELIVERY_PERSON' })
      .select('-password')
      .populate('deliveryProfile')
      .exec();

    const deliveryPersonsWithProfiles = await Promise.all(
      deliveryPersons.map(async (user) => {
        const profile = await this.deliveryProfileModel
          .findOne({ userId: user._id })
          .exec();

        return {
          ...user.toObject(),
          deliveryProfile: profile,
        };
      }),
    );

    return deliveryPersonsWithProfiles;
  }
}
