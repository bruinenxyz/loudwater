export enum ObjectPath {
  ROOT = "/view/blueprints",
  DEFINITION = "/view/blueprints/([^/]+)$",
  DETAIL = "/view/blueprints/([^/]+)/object/([^/]+)$",
  UPDATE = "/view/blueprints/([^/]+)/object/([^/]+)/update-object$",
  DELETE = "/view/blueprints/([^/]+)/object/([^/]+)/delete-object$",
}

export enum WorkbookPath {
  ROOT = "/view/workbooks",
  DETAIL = "/view/workbooks/([^/]+)$",
}

export enum PipelinePath {
  ROOT = "/view/pipelines",
  DETAIL = "/view/pipelines/([^/]+)$",
}

export const PATH_MAP: Record<string, string> = {
  [ObjectPath.ROOT]: "Blueprints",
  [WorkbookPath.ROOT]: "Workbooks",
  [PipelinePath.ROOT]: "Pipelines",
};

export const DEFAULT_MIN_LENGTH_TO_SHOW = 1;
