import { Test, TestingModule } from "@nestjs/testing";
import { TrackingService } from "./tracking.service";

describe("TrackingService", () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackingService],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
