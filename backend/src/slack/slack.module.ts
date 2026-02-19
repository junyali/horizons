import { Module } from '@nestjs/common';
import { SlackService } from './slack.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [SlackService, PrismaService],
  exports: [SlackService],
})
export class SlackModule {}
