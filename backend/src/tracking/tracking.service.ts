import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { Analytics } from "@segment/analytics-node";

@Injectable()
export class TrackingService {
  constructor(private readonly configService: ConfigService) {}
  @OnEvent("trackingEvent")
  handleTrackingEvent(eventData: any) {
    const eventObject = {
      name: `${eventData.controller.split("Controller")[0]} ${
        eventData.controllerMethod
      }`,
      metadata: eventData,
    };

    const nodeEnv = this.configService.getOrThrow("nodeEnv");
    const segmentWriteKey = this.configService.get("segmentWriteKey");

    if (nodeEnv === "development") {
      console.log("Tracking Event: ", eventObject);
    } else if (segmentWriteKey) {
      const analytics = new Analytics({
        writeKey: segmentWriteKey,
      });

      analytics.track({
        userId: eventData.userId,
        event: eventObject.name,
        properties: eventObject.metadata,
      });
    }
  }
}
