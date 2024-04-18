import { Test, TestingModule } from "@nestjs/testing";
import { LlmsService } from "./llms.service";

describe("LlmsService", () => {
  let service: LlmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LlmsService],
    }).compile();

    service = module.get<LlmsService>(LlmsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
