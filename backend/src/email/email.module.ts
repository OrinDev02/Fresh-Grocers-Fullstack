import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { SMSService } from './sms.service';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, SMSService],
  exports: [EmailService, SMSService],
})
export class EmailModule {}
