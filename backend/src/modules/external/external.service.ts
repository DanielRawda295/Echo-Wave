import { Injectable } from '@nestjs/common';

@Injectable()
export class ExternalService {
  async search(query: string): Promise<any> {
    // Placeholder for external API logic
    return { message: `Search executed for query: ${query}` };
  }
}