import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { GiftCodesService } from './gift-codes.service';
import { SendGiftCodesDto } from './dto/send-gift-codes.dto';
import { Public } from '../auth/public.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Controller('api/gift-codes')
@Public()
export class GiftCodesController {
  constructor(private giftCodesService: GiftCodesService) {}

  @Get(':code')
  async getGiftCode(@Param('code') code: string) {
    return this.giftCodesService.getGiftCodeByCode(code);
  }

  @Post(':code/claim')
  async claimGiftCode(@Param('code') code: string) {
    return this.giftCodesService.markCodeAsClaimed(code);
  }
}

@Controller('api/admin/gift-codes')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class GiftCodesAdminController {
  constructor(private giftCodesService: GiftCodesService) {}

  @Post('send')
  async sendGiftCodes(@Body() dto: SendGiftCodesDto) {
    return this.giftCodesService.sendGiftCodes(dto);
  }

  @Get()
  async getAllGiftCodes() {
    return this.giftCodesService.getAllGiftCodes();
  }
}


