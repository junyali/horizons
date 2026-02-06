import { ApiProperty } from '@nestjs/swagger';

export class HackatimeAccountStatusResponse {
  @ApiProperty({ description: 'Whether a Hackatime account exists' })
  exists: boolean;

  @ApiProperty({ description: 'Whether the account is linked', required: false })
  linked?: boolean;
}
