import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Ratings')
@Controller('ratings')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @Roles('CUSTOMER')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Rate delivery person after order delivery' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 400, description: 'Order already rated or invalid' })
  async create(
    @CurrentUser() user: any,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    return this.ratingsService.create(user.id, createRatingDto);
  }

  @Get('delivery-person/:id')
  @Public()
  @ApiOperation({ summary: 'Get all ratings for a delivery person' })
  @ApiResponse({
    status: 200,
    description: 'Ratings retrieved successfully',
  })
  async getDeliveryPersonRatings(@Param('id') deliveryPersonId: string) {
    return this.ratingsService.getDeliveryPersonRatings(deliveryPersonId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Check if order is rated' })
  @ApiResponse({ status: 200, description: 'Rating status retrieved' })
  async checkOrderRated(@Param('orderId') orderId: string) {
    return this.ratingsService.checkOrderRated(orderId);
  }
}
