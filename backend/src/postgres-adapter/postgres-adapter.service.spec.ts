import { Test, TestingModule } from "@nestjs/testing";
import { PostgresAdapterService } from "./postgres-adapter.service";

describe("PostgresAdapterService", () => {
  let service: PostgresAdapterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostgresAdapterService],
    }).compile();

    service = module.get<PostgresAdapterService>(PostgresAdapterService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
