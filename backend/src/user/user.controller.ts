import { Controller, Post, Put, Body, Req, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { SlackLinkDto } from './dto/slack-link.dto';
import { SlackService } from '../slack/slack.service';
import {
  UpdateUserResponse,
  SlackLinkResponse,
} from './response';
import * as express from 'express';

@ApiTags('User')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly slackService: SlackService,
  ) {}

  @Put('api/user')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UpdateUserResponse, description: 'User updated successfully' })
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: express.Request) {
    const userId = req.user.userId;
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Post('api/user/slack/link')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(200)
  @ApiOperation({ summary: 'Link Slack account with token' })
  @ApiOkResponse({ type: SlackLinkResponse, description: 'Slack account linked successfully' })
  async linkSlackAccount(@Body() slackLinkDto: SlackLinkDto, @Req() req: express.Request) {
    const userId = req.user.userId;
    if (!slackLinkDto.token || typeof slackLinkDto.token !== 'string' || slackLinkDto.token.length !== 64) {
      return { success: false, message: 'Invalid token format.' };
    }
    return this.slackService.linkSlackAccountWithToken(slackLinkDto.token, userId);
  }
}
