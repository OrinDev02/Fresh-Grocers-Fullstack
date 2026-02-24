import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from '../database/schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async create(createDto: CreateProductDto) {
    const product = new this.productModel(createDto);
    return product.save();
  }

  async findAll(queryDto: QueryProductsDto) {
    const page = queryDto.page || 1;
    const limit = queryDto.limit || 20;
    const skip = (page - 1) * limit;

    const filter: any = { isActive: true };

    if (queryDto.search) {
      filter.$or = [
        { name: { $regex: queryDto.search, $options: 'i' } },
        { description: { $regex: queryDto.search, $options: 'i' } },
      ];
    }

    if (queryDto.categoryId) {
      filter.categoryId = queryDto.categoryId;
    }

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'name')
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'name description')
      .exec();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateDto: UpdateProductDto) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    Object.assign(product, updateDto);
    return product.save();
  }

  async remove(id: string) {
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    return product.save();
  }
}
