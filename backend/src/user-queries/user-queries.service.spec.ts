import { Test, TestingModule } from "@nestjs/testing";
import { UserQueriesService } from "./user-queries.service";

describe("UserQueriesService", () => {
  let service: UserQueriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserQueriesService],
    }).compile();

    service = module.get<UserQueriesService>(UserQueriesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
