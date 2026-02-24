import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseSeedService } from './seed';
import { User, UserSchema } from './schemas/user.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { Product, ProductSchema } from './schemas/product.schema';
import { DeliveryProfile, DeliveryProfileSchema } from './schemas/delivery-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Product.name, schema: ProductSchema },
      { name: DeliveryProfile.name, schema: DeliveryProfileSchema },
    ]),
  ],
  providers: [DatabaseSeedService],
})
export class DatabaseSeedModule {}
