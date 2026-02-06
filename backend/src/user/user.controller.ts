import { Controller, Post, Get, Put, Body, Req, Res, HttpCode, Param, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserService } from './user.service';
import { InitialRsvpDto } from './dto/initial-rsvp.dto';
import { CompleteRsvpDto } from './dto/complete-rsvp.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SlackLinkDto } from './dto/slack-link.dto';
import { Public } from '../auth/public.decorator';
import { SlackService } from '../slack/slack.service';
import {
  HealthResponse,
  UpdateUserResponse,
  HackatimeProjectsResponse,
  TotalNowHackatimeHoursResponse,
  TotalApprovedHoursResponse,
  RecalculateHoursResponse,
  HackatimeAccountStatusResponse,
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

  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiOkResponse({ type: HealthResponse, description: 'Service is healthy' })
  getHealth() {
    return this.userService.getHealth();
  }

  @Put('api/user')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UpdateUserResponse, description: 'User updated successfully' })
  async updateUser(@Body() updateUserDto: UpdateUserDto, @Req() req: express.Request) {
    const userId = req.user.userId;
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Get('api/user/hackatime-projects/unlinked')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get unlinked Hackatime projects for current user' })
  @ApiOkResponse({ type: HackatimeProjectsResponse, description: 'List of unlinked Hackatime projects' })
  async getHackatimeProjects(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.getUnlinkedHackatimeProjects(userEmail);
  }

  @Get('api/user/hackatime-projects/linked/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get linked Hackatime projects for a specific project' })
  @ApiParam({ name: 'id', description: 'Project ID', type: Number })
  @ApiOkResponse({ type: HackatimeProjectsResponse, description: 'List of linked Hackatime projects' })
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
  @ApiOperation({ summary: 'Get all Hackatime projects for current user' })
  @ApiOkResponse({ type: HackatimeProjectsResponse, description: 'List of all Hackatime projects' })
  async getAllHackatimeProjects(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.getAllHackatimeProjects(userEmail);
  }

  @Get('api/user/projects/now-hackatime-hours/total')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get total Hackatime hours since now for current user' })
  @ApiOkResponse({ type: TotalNowHackatimeHoursResponse, description: 'Total Hackatime hours' })
  async getTotalNowHackatimeHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    const total = await this.userService.getTotalNowHackatimeHours(userId);
    return { totalNowHackatimeHours: total };
  }

  @Get('api/user/projects/approved-hours/total')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get total approved hours for current user' })
  @ApiOkResponse({ type: TotalApprovedHoursResponse, description: 'Total approved hours' })
  async getTotalApprovedHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    const total = await this.userService.getTotalApprovedHours(userId);
    return { totalApprovedHours: total };
  }

  @Post('api/user/projects/now-hackatime-hours/recalculate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Recalculate Hackatime hours for current user' })
  @ApiOkResponse({ type: RecalculateHoursResponse, description: 'Hours recalculated successfully' })
  async recalculateNowHackatimeHours(@Req() req: express.Request) {
    const userId = req.user.userId;
    return this.userService.recalculateNowHackatimeHours(userId);
  }

  @Get('api/user/hackatime-account')
  @Throttle({ default: { ttl: 3600000, limit: 1000000 } }) 
  @HttpCode(200)
  @ApiOperation({ summary: 'Check Hackatime account status for current user' })
  @ApiOkResponse({ type: HackatimeAccountStatusResponse, description: 'Hackatime account status' })
  async checkHackatimeAccount(@Req() req: express.Request) {
    const userEmail = req.user.email;
    return this.userService.checkHackatimeAccountStatus(userEmail);
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
