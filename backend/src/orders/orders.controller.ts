import {
  Controller,
  Get,
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
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AssignOrderDto } from './dto/assign-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('CUSTOMER')
  @ApiOperation({ summary: 'Create order (checkout) - Customer only' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Cart is empty or invalid' })
  async create(
    @CurrentUser() user: any,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get orders (role-based filtering)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  async findAll(
    @CurrentUser() user: any,
    @Query() queryDto: QueryOrdersDto,
  ) {
    return this.ordersService.findAll(user.id, user.role, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(id, user.id, user.role);
  }

  @Post(':id/assign')
  @Roles('CSR')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign delivery person to order (CSR only)' })
  @ApiResponse({
    status: 200,
    description: 'Order assigned successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid assignment' })
  async assignOrder(
    @Param('id') orderId: string,
    @Body() assignDto: AssignOrderDto,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.assignOrder(orderId, assignDto, user.id);
  }

  @Post(':id/accept')
  @Roles('DELIVERY_PERSON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept assigned order (Delivery Person only)',
  })
  @ApiResponse({ status: 200, description: 'Order accepted successfully' })
  async acceptOrder(@Param('id') orderId: string, @CurrentUser() user: any) {
    return this.ordersService.acceptOrder(orderId, user.id);
  }

  @Post(':id/reject')
  @Roles('DELIVERY_PERSON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject assigned order (Delivery Person only)',
  })
  @ApiResponse({ status: 200, description: 'Order rejected successfully' })
  async rejectOrder(@Param('id') orderId: string, @CurrentUser() user: any) {
    return this.ordersService.rejectOrder(orderId, user.id);
  }

  @Post(':id/deliver')
  @Roles('DELIVERY_PERSON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark order as delivered (Delivery Person only)',
  })
  @ApiResponse({ status: 200, description: 'Order marked as delivered' })
  async markAsDelivered(
    @Param('id') orderId: string,
    @CurrentUser() user: any,
  ) {
    return this.ordersService.markAsDelivered(orderId, user.id);
  }
}
