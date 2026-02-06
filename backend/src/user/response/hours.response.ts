import { ApiProperty } from '@nestjs/swagger';

export class TotalNowHackatimeHoursResponse {
  @ApiProperty({ description: 'Total Hackatime hours since now' })
  totalNowHackatimeHours: number;
}

export class TotalApprovedHoursResponse {
  @ApiProperty({ description: 'Total approved hours' })
  totalApprovedHours: number;
}

export class RecalculateHoursResponse {
  @ApiProperty({ description: 'Whether recalculation was successful' })
  success: boolean;

  @ApiProperty({ description: 'Response message', required: false })
  message?: string;
}
