import * as path from "path";

import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function setupSwagger(app: INestApplication) {
  const apiPrefix = process.env.API_GLOBAL_PREFIX || "";
  const options = new DocumentBuilder()
    .addServer(apiPrefix)
    .setTitle("Bruinen API")
    .setDescription("The Swagger for Bruinen APIs")
    .setVersion("1.0")
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(path.join(apiPrefix, "documentation"), app, document, {
    swaggerOptions: {
      showCommonExtensions: true,
      showExtensions: true,
    },
  });
}
