import useSWR, { useSWRConfig } from "swr";
import {
  CleanDatabase,
  CreateDatabase,
  ExternalColumn,
  UpdateDatabase,
} from "@/definitions";
import {
  backendCreate,
  backendGet,
  backendUpdate,
  backendDelete,
} from "@/data/client";
import * as _ from "lodash";
import useSWRMutation from "swr/mutation";

export const useDatabases = () => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    CleanDatabase[]
  >("/databases", backendGet, {
    onSuccess: (data) => {
      return [...data].sort((a, b) => (a.name <= b.name ? -1 : 1));
    },
  });
  return { data, error, isLoading, isValidating, mutate };
};

export const useDatabase = (id?: string) => {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<CleanDatabase>(id ? `/databases/${id}` : null, backendGet);
  return { data, error, isLoading, isValidating, mutate };
};

export const useCreateDatabase = () => {
  const { data, error, trigger, isMutating } = useSWRMutation(
    "/databases",
    (url: string, { arg }: { arg: CreateDatabase }) => backendCreate(url, arg),
  );

  return { data, error, trigger, isMutating };
};

export const useDatabaseSchemas = (id?: string) => {
  const { data, error, isLoading, isValidating, mutate } = useSWR<
    Record<string, Record<string, Record<string, ExternalColumn>>>
  >(id ? `/databases/${id}/schemas` : null, backendGet);
  return { data, error, isLoading, isValidating, mutate };
};

export const useUpdateDatabase = (id: string) => {
  const { mutate } = useSWRConfig();
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/databases/${id}`,
    async (url: string, { arg }: { arg: Partial<UpdateDatabase> }) => {
      const updateDatabaseResponse = await backendUpdate(url, arg);
      mutate(`/tables/db/${id}`);
      return updateDatabaseResponse;
    },
  );

  return { data, error, trigger, isMutating };
};

export const useDeleteDatabase = (id?: string) => {
  const { data, error, trigger, isMutating } = useSWRMutation<string[]>(
    id ? `/databases/${id}` : null,
    backendDelete,
  );
  return { data, error, trigger, isMutating };
};
