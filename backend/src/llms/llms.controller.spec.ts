import { Test, TestingModule } from "@nestjs/testing";
import { LlmsController } from "./llms.controller";
import { LlmsService } from "./llms.service";

describe("LlmsController", () => {
  let controller: LlmsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LlmsController],
      providers: [LlmsService],
    }).compile();

    controller = module.get<LlmsController>(LlmsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
