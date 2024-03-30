import useSWR, { useSWRConfig } from "swr";
import { backendCreate, backendGet, backendUpdate } from "./client";
import { CreateUserQuery, UserQuery } from "@/definitions";
import useSWRMutation from "swr/mutation";
import { useSelectedDatabase } from "@/stores";
import { Parameter } from "@/components/query/query-parameters";

export const useUserQuery = (queryId?: string) => {
  const { data, error, isLoading } = useSWR<UserQuery>(
    queryId ? `/user-queries/${queryId}` : null,
    backendGet,
  );
  return { data, error, isLoading };
};

export const useUserQueries = (databaseId: string) => {
  const { data, error, isLoading } = useSWR<UserQuery[]>(
    `/user-queries/db/${databaseId}`,
    backendGet,
  );
  return { data, error, isLoading };
};

export const useCreateUserQuery = () => {
  const { mutate } = useSWRConfig();
  const [selectedDatabase] = useSelectedDatabase();
  const { data, error, trigger, isMutating } = useSWRMutation(
    "/user-queries",
    async (url: string): Promise<UserQuery> => {
      const createUserQueryResponse = await backendCreate("/user-queries", {
        name: "New Query",
        description: "A new query",
        scope: "private",
        sql: "",
        type: "sql",
        database_id: selectedDatabase.id,
        permissions: {},
        favorited_by: [],
      });

      mutate(`/user-queries`, createUserQueryResponse, {
        populateCache: (result: UserQuery, currentData: UserQuery[]) => {
          currentData ? currentData.push(result) : [result];
        },
      });
      return createUserQueryResponse;
    },
  );
  return { data, error, trigger, isMutating };
};

export const useUserQueryResults = (
  queryId: string,
  sql?: string,
  params?: Parameter[],
) => {
  const reducedParams: Record<string, any> = {};
  if (params) {
    for (const param of params) {
      reducedParams[param.name] = param.value || param.defaultValue;
    }
  }
  const paramsString = new URLSearchParams(reducedParams).toString();
  const { data, error, isLoading } = useSWR<any>(sql + paramsString, () => {
    return backendGet(`/user-queries/${queryId}/run?${paramsString}`);
  });

  return { data, error, isLoading };
};

export const useUpdateUserQuery = (queryId: string) => {
  const { mutate } = useSWRConfig();
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/user-queries/${queryId}`,
    async (url: string, { arg }: { arg: Partial<UserQuery> }) => {
      const updateUserQueryResponse = await backendUpdate(url, arg);
      mutate(`/user-queries/${arg.id}`, updateUserQueryResponse, false);
      mutate(`/user-queries/db/${updateUserQueryResponse.database_id}`);
      return updateUserQueryResponse;
    },
  );

  return { data, error, trigger, isMutating };
};
