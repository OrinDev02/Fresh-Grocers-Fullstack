import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class DatabaseSeedService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedCSRUser();
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
    console.log('CSR user created successfully');
    console.log(`Email: ${csrEmail}`);
    console.log(`Password: ${csrPassword}`);
    console.log('Please change the password after first login!');
  }
}
