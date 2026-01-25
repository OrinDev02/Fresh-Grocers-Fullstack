import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private templatesPath: string;
  private templateCache: Map<string, string> = new Map();

  constructor(private configService: ConfigService) {
    this.templatesPath = path.join(__dirname, 'templates');
  }

  private async loadTemplate(templateName: string): Promise<string> {
    try {
      // Check cache first
      if (this.templateCache.has(templateName)) {
        return this.templateCache.get(templateName)!;
      }

      const templatePath = path.join(this.templatesPath, `${templateName}.html`);
      
      // Check if file exists
      try {
        await fs.access(templatePath);
      } catch (error) {
        this.logger.warn(`Template ${templateName}.html not found, using fallback`);
        return this.getFallbackTemplate(templateName);
      }

      const template = await fs.readFile(templatePath, 'utf-8');
      this.templateCache.set(templateName, template);
      return template;
    } catch (error) {
      this.logger.error(`Error loading template ${templateName}:`, error);
      return this.getFallbackTemplate(templateName);
    }
  }

  private getFallbackTemplate(templateName: string): string {
    // Fallback HTML templates if files don't exist
    const fallbacks = {
      'layout': `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>{{title}}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
            .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>{{title}}</h1></div>
          <div class="content">{{content}}</div>
          <div class="footer">© 2025 Grocery Delivery. All rights reserved.</div>
        </body>
        </html>
      `,
      'customer-register': `
        <h2>Welcome, {{fullName}}!</h2>
        <p>Thank you for registering with Grocery Delivery.</p>
        <p>Your account has been successfully created and you can now start shopping for fresh groceries.</p>
        <p>We're excited to serve you!</p>
        <p>Best regards,<br>The Grocery Delivery Team</p>
      `,
      'password-reset': `
        <h2>Password Reset Request</h2>
        <p>You requested to reset your password.</p>
        <p>Your OTP code is: <strong style="font-size: 24px; color: #4CAF50;">{{otp}}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      'delivery-approval': `
        <h2>Congratulations, {{fullName}}!</h2>
        <p>Your delivery person account has been approved.</p>
        <p>You can now log in to your dashboard and start accepting delivery orders.</p>
        <p><a href="{{dashboardUrl}}" style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a></p>
        <p>Welcome to the team!</p>
      `,
      'order-confirmation': `
        <h2>Order Confirmed!</h2>
        <p>Hi {{customerName}},</p>
        <p>Your order <strong>#{{orderNumber}}</strong> has been confirmed.</p>
        <p><strong>Total Amount:</strong> Rs. {{totalAmount}}</p>
        <p><strong>Delivery Address:</strong><br>
        {{deliveryAddress.street}}<br>
        {{deliveryAddress.district}}, {{deliveryAddress.city}}<br>
        {{deliveryAddress.province}}</p>
        <p>Your order is being prepared and will be delivered soon.</p>
      `
    };

    return fallbacks[templateName] || '<p>{{content}}</p>';
  }

  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    // Handle nested objects (like deliveryAddress)
    const flatVariables = this.flattenObject(variables);
    
    for (const [key, value] of Object.entries(flatVariables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      rendered = rendered.replace(regex, String(value || ''));
    }
    return rendered;
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }

  private async wrapInLayout(content: string, title: string = 'Grocery Delivery'): Promise<string> {
    const layout = await this.loadTemplate('layout');
    return this.renderTemplate(layout, { content, title });
  }

  private async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const senderEmail = this.configService.get<string>('BREVO_SENDER_EMAIL');

    if (!apiKey || !senderEmail) {
      throw new Error('Brevo API key or sender email is not configured');
    }

    const payload = {
      sender: { email: senderEmail },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
      textContent: text,
    };

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brevo API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      this.logger.log(`Email sent successfully to ${to}, messageId: ${data.messageId}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendPasswordResetOTP(email: string, otp: string): Promise<void> {
    const template = await this.loadTemplate('password-reset');
    const content = this.renderTemplate(template, { otp });
    const html = await this.wrapInLayout(content, 'Password Reset OTP');

    await this.sendEmail(
      email,
      'Password Reset OTP - Grocery Delivery',
      html,
      `Your password reset OTP is: ${otp}. This OTP will expire in 15 minutes.`,
    );
  }

  async sendDeliveryApproval(email: string, fullName: string): Promise<void> {
    const template = await this.loadTemplate('delivery-approval');
    const dashboardUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const content = this.renderTemplate(template, { fullName, dashboardUrl });
    const html = await this.wrapInLayout(content, 'Delivery Person Approval');

    await this.sendEmail(
      email,
      'Delivery Person Account Approved - Grocery Delivery',
      html,
      `Congratulations ${fullName}! Your delivery person account has been approved.`,
    );
  }

  async sendOrderConfirmation(
    email: string,
    orderNumber: string,
    orderDetails: any,
  ): Promise<void> {
    const template = await this.loadTemplate('order-confirmation');
    const content = this.renderTemplate(template, {
      customerName: orderDetails.customerName || 'Customer',
      orderNumber,
      totalAmount: orderDetails.totalAmount?.toFixed(2) || '0.00',
      deliveryAddress: {
        street: orderDetails.deliveryAddress?.street || '',
        district: orderDetails.deliveryAddress?.district || '',
        city: orderDetails.deliveryAddress?.city || '',
        province: orderDetails.deliveryAddress?.province || '',
      },
    });
    const html = await this.wrapInLayout(content, 'Order Confirmation');

    await this.sendEmail(
      email,
      `Order Confirmation - ${orderNumber}`,
      html,
      `Your order ${orderNumber} has been confirmed and is being prepared for delivery.`,
    );
  }

  async sendCustomerRegisterConfirmation(
    email: string,
    fullName: string,
  ): Promise<void> {
    const template = await this.loadTemplate('customer-register');
    const content = this.renderTemplate(template, { fullName });
    const html = await this.wrapInLayout(content, 'Welcome to Grocery Delivery');

    await this.sendEmail(
      email,
      'Welcome! Your Account Has Been Created',
      html,
      `Hi ${fullName}, your customer account has been successfully created!`,
    );
  }
}