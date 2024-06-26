import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { backendDelete, backendGet, backendUpdate } from "./client";
import { HydratedTable, UpdateTable } from "@/definitions";
import * as _ from "lodash";
import { FilterStep, OrderStep, TakeStep } from "@/definitions/pipeline";

export function useTables(databaseId?: string, schema?: string) {
  const { data, isLoading, isValidating, error } = useSWR<HydratedTable[]>(
    databaseId ? `/tables/db/${databaseId}` : null,
    backendGet,
  );

  if (schema) {
    return {
      data: data?.filter((table) => table.schema === schema),
      isLoading,
      isValidating,
      error,
    };
  }

  return { data, isLoading, isValidating, error };
}

export const useTable = (id?: string | null) => {
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
      mutate(`/tables/db/${updateTableResponse.database_id}`);

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

export const useUpdateCell = (
  config: {
    filters?: FilterStep;
    order?: OrderStep;
    take?: TakeStep;
  },
  tableId?: string,
) => {
  const { mutate } = useSWRConfig();
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
  const { data, error, trigger, isMutating } = useSWRMutation(
    tableId ? `/tables/${tableId}/row` : null,
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
      mutate(`/tables/${tableId}/results${queryParams}`, updateCellResponse, {
        populateCache: (result: any, currentData: any) => {
          const rowIndex = _.findIndex(
            currentData.rows,
            (row: any) => row[arg.pkColumn] === arg.rowId,
          );
          if (rowIndex !== -1) {
            currentData.rows[rowIndex][arg.column] = arg.value;
          }
        },
      });
      return updateCellResponse;
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
