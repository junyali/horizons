import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class SlackLinkDto {
  @ApiProperty({ description: 'Slack linking token', minLength: 64, maxLength: 64 })
  @IsString()
  @Length(64, 64)
  token: string;
}
