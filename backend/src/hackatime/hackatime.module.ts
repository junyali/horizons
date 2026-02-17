import { Module } from '@nestjs/common';
import { HackatimeController } from './hackatime.controller';
import { HackatimeService } from './hackatime.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [HackatimeController],
  providers: [HackatimeService, PrismaService],
  exports: [HackatimeService],
})
export class HackatimeModule {}
