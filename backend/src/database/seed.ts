import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Category, CategoryDocument } from './schemas/category.schema';
import { Product, ProductDocument } from './schemas/product.schema';
import { DeliveryProfile, DeliveryProfileDocument } from './schemas/delivery-profile.schema';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(DeliveryProfile.name) private deliveryProfileModel: Model<DeliveryProfileDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedCSRUser();
    await this.seedCategories();
    await this.seedProducts();
    await this.seedDeliveryPersons();
  }

  private async seedCSRUser() {
    const csrEmail = this.configService.get<string>('CSR_EMAIL') || 'csr@grocerydelivery.com';
    const csrPassword = this.configService.get<string>('CSR_PASSWORD') || 'CSR@123456';
    const csrName = this.configService.get<string>('CSR_NAME') || 'CSR Admin';
    const csrPhone = this.configService.get<string>('CSR_PHONE') || '+1234567890';

    const existingCSR = await this.userModel.findOne({
      email: csrEmail.toLowerCase(),
      role: 'CSR',
    });

    if (existingCSR) {
      console.log('CSR user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(csrPassword, 10);

    const csrUser = new this.userModel({
      email: csrEmail.toLowerCase(),
      password: hashedPassword,
      role: 'CSR',
      fullName: csrName,
      phone: csrPhone,
      isActive: true,
    });

    await csrUser.save();
    console.log('✓ CSR user created successfully');
    console.log(`  Email: ${csrEmail}`);
    console.log(`  Password: ${csrPassword}`);
  }

  private async seedCategories() {
    const categoriesCount = await this.categoryModel.countDocuments();
    if (categoriesCount > 0) {
      console.log('Categories already exist');
      return;
    }

    const categories = [
      {
        name: 'Vegetables',
        description: 'Fresh organic vegetables',
        imageUrl: 'https://via.placeholder.com/300?text=Vegetables',
        isActive: true,
      },
      {
        name: 'Fruits',
        description: 'Fresh seasonal fruits',
        imageUrl: 'https://via.placeholder.com/300?text=Fruits',
        isActive: true,
      },
      {
        name: 'Dairy',
        description: 'Milk, cheese, and dairy products',
        imageUrl: 'https://via.placeholder.com/300?text=Dairy',
        isActive: true,
      },
      {
        name: 'Bakery',
        description: 'Fresh bread and baked goods',
        imageUrl: 'https://via.placeholder.com/300?text=Bakery',
        isActive: true,
      },
      {
        name: 'Meat & Fish',
        description: 'Fresh meat and seafood',
        imageUrl: 'https://via.placeholder.com/300?text=Meat',
        isActive: true,
      },
      {
        name: 'Pantry Staples',
        description: 'Essential pantry items',
        imageUrl: 'https://via.placeholder.com/300?text=Pantry',
        isActive: true,
      },
    ];

    const createdCategories = await this.categoryModel.insertMany(categories);
    console.log(`✓ ${createdCategories.length} categories created successfully`);
  }

  private async seedProducts() {
    const productsCount = await this.productModel.countDocuments();
    if (productsCount > 0) {
      console.log('Products already exist');
      return;
    }

    const categories = await this.categoryModel.find();
    const categoryMap = new Map(categories.map((c) => [c.name, c._id]));

    const products = [
      // Vegetables
      {
        name: 'Tomato',
        description: 'Fresh red tomatoes',
        price: 2.5,
        imageUrl: 'https://via.placeholder.com/300?text=Tomato',
        categoryId: categoryMap.get('Vegetables'),
        stock: 100,
        isActive: true,
      },
      {
        name: 'Carrot',
        description: 'Orange carrots',
        price: 1.8,
        imageUrl: 'https://via.placeholder.com/300?text=Carrot',
        categoryId: categoryMap.get('Vegetables'),
        stock: 150,
        isActive: true,
      },
      {
        name: 'Onion',
        description: 'White onions',
        price: 1.2,
        imageUrl: 'https://via.placeholder.com/300?text=Onion',
        categoryId: categoryMap.get('Vegetables'),
        stock: 200,
        isActive: true,
      },
      // Fruits
      {
        name: 'Apple',
        description: 'Fresh apples',
        price: 3.5,
        imageUrl: 'https://via.placeholder.com/300?text=Apple',
        categoryId: categoryMap.get('Fruits'),
        stock: 120,
        isActive: true,
      },
      {
        name: 'Banana',
        description: 'Yellow bananas',
        price: 1.5,
        imageUrl: 'https://via.placeholder.com/300?text=Banana',
        categoryId: categoryMap.get('Fruits'),
        stock: 180,
        isActive: true,
      },
      {
        name: 'Orange',
        description: 'Fresh oranges',
        price: 2.8,
        imageUrl: 'https://via.placeholder.com/300?text=Orange',
        categoryId: categoryMap.get('Fruits'),
        stock: 130,
        isActive: true,
      },
      // Dairy
      {
        name: 'Milk',
        description: 'Fresh whole milk',
        price: 3.2,
        imageUrl: 'https://via.placeholder.com/300?text=Milk',
        categoryId: categoryMap.get('Dairy'),
        stock: 200,
        isActive: true,
      },
      {
        name: 'Cheese',
        description: 'Cheddar cheese',
        price: 5.5,
        imageUrl: 'https://via.placeholder.com/300?text=Cheese',
        categoryId: categoryMap.get('Dairy'),
        stock: 80,
        isActive: true,
      },
      {
        name: 'Yogurt',
        description: 'Greek yogurt',
        price: 2.8,
        imageUrl: 'https://via.placeholder.com/300?text=Yogurt',
        categoryId: categoryMap.get('Dairy'),
        stock: 100,
        isActive: true,
      },
      // Bakery
      {
        name: 'Bread',
        description: 'Whole wheat bread',
        price: 2.5,
        imageUrl: 'https://via.placeholder.com/300?text=Bread',
        categoryId: categoryMap.get('Bakery'),
        stock: 50,
        isActive: true,
      },
      {
        name: 'Croissant',
        description: 'Fresh croissant',
        price: 1.8,
        imageUrl: 'https://via.placeholder.com/300?text=Croissant',
        categoryId: categoryMap.get('Bakery'),
        stock: 60,
        isActive: true,
      },
      // Meat & Fish
      {
        name: 'Chicken',
        description: 'Fresh chicken breast',
        price: 8.5,
        imageUrl: 'https://via.placeholder.com/300?text=Chicken',
        categoryId: categoryMap.get('Meat & Fish'),
        stock: 40,
        isActive: true,
      },
      {
        name: 'Salmon',
        description: 'Fresh salmon fillet',
        price: 12.5,
        imageUrl: 'https://via.placeholder.com/300?text=Salmon',
        categoryId: categoryMap.get('Meat & Fish'),
        stock: 30,
        isActive: true,
      },
      // Pantry Staples
      {
        name: 'Rice',
        description: 'White rice 1kg',
        price: 2.0,
        imageUrl: 'https://via.placeholder.com/300?text=Rice',
        categoryId: categoryMap.get('Pantry Staples'),
        stock: 300,
        isActive: true,
      },
      {
        name: 'Oil',
        description: 'Olive oil 500ml',
        price: 6.5,
        imageUrl: 'https://via.placeholder.com/300?text=Oil',
        categoryId: categoryMap.get('Pantry Staples'),
        stock: 100,
        isActive: true,
      },
    ];

    const createdProducts = await this.productModel.insertMany(products);
    console.log(`✓ ${createdProducts.length} products created successfully`);
  }

  private async seedDeliveryPersons() {
    // Delete existing delivery profiles to recreate with new data
    await this.deliveryProfileModel.deleteMany({});

    // Create approved delivery person users with Sri Lankan locations
    const deliveryPersons = [
      {
        email: 'delivery1@grocerydelivery.com',
        password: 'DELIVERY@123456',
        fullName: 'Roshan Perera',
        phone: '+94701234567',
        role: 'DELIVERY_PERSON',
        isActive: true,
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        latitude: 6.9271,
        longitude: 80.6369,
        vehicleType: 'Motorcycle',
        rating: 4.8,
      },
      {
        email: 'delivery2@grocerydelivery.com',
        password: 'DELIVERY@123456',
        fullName: 'Samanthi Jayawardena',
        phone: '+94702345678',
        role: 'DELIVERY_PERSON',
        isActive: true,
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        latitude: 6.9300 + Math.random() * 0.02,
        longitude: 80.6400 + Math.random() * 0.02,
        vehicleType: 'Car',
        rating: 4.9,
      },
      {
        email: 'delivery3@grocerydelivery.com',
        password: 'DELIVERY@123456',
        fullName: 'Kasun Silva',
        phone: '+94703456789',
        role: 'DELIVERY_PERSON',
        isActive: true,
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        latitude: 6.9250 + Math.random() * 0.02,
        longitude: 80.6350 + Math.random() * 0.02,
        vehicleType: 'Bike',
        rating: 4.7,
      },
      {
        email: 'delivery4@grocerydelivery.com',
        password: 'DELIVERY@123456',
        fullName: 'Priya Senevirathne',
        phone: '+94704567890',
        role: 'DELIVERY_PERSON',
        isActive: true,
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        latitude: 6.9280 + Math.random() * 0.02,
        longitude: 80.6380 + Math.random() * 0.02,
        vehicleType: 'Motorcycle',
        rating: 4.6,
      },
      {
        email: 'delivery5@grocerydelivery.com',
        password: 'DELIVERY@123456',
        fullName: 'Nimal Gunarathne',
        phone: '+94705678901',
        role: 'DELIVERY_PERSON',
        isActive: true,
        city: 'Colombo',
        district: 'Colombo',
        province: 'Western',
        latitude: 6.9310 + Math.random() * 0.02,
        longitude: 80.6420 + Math.random() * 0.02,
        vehicleType: 'Car',
        rating: 4.5,
      },
    ];

    for (const personData of deliveryPersons) {
      const existingUser = await this.userModel.findOne({
        email: personData.email.toLowerCase(),
      });

      let userId: string;

      if (existingUser) {
        userId = existingUser._id.toString();
      } else {
        const hashedPassword = await bcrypt.hash(personData.password, 10);
        const newUser = new this.userModel({
          email: personData.email.toLowerCase(),
          password: hashedPassword,
          fullName: personData.fullName,
          phone: personData.phone,
          role: personData.role,
          isActive: personData.isActive,
        });
        await newUser.save();
        userId = newUser._id.toString();
      }

      // Create delivery profile with APPROVED status
      const existingProfile = await this.deliveryProfileModel.findOne({
        userId,
      });

      if (!existingProfile) {
        const deliveryProfile = new this.deliveryProfileModel({
          userId,
          city: personData.city,
          district: personData.district,
          province: personData.province,
          latitude: personData.latitude,
          longitude: personData.longitude,
          vehicleType: personData.vehicleType,
          status: 'APPROVED',
          isApproved: true,
          approvedAt: new Date(),
          averageRating: personData.rating,
          totalRatings: Math.floor(personData.rating * 10),
          totalDeliveries: Math.floor(personData.rating * 20),
        });
        await deliveryProfile.save();
      }
    }

    console.log('✓ 5 Approved delivery person profiles created with Sri Lankan locations');
  }
}
