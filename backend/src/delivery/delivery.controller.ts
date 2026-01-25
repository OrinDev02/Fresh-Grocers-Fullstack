import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DeliveryService } from './delivery.service';
import { UpdateDeliveryProfileDto } from './dto/update-delivery-profile.dto';
import { ApproveDeliveryDto } from './dto/approve-delivery.dto';
import { NearbyDeliveryDto } from './dto/nearby-delivery.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Delivery')
@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('profile')
  @Roles('DELIVERY_PERSON')
  @ApiOperation({ summary: 'Get delivery person profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  async getProfile(@CurrentUser() user: any) {
    return this.deliveryService.getProfile(user.id);
  }

  @Put('profile')
  @Roles('DELIVERY_PERSON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update delivery person profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateDeliveryProfileDto,
  ) {
    return this.deliveryService.updateProfile(user.id, updateDto);
  }

  @Get('approval-status')
  @Roles('DELIVERY_PERSON')
  @ApiOperation({ summary: 'Check approval status' })
  @ApiResponse({
    status: 200,
    description: 'Approval status retrieved successfully',
  })
  async getApprovalStatus(@CurrentUser() user: any) {
    return this.deliveryService.getApprovalStatus(user.id);
  }

  @Post('approve/:id')
  @Roles('CSR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject delivery person (CSR only)' })
  @ApiResponse({
    status: 200,
    description: 'Delivery person approved/rejected successfully',
  })
  async approveDeliveryPerson(
    @Param('id') deliveryPersonId: string,
    @Body() approveDto: ApproveDeliveryDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveryService.approveDeliveryPerson(
      deliveryPersonId,
      approveDto,
      user.id,
    );
  }

  @Get('nearby')
  @Roles('CSR')
  @ApiOperation({ summary: 'Find nearby delivery persons (CSR only)' })
  @ApiResponse({
    status: 200,
    description: 'Nearby delivery persons retrieved successfully',
  })
  async findNearbyDeliveryPersons(@Query() nearbyDto: NearbyDeliveryDto) {
    return this.deliveryService.findNearbyDeliveryPersons(nearbyDto);
  }

  @Get('stats')
  @Roles('DELIVERY_PERSON')
  @ApiOperation({ summary: 'Get delivery person statistics' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  async getStats(@CurrentUser() user: any) {
    return this.deliveryService.getStats(user.id);
  }
}
