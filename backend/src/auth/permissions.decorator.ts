import { Reflector } from "@nestjs/core";

export const Permissions = Reflector.createDecorator<string>();

export const PERMISSIONS = {
  EDIT_ONTOLOGY: "org:ontology:edit",
  READ_ONTOLOGY: "org:ontology:read",
  EDIT_SOURCES: "org:sources:edit",
  READ_SOURCES: "org:sources:read",
  EDIT_PIPELINES: "org:pipelines:edit",
  READ_PIPELINES: "org:pipelines:read",
  EDIT_DATASETS: "org:datasets:edit",
  READ_DATASETS: "org:datasets:read",
  EDIT_WORKBOOKS: "org:workbooks:edit",
  READ_WORKBOOKS: "org:workbooks:read",
};
