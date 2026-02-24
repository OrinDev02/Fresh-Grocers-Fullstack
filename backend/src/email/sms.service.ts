import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SMSMessage {
  phone: string;
  message: string;
}

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);
  private smsProvider: string;
  private smsApiKey: string;

  constructor(private configService: ConfigService) {
    this.smsProvider = this.configService.get('SMS_PROVIDER', 'mock');
    this.smsApiKey = this.configService.get('SMS_API_KEY', '');
  }

  /**
   * Send SMS confirmation when CSR places an order for customer
   */
  async sendOrderConfirmation(
    customerPhone: string,
    customerName: string,
    orderNumber: string,
    totalAmount: number,
  ): Promise<boolean> {
    try {
      const message = `Dear ${customerName}, Your order ${orderNumber} has been placed successfully. Total Amount: ${totalAmount.toFixed(2)}. Our delivery team will contact you soon. Thank you for shopping with Fresh Grocers!`;

      return await this.sendSMS({
        phone: customerPhone,
        message,
      });
    } catch (error) {
      this.logger.error(`Failed to send order confirmation SMS to ${customerPhone}:`, error);
      return false;
    }
  }

  /**
   * Send SMS with delivery assignment details
   */
  async sendDeliveryAssignmentNotification(
    customerPhone: string,
    customerName: string,
    deliveryPersonName: string,
    deliveryPersonPhone: string,
    orderNumber: string,
  ): Promise<boolean> {
    try {
      const message = `Dear ${customerName}, Your order ${orderNumber} has been assigned to ${deliveryPersonName}. They will deliver your order soon. Contact: ${deliveryPersonPhone}. Thank you!`;

      return await this.sendSMS({
        phone: customerPhone,
        message,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send delivery assignment SMS to ${customerPhone}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Generic SMS sending method
   */
  private async sendSMS(smsMessage: SMSMessage): Promise<boolean> {
    try {
      if (this.smsProvider === 'mock' || !this.smsApiKey) {
        // Mock implementation for development
        this.logger.log(
          `[MOCK SMS] To: ${smsMessage.phone}, Message: ${smsMessage.message}`,
        );
        return true;
      }

      // TODO: Integrate actual SMS provider (Twilio, AWS SNS, etc.)
      // Example with Twilio:
      // const client = twilio(accountSid, authToken);
      // await client.messages.create({
      //   body: smsMessage.message,
      //   from: '+1234567890',
      //   to: smsMessage.phone,
      // });

      this.logger.log(`SMS sent to ${smsMessage.phone}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending SMS:`, error);
      return false;
    }
  }
}
