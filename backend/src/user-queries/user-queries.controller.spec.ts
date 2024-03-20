import { Test, TestingModule } from "@nestjs/testing";
import { UserQueriesController } from "./user-queries.controller";
import { UserQueriesService } from "./user-queries.service";

describe("UserQueriesController", () => {
  let controller: UserQueriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserQueriesController],
      providers: [UserQueriesService],
    }).compile();

    controller = module.get<UserQueriesController>(UserQueriesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
