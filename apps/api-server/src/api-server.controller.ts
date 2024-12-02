import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiServerService } from './api-server.service';
import { BridgeEventsResponse } from './dto/bridge.events.response';

@Controller()
export class ApiServerController {
  constructor(private readonly apiServerService: ApiServerService) {}

  @Get('bridge-events')
  async getBridgeEvents(
    @Query('fromBlock') fromBlockString: string,
    @Query('toBlock') toBlockString: string,
  ): Promise<BridgeEventsResponse> {
    if (!fromBlockString || !toBlockString) {
      throw new BadRequestException(
        'Both "fromBlock" and "toBlock" query parameters are required!',
      );
    }
    const fromBlock = parseInt(fromBlockString, 10);
    const toBlock = parseInt(toBlockString, 10);
    if (isNaN(fromBlock) || isNaN(toBlock)) {
      throw new BadRequestException(
        '"fromBlock" and "toBlock" must be valid numbers!',
      );
    }
    if (fromBlock > toBlock) {
      throw new BadRequestException('"fromBlock" should be <= "toBlock"!');
    }
    if (toBlock - fromBlock > 1000) {
      throw new BadRequestException('The block range should not exceed 1000!');
    }

    return this.apiServerService
      .getBridgeEvents(fromBlock, toBlock)
      .then((result) => {
        return new BridgeEventsResponse(result);
      });
  }
}
