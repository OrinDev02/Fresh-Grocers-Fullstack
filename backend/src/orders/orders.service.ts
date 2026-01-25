import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../database/schemas/order.schema';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { DeliveryProfile, DeliveryProfileDocument } from '../database/schemas/delivery-profile.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(DeliveryProfile.name)
    private deliveryProfileModel: Model<DeliveryProfileDocument>,
    private emailService: EmailService,
  ) {}

  async generateOrderNumber(): Promise<string> {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${random}`;
  }

  async create(customerId: string, createOrderDto: CreateOrderDto) {
    const cart = await this.cartModel
      .findOne({ userId: customerId })
      .populate('items.productId')
      .exec();

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate stock and prepare order items
    const orderItems: Array<{
      productId: any;
      name: string;
      quantity: number;
      price: number;
    }> = [];
    let subtotal = 0;

    for (const cartItem of cart.items) {
      const product = await this.productModel
        .findById(cartItem.productId)
        .exec();

      if (!product || !product.isActive) {
        throw new BadRequestException(
          `Product ${product?.name || 'Unknown'} is not available`,
        );
      }

      if (product.stock < cartItem.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${product.name}`,
        );
      }

      // Update stock
      product.stock -= cartItem.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        price: cartItem.price,
      });

      subtotal += cartItem.price * cartItem.quantity;
    }

    const deliveryFee = createOrderDto.deliveryFee || 0;
    const totalAmount = subtotal + deliveryFee;

    const orderNumber = await this.generateOrderNumber();

    const order = new this.orderModel({
      orderNumber,
      customerId,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      status: 'PENDING',
      paymentMethod: 'COD',
      deliveryAddress: createOrderDto.deliveryAddress,
    });

    await order.save();

    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return order;
  }

  async findAll(userId: string, userRole: string, queryDto: QueryOrdersDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Role-based filtering
    if (userRole === 'CUSTOMER') {
      filter.customerId = userId;
    } else if (userRole === 'DELIVERY_PERSON') {
      filter.deliveryPersonId = userId;
      filter.status = { $in: ['ASSIGNED', 'ACCEPTED'] };
    }
    // CSR can see all orders

    if (queryDto.status) {
      filter.status = queryDto.status;
    }

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('customerId', 'fullName email phone')
        .populate('deliveryPersonId', 'fullName email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter).exec(),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string, userRole: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'fullName email phone')
      .populate('deliveryPersonId', 'fullName email phone')
      .populate('items.productId', 'name imageUrl')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check access
    const customerIdObj = order.customerId as any;
    const customerIdStr = customerIdObj?._id?.toString() || customerIdObj?.toString() || String(order.customerId);
    
    const deliveryPersonIdObj = order.deliveryPersonId as any;
    const deliveryPersonIdStr = deliveryPersonIdObj
      ? (deliveryPersonIdObj._id?.toString() || deliveryPersonIdObj.toString() || String(order.deliveryPersonId))
      : null;

    if (userRole === 'CUSTOMER' && customerIdStr !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (userRole === 'DELIVERY_PERSON' && deliveryPersonIdStr !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async assignOrder(
    orderId: string,
    assignDto: AssignOrderDto,
    assignedBy: string,
  ) {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Order is not in PENDING status');
    }

    // Verify delivery person exists and is approved
    const deliveryProfile = await this.deliveryProfileModel
      .findOne({ userId: assignDto.deliveryPersonId })
      .exec();

    if (!deliveryProfile || !deliveryProfile.isApproved) {
      throw new BadRequestException(
        'Delivery person not found or not approved',
      );
    }

    order.deliveryPersonId = assignDto.deliveryPersonId as any;
    order.status = 'ASSIGNED';
    order.assignedAt = new Date();

    await order.save();

    return order;
  }

  async acceptOrder(orderId: string, deliveryPersonId: string) {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const deliveryPersonIdObj = order.deliveryPersonId as any;
    const deliveryPersonIdStr = deliveryPersonIdObj
      ? (deliveryPersonIdObj._id?.toString() || deliveryPersonIdObj.toString() || String(order.deliveryPersonId))
      : null;

    if (deliveryPersonIdStr !== deliveryPersonId) {
      throw new ForbiddenException('Order not assigned to you');
    }

    if (order.status !== 'ASSIGNED') {
      throw new BadRequestException('Order is not in ASSIGNED status');
    }

    order.status = 'ACCEPTED';
    order.acceptedAt = new Date();

    await order.save();

    // Send order confirmation email to customer
    const populatedOrder = await this.orderModel
      .findById(orderId)
      .populate('customerId', 'email fullName')
      .exec();

    if (populatedOrder && populatedOrder.customerId) {
      const customer = populatedOrder.customerId as any;
      await this.emailService.sendOrderConfirmation(
        customer.email,
        order.orderNumber,
        {
          customerName: customer.fullName,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          deliveryAddress: order.deliveryAddress,
        },
      );
    }

    return order;
  }

  async rejectOrder(orderId: string, deliveryPersonId: string) {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const deliveryPersonIdObj = order.deliveryPersonId as any;
    const deliveryPersonIdStr = deliveryPersonIdObj
      ? (deliveryPersonIdObj._id?.toString() || deliveryPersonIdObj.toString() || String(order.deliveryPersonId))
      : null;

    if (deliveryPersonIdStr !== deliveryPersonId) {
      throw new ForbiddenException('Order not assigned to you');
    }

    if (order.status !== 'ASSIGNED') {
      throw new BadRequestException('Order is not in ASSIGNED status');
    }

    // Reset assignment
    (order as any).deliveryPersonId = null;
    order.status = 'PENDING';
    (order as any).assignedAt = null;

    await order.save();

    return order;
  }

  async markAsDelivered(orderId: string, deliveryPersonId: string) {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const deliveryPersonIdObj = order.deliveryPersonId as any;
    const deliveryPersonIdStr = deliveryPersonIdObj
      ? (deliveryPersonIdObj._id?.toString() || deliveryPersonIdObj.toString() || String(order.deliveryPersonId))
      : null;

    if (deliveryPersonIdStr !== deliveryPersonId) {
      throw new ForbiddenException('Order not assigned to you');
    }

    if (order.status !== 'ACCEPTED') {
      throw new BadRequestException('Order is not in ACCEPTED status');
    }

    order.status = 'DELIVERED';
    order.deliveredAt = new Date();

    await order.save();

    // Update delivery person stats
    const deliveryProfile = await this.deliveryProfileModel
      .findOne({ userId: deliveryPersonId })
      .exec();

    if (deliveryProfile) {
      deliveryProfile.totalDeliveries += 1;
      deliveryProfile.totalEarnings += order.totalAmount;
      await deliveryProfile.save();
    }

    return order;
  }
}
