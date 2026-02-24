import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  price: number;
}

const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema()
export class DeliveryAddress {
  @Prop()
  street: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  district: string;

  @Prop({ required: true })
  province: string;

  @Prop({ type: Number })
  latitude: number;

  @Prop({ type: Number })
  longitude: number;
}

const DeliveryAddressSchema = SchemaFactory.createForClass(DeliveryAddress);

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deliveryPersonId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ type: Number, required: true })
  subtotal: number;

  @Prop({ type: Number, default: 0 })
  deliveryFee: number;

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({
    required: true,
    enum: ['PENDING', 'ASSIGNED', 'ACCEPTED', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING',
  })
  status: string;

  @Prop({ required: true, enum: ['COD'], default: 'COD' })
  paymentMethod: string;

  @Prop({ type: DeliveryAddressSchema, required: true })
  deliveryAddress: DeliveryAddress;

  @Prop({ type: Date })
  assignedAt: Date;

  @Prop({ type: Date })
  acceptedAt: Date;

  @Prop({ type: Date })
  deliveredAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
