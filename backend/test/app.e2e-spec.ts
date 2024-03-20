import * as request from "supertest";

import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";

import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET) the text Hello World !!!", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!!!");
  });
});
