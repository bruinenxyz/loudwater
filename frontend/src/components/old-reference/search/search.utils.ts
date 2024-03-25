import { OBJECT_DEFINITION_ID_REGEX } from "@/constants/regex";

export const isObjectDefinitionId = (id = "") => {
  return OBJECT_DEFINITION_ID_REGEX.test(id);
};
