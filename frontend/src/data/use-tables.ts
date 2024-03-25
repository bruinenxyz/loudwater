import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { mergeByKey } from "@/utils/merge-by-key";
import { backendDelete, backendGet, backendUpdate } from "./client";
import { HydratedTable, UpdateTable } from "@/definitions";
import * as _ from "lodash";
import { FilterStep, OrderStep, TakeStep } from "@/definitions/pipeline";

export function useTables(databaseId?: string) {
  const { mutate } = useSWRConfig();

  const { data, isLoading, isValidating, error } = useSWR<HydratedTable[]>(
    databaseId ? `/tables/db/${databaseId}` : null,
    backendGet,
  );

  // Update the individual table caches with the data returned from the server
  _.forEach(data, (table: HydratedTable) => {
    mutate(`/tables/${table.id}`, table);
  });

  return { data, isLoading, isValidating, error };
}

export const useTable = (id?: string) => {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<HydratedTable>(id ? `/tables/${id}` : null, backendGet);

  return { data, error, isLoading, isValidating, mutate };
};

export const useResults = (
  config: {
    filters?: FilterStep;
    order?: OrderStep;
    take?: TakeStep;
  },
  tableId?: string,
) => {
  const filters = config.filters ? JSON.stringify(config.filters) : undefined;
  const order = config.order ? JSON.stringify(config.order) : undefined;
  const take = config.take ? JSON.stringify(config.take) : undefined;
  let queryParams = "";
  if (filters !== undefined) {
    queryParams += `?filters=${filters}`;
  }
  if (order !== undefined) {
    queryParams += `${filters ? "&" : "?"}order=${order}`;
  }
  if (take !== undefined) {
    queryParams += `${filters || order ? "&" : "?"}take=${take}`;
  }

  const { data, error, isLoading, isValidating, mutate } = useSWR<any>(
    tableId ? `/tables/${tableId}/results${queryParams}` : null,
    backendGet,
    {
      revalidateOnFocus: false, // Don't revalidate when the window regains focus
    },
  );

  return { data, error, isLoading, isValidating, mutate };
};

export const useUpdateTable = () => {
  const { mutate } = useSWRConfig();
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/tables`,
    async (
      url: string,
      { arg }: { arg: { id: string; update: UpdateTable } },
    ) => {
      const updateTableResponse = await backendUpdate(
        `${url}/${arg.id}`,
        arg.update,
      );

      mutate(`/tables/${arg.id}`, updateTableResponse, false);
      mutate(`/tables`, updateTableResponse, {
        populateCache: (
          result: HydratedTable,
          currentData: HydratedTable[],
        ) => {
          mergeByKey(currentData, result);
        },
      });

      return updateTableResponse;
    },
  );

  return { data, error, trigger, isMutating };
};

export const useDeleteTable = (id?: string) => {
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/tables/${id}`,
    (url: string) => backendDelete(url),
  );

  return { data, error, trigger, isMutating };
};

export const useTablePk = (id?: string) => {
  const { data, error, isLoading, isValidating } = useSWR<any>(
    id ? `/tables/${id}/pk` : null,
    backendGet,
  );

  return { data, error, isLoading, isValidating };
};

export const useUpdateCell = (tableId?: string, onSuccess?: () => void) => {
  const { mutate } = useSWRConfig();
  const { data, error, trigger, isMutating } = useSWRMutation(
    `/tables/${tableId}/row`,
    async (
      url: string,
      {
        arg,
      }: {
        arg: { rowId: string; column: string; pkColumn: string; value: any };
      },
    ) => {
      const updateCellResponse = await backendUpdate(`${url}`, {
        row_id: arg.rowId,
        column_name: arg.column,
        value: arg.value,
        pk_column: arg.pkColumn,
      });
      // mutate(`/tables/${tableId}/results`, updateCellResponse, false);
      return updateCellResponse;
    },
    {
      onSuccess: onSuccess,
    },
  );
  return { data, error, trigger, isMutating };
};

// TODO update type of what is returned
export const useTableEnums = (id?: string) => {
  const { data, error, isLoading, isValidating } = useSWR<any>(
    id ? `/tables/${id}/enums` : null,
    backendGet,
  );

  return { data, error, isLoading, isValidating };
};
