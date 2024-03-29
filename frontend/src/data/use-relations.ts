import useSWR, { useSWRConfig } from "swr";
import {
  backendCreate,
  backendDelete,
  backendGet,
  backendUpdate,
} from "./client";
import useSWRMutation from "swr/mutation";
import { CreateRelation, Relation, UpdateRelation } from "@/definitions";
import * as _ from "lodash";

export function useRelations(databaseId?: string) {
  const { mutate } = useSWRConfig();

  const { data, isLoading, isValidating, error } = useSWR<Relation[]>(
    databaseId ? `/relations/db/${databaseId}` : null,
    backendGet,
  );

  // Update the individual relation caches with the data returned from the server
  _.forEach(data, (relation: Relation) => {
    mutate(`/relations/${relation.id}`, relation);
  });

  return { data, isLoading, isValidating, error };
}

export const useRelation = (id?: string) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<Relation>(
    id ? `/relations/${id}` : null,
    backendGet,
  );

  return { data, error, isLoading, isValidating, mutate };
};

export const useCreateRelation = (databaseId: string) => {
  const { mutate } = useSWRConfig();
  const { data, error, trigger, isMutating } = useSWRMutation(
    "/relations",
    async (url: string, { arg }: { arg: CreateRelation }) => {
      const createdRelation = await backendCreate(url, arg);

      mutate(`/relations/db/${databaseId}`, createdRelation, {
        populateCache: (
          result: Relation,
          currentData: Relation[] | undefined,
        ) => {
          return [...(currentData || []), result];
        },
      });

      return createdRelation;
    },
  );
  return { data, error, trigger, isMutating };
};

export const useUpdateRelation = () => {
  const { mutate } = useSWRConfig();
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/relations`,
    async (
      url: string,
      { arg }: { arg: { id: string; update: UpdateRelation } },
    ) => {
      const updateRelationResponse = await backendUpdate(
        `${url}/${arg.id}`,
        arg.update,
      );

      mutate(`/relations/${arg.id}`, updateRelationResponse, false);
      mutate(`/tables/db/${updateRelationResponse.database_id}`);

      return updateRelationResponse;
    },
  );

  return { data, error, trigger, isMutating };
};

export const useDeleteRelation = (id?: string) => {
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/relations/${id}`,
    (url: string) => backendDelete(url),
  );

  return { data, error, trigger, isMutating };
};
