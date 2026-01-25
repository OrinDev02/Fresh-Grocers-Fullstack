import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from '../database/schemas/user.schema';
import { DeliveryProfile, DeliveryProfileDocument } from '../database/schemas/delivery-profile.schema';
import { PasswordReset, PasswordResetDocument } from '../database/schemas/password-reset.schema';
import { RegisterCustomerDto } from './dto/register-customer.dto';
import { RegisterDeliveryDto } from './dto/register-delivery.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DeliveryProfile.name)
    private deliveryProfileModel: Model<DeliveryProfileDocument>,
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordResetDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async registerCustomer(registerDto: RegisterCustomerDto) {
    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = new this.userModel({
      ...registerDto,
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      role: 'CUSTOMER',
    });

    await user.save();

    await this.emailService.sendCustomerRegisterConfirmation(
    user.email,
    user.fullName,
  );

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role as any,
    };

    const tokens = await this.generateTokens(payload);

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    };
  }

  async registerDelivery(registerDto: RegisterDeliveryDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.userModel.findOne({
      email: registerDto.email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = new this.userModel({
      fullName: registerDto.fullName,
      email: registerDto.email.toLowerCase(),
      phone: registerDto.phone,
      password: hashedPassword,
      role: 'DELIVERY_PERSON',
    });

    await user.save();

    const deliveryProfile = new this.deliveryProfileModel({
      userId: user._id,
      city: registerDto.city,
      district: registerDto.district,
      province: registerDto.province,
      latitude: registerDto.latitude,
      longitude: registerDto.longitude,
      vehicleType: registerDto.vehicleType,
      status: 'PENDING',
      isApproved: false,
    });

    await deliveryProfile.save();

    return {
      message: 'Registration successful. Waiting for approval.',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userModel
      .findOne({ email: loginDto.email.toLowerCase() })
      .exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role as any,
    };

    const tokens = await this.generateTokens(payload);

    return {
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret',
      });

      const user = await this.userModel.findById(payload.sub).exec();

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      const newPayload: JwtPayload = {
        sub: user._id.toString(),
        email: user.email,
        role: user.role as any,
      };

      return this.generateTokens(newPayload);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      email: forgotPasswordDto.email.toLowerCase(),
    });

    if (!user) {
      // Don't reveal if email exists
      return {
        message: 'If the email exists, a password reset OTP has been sent.',
      };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Delete old OTPs for this email
    await this.passwordResetModel.deleteMany({
      email: forgotPasswordDto.email.toLowerCase(),
    });

    // Create new OTP record
    const passwordReset = new this.passwordResetModel({
      email: forgotPasswordDto.email.toLowerCase(),
      otp,
      expiresAt,
    });

    await passwordReset.save();

    // Send email
    await this.emailService.sendPasswordResetOTP(
      forgotPasswordDto.email,
      otp,
    );

    return {
      message: 'If the email exists, a password reset OTP has been sent.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const passwordReset = await this.passwordResetModel.findOne({
      email: resetPasswordDto.email.toLowerCase(),
      otp: resetPasswordDto.otp,
      used: false,
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > passwordReset.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    const user = await this.userModel.findOne({
      email: resetPasswordDto.email.toLowerCase(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    passwordReset.used = true;
    await passwordReset.save();

    return {
      message: 'Password reset successfully',
    };
  }

  private async generateTokens(payload: JwtPayload) {
    const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-secret';
    const jwtRefreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: jwtSecret,
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '15m',
      } as any),
      this.jwtService.signAsync(payload, {
        secret: jwtRefreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      } as any),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
