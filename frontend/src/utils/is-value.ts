import { QueryCreatorProperty } from "@/app/view/objects/[odef_id]/query/query-creator";

export const isValue = (property: QueryCreatorProperty) =>
  /^\".*\"$/.test(property.api_path);
