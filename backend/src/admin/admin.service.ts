import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { User, UserDocument } from '../database/schemas/user.schema';
import { DeliveryProfile, DeliveryProfileDocument } from '../database/schemas/delivery-profile.schema';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { Category, CategoryDocument } from '../database/schemas/category.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DeliveryProfile.name)
    private deliveryProfileModel: Model<DeliveryProfileDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async getDashboard() {
    const [
      totalOrders,
      pendingOrders,
      assignedOrders,
      deliveredOrders,
      totalCustomers,
      totalDeliveryPersons,
      pendingApprovals,
      totalProducts,
      totalCategories,
      totalRevenue,
    ] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      this.orderModel.countDocuments({ status: 'PENDING' }).exec(),
      this.orderModel.countDocuments({ status: 'ASSIGNED' }).exec(),
      this.orderModel.countDocuments({ status: 'DELIVERED' }).exec(),
      this.userModel.countDocuments({ role: 'CUSTOMER' }).exec(),
      this.userModel.countDocuments({ role: 'DELIVERY_PERSON' }).exec(),
      this.deliveryProfileModel
        .countDocuments({ status: 'PENDING' })
        .exec(),
      this.productModel.countDocuments({ isActive: true }).exec(),
      this.categoryModel.countDocuments({ isActive: true }).exec(),
      this.orderModel
        .aggregate([
          { $match: { status: 'DELIVERED' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ])
        .exec(),
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        assigned: assignedOrders,
        delivered: deliveredOrders,
      },
      users: {
        customers: totalCustomers,
        deliveryPersons: totalDeliveryPersons,
        pendingApprovals,
      },
      products: {
        total: totalProducts,
        categories: totalCategories,
      },
      revenue: {
        total: revenue,
      },
    };
  }

  async getPendingApprovals() {
    const pendingProfiles = await this.deliveryProfileModel
      .find({ status: 'PENDING' })
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .exec();

    return {
      data: pendingProfiles,
      total: pendingProfiles.length,
      page: 1,
      limit: 100,
      totalPages: 1,
    };
  }

  async getStatistics() {
    const [
      ordersByStatus,
      ordersByMonth,
      topDeliveryPersons,
      topProducts,
    ] = await Promise.all([
      this.orderModel
        .aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ])
        .exec(),
      this.orderModel
        .aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
              },
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' },
            },
          },
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 6 },
        ])
        .exec(),
      this.deliveryProfileModel
        .find({ isApproved: true })
        .sort({ totalDeliveries: -1 })
        .limit(10)
        .populate('userId', 'fullName')
        .exec(),
      this.productModel
        .find({ isActive: true })
        .sort({ stock: -1 })
        .limit(10)
        .populate('categoryId', 'name')
        .exec(),
    ]);

    return {
      ordersByStatus,
      ordersByMonth,
      topDeliveryPersons,
      topProducts,
    };
  }
}
