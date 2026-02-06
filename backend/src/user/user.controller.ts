import { Controller, Post, Get, Put, Body, Req, Res, HttpCode, Param, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { InitialRsvpDto } from './dto/initial-rsvp.dto';
import { CompleteRsvpDto } from './dto/complete-rsvp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '../auth/public.decorator';
import { SlackService } from '../slack/slack.service';
import * as express from 'express';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly slackService: SlackService,
  ) {}

  @Get()
  @Public()
  getHealth() {
    return this.userService.getHealth();
  }

  @Put('api/user')
  @HttpCode(200)
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: express.Request) {
    const userId = req.user.userId;
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Get('api/user/hackatime-projects/unlinked')
  @HttpCode(200)
  async getHackatimeProjects(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.getUnlinkedHackatimeProjects(userEmail);
  }

  @Get('api/user/hackatime-projects/linked/:id')
  @HttpCode(200)
  async getHackatimeProject(@Param('id') id: string, @Req() req: express.Request) {
    const userEmail = req.user.email;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    return this.userService.getLinkedHackatimeProjects(userEmail, projectId);
  }

  @Get('api/user/hackatime-projects/all')
  @HttpCode(200)
  async getAllHackatimeProjects(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.getAllHackatimeProjects(userEmail);
  }

  @Get('api/user/projects/now-hackatime-hours/total')
  @HttpCode(200)
  async getTotalNowHackatimeHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    const total = await this.userService.getTotalNowHackatimeHours(userId);
    return { totalNowHackatimeHours: total };
  }

  @Get('api/user/projects/approved-hours/total')
  @HttpCode(200)
  async getTotalApprovedHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    const total = await this.userService.getTotalApprovedHours(userId);
    return { totalApprovedHours: total };
  }

  @Post('api/user/projects/now-hackatime-hours/recalculate')
  @HttpCode(200)
  async recalculateNowHackatimeHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    return this.userService.recalculateNowHackatimeHours(userId);
  }

  @Get('api/user/hackatime-account')
  @Throttle({ default: { ttl: 3600000, limit: 1000000 } }) 
  @HttpCode(200)
  async checkHackatimeAccount(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.checkHackatimeAccountStatus(userEmail);
  }

  @Post('api/user/slack/link')
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(200)
  async linkSlackAccount(@Body() body: { token: string }, @Req() req: express.Request) {
    const userId = req.user.userId;
    if (!body.token || typeof body.token !== 'string' || body.token.length !== 64) {
      return { success: false, message: 'Invalid token format.' };
    }
    return this.slackService.linkSlackAccountWithToken(body.token, userId);
  }
}
