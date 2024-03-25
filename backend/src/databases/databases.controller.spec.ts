import { Test, TestingModule } from "@nestjs/testing";
import { DatabasesController } from "./databases.controller";
import { DatabasesService } from "./databases.service";

describe("DatabasesController", () => {
  let controller: DatabasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatabasesController],
      providers: [DatabasesService],
    }).compile();

    controller = module.get<DatabasesController>(DatabasesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
