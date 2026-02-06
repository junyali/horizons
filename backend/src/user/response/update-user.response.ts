import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserResponse {
  @ApiProperty({ description: 'Whether the update was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message' })
  message: string;
}
