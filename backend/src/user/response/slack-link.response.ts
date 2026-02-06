import { ApiProperty } from '@nestjs/swagger';

export class SlackLinkResponse {
  @ApiProperty({ description: 'Whether linking was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;
}
