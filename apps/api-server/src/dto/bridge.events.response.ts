import { BridgeEvent } from '@app/shared/entities/bridge.event';

export class BridgeEventsResponse {
  bridgeEvents: Array<BridgeEvent>;

  constructor(bridgeEvents: Array<BridgeEvent>) {
    this.bridgeEvents = bridgeEvents;
  }
}
