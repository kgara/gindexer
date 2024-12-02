import { Test, TestingModule } from '@nestjs/testing';
import { ApiServerController } from '../src/api-server.controller';
import { ApiServerService } from '../src/api-server.service';
import { BadRequestException } from '@nestjs/common';
import { BridgeEventsResponse } from '../src/dto/bridge.events.response';
import { BridgeEvent } from '@app/shared/entities/bridge.event';

describe('ApiServerController', () => {
  let controller: ApiServerController;
  let service: ApiServerService;

  const mockService = {
    getBridgeEvents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiServerController],
      providers: [
        {
          provide: ApiServerService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ApiServerController>(
      ApiServerController,
    ) as ApiServerController;
    service = module.get<ApiServerService>(
      ApiServerService,
    ) as ApiServerService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBridgeEvents', () => {
    it('should return bridge events for a valid block range', async () => {
      const mockResult: Array<BridgeEvent> = [
        {
          id: 3615,
          hash: '0x563c5279c089d97f6897ddee0939d3003f18477d3667cb451fb9d5011651ab7e',
          blockNumber: 21308180,
          amount: BigInt(2834664103575611646),
          toChainId: BigInt(8453),
          bridgeName:
            '0x709f58818bedd58450336213e1f2f6ff7405a2b1e594f64270a17b7e2249419c',
          token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
          sender: '0x1F2eEcc6635B46d458C5a0f2596395c5619e1319',
          receiver: '0x1F2eEcc6635B46d458C5a0f2596395c5619e1319',
          metadata:
            '0x00000000000000000000000000000000000000000000000000000000000008f2',
        },
      ];
      mockService.getBridgeEvents.mockResolvedValue(mockResult);

      const fromBlock = '21308170';
      const toBlock = '21308190';
      const result = await controller.getBridgeEvents(fromBlock, toBlock);

      expect(service.getBridgeEvents).toHaveBeenCalledWith(21308170, 21308190);
      expect(result).toEqual(new BridgeEventsResponse(mockResult));
    });

    it('should throw BadRequestException if fromBlock or toBlock is not provided', async () => {
      await expect(controller.getBridgeEvents('', '10')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getBridgeEvents('10', '')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if fromBlock or toBlock is not a number', async () => {
      await expect(controller.getBridgeEvents('abc', '10')).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getBridgeEvents('10', 'xyz')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if fromBlock is greater than toBlock', async () => {
      await expect(controller.getBridgeEvents('20', '10')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if block range exceeds 1000', async () => {
      await expect(controller.getBridgeEvents('1', '2001')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
