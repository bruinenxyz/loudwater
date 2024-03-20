import { usePathname } from "next/navigation";
import qs from "qs";

import { Pipeline } from "@/definitions";

const BASE_ROUTE = "";

const VIEW_ROUTE = BASE_ROUTE + "/view";

interface GetObjectViewPathParams {
  objectDefinitionId: string;
  objectId?: string;
}

interface GetObjectQueryPathParams {
  objectDefinitionId: string;
  query?: Pipeline | null;
}

const useViewNavigation = () => {
  const path = usePathname();

  const tab = path.split("/")[2];

  const objectDefinition = path.split("/")[3];

  const objectId = path.split("/")[4];

  const getObjectViewPath = ({
    objectDefinitionId,
    objectId,
  }: GetObjectViewPathParams) => {
    let tabId = tab;
    const path = `objects/${objectDefinitionId}${
      objectId ? `/${objectId}` : ""
    }`;

    return `${VIEW_ROUTE}/${path}`;
  };

  const getObjectQueryPath = ({
    objectDefinitionId,
    query = null,
  }: GetObjectQueryPathParams) => {
    const path = `workbooks/${query ? `?${qs.stringify(query)}` : ""}`;

    return `${VIEW_ROUTE}/${path}`;
  };

  return { getObjectViewPath, getObjectQueryPath };
};

export { BASE_ROUTE, useViewNavigation, VIEW_ROUTE };
