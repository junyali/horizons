import { ApiProperty } from '@nestjs/swagger';

export class HackatimeProjectResponse {
  @ApiProperty({ description: 'Project ID' })
  id: number;

  @ApiProperty({ description: 'Project name' })
  name: string;

  @ApiProperty({ description: 'Total seconds logged', required: false })
  totalSeconds?: number;
}

export class HackatimeProjectsResponse {
  @ApiProperty({ description: 'List of Hackatime projects', type: [HackatimeProjectResponse] })
  projects: HackatimeProjectResponse[];
}
