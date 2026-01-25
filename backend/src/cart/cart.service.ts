import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../database/schemas/cart.schema';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getCart(userId: string) {
    let cart = await this.cartModel
      .findOne({ userId })
      .populate('items.productId')
      .exec();

    if (!cart) {
      cart = new this.cartModel({ userId, items: [], totalAmount: 0 });
      await cart.save();
    }

    // Calculate total amount
    const calculatedTotal = cart.items.reduce(
      (total, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return total + price * quantity;
      },
      0,
    );
    cart.totalAmount = calculatedTotal;
    await cart.save();

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const product = await this.productModel
      .findById(addToCartDto.productId)
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }

    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    let cart = await this.cartModel.findOne({ userId }).exec();

    if (!cart) {
      cart = new this.cartModel({ userId, items: [], totalAmount: 0 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === addToCartDto.productId,
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity =
        cart.items[existingItemIndex].quantity + addToCartDto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock');
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        productId: addToCartDto.productId as any,
        quantity: addToCartDto.quantity,
        price: product.price,
      });
    }

    // Calculate total amount
    const calculatedTotal = cart.items.reduce(
      (total, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return total + price * quantity;
      },
      0,
    );
    cart.totalAmount = calculatedTotal;

    await cart.save();

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    itemId: string,
    updateDto: UpdateCartItemDto,
  ) {
    const cart = await this.cartModel.findOne({ userId }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const itemIndex = cart.items.findIndex(
      (item, index) => {
        const itemIdObj = (item as any)._id || (cart.items as any).id?.[index];
        return itemIdObj?.toString() === itemId;
      },
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Cart item not found');
    }

    const product = await this.productModel
      .findById(cart.items[itemIndex].productId)
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < updateDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cart.items[itemIndex].quantity = updateDto.quantity;

    // Calculate total amount
    const calculatedTotal = cart.items.reduce(
      (total, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return total + price * quantity;
      },
      0,
    );
    cart.totalAmount = calculatedTotal;

    await cart.save();

    return this.getCart(userId);
  }

  async removeCartItem(userId: string, itemId: string) {
    const cart = await this.cartModel.findOne({ userId }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = cart.items.filter(
      (item, index) => {
        const itemIdObj = (item as any)._id || (cart.items as any).id?.[index];
        return itemIdObj?.toString() !== itemId;
      },
    );

    // Calculate total amount
    const calculatedTotal = cart.items.reduce(
      (total, item) => {
        const price = typeof item.price === 'number' ? item.price : 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : 0;
        return total + price * quantity;
      },
      0,
    );
    cart.totalAmount = calculatedTotal;

    await cart.save();

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.cartModel.findOne({ userId }).exec();

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    cart.items = [];
    cart.totalAmount = 0;

    await cart.save();

    return cart;
  }
}
