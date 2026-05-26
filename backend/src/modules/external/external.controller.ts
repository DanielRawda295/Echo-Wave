import { Controller, Post, Body } from '@nestjs/common';
import { ExternalService } from './external.service';
import { SearchDto } from './dto/search.dto';

@Controller('external')
export class ExternalController {
  constructor(private readonly externalService: ExternalService) {}

  @Post('search')
  handleSearch(@Body() dto: SearchDto) {
    return this.externalService.search(dto.query);
  }
}