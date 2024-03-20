import useSWR from "swr";
import { CleanDatabase, CreateDatabase } from "@/definitions";
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

export const useCreateDatabase = () => {
  const { data, error, trigger, isMutating } = useSWRMutation(
    "/databases",
    (url: string, { arg }: { arg: CreateDatabase }) => backendCreate(url, arg),
  );

  return { data, error, trigger, isMutating };
};
