import useSWR, { useSWRConfig } from "swr";
import { backendCreate, backendGet, backendUpdate } from "./client";
import { CreateUserQuery, UserQuery } from "@/definitions";
import useSWRMutation from "swr/mutation";
import { useSelectedDatabase } from "@/stores";
import { useTables } from "./use-tables";
import {
  AggregateStep,
  Pipeline,
  StepIdentifierEnum,
} from "@/definitions/pipeline";
import * as _ from "lodash";

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

export const useUserQueryResults = (queryId: string, sql?: string) => {
  const { data, error, isLoading } = useSWR<any>(sql, () => {
    return backendGet(`/user-queries/${queryId}/run`);
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

export const usePipelineSchema = (pipeline: Pipeline) => {
  const [selectedDatabase] = useSelectedDatabase();
  const { data: tables, isLoading, error } = useTables(selectedDatabase.id);

  const baseTable = _.find(tables, (table) => table.id === pipeline.from);

  if (baseTable) {
    let resultSchema = _.map(_.values(baseTable.external_columns), (column) => {
      return { ...column, table: baseTable.id };
    });
    for (let i = 0; i < pipeline.steps.length; i++) {
      const step = pipeline.steps[i];
      switch (step.type) {
        case StepIdentifierEnum.Select:
          // Filter the schema to only include the selected columns
          resultSchema = _.filter(
            resultSchema,
            (column) =>
              _.find(
                step.select,
                (selectedColumn) =>
                  selectedColumn.name === column.name &&
                  selectedColumn.table === column.table,
              ) !== undefined,
          );
        case StepIdentifierEnum.Aggregate:
          // Filter the schema to only include the group columns and the new aggregate column
          const aggregateStep = step as AggregateStep;
          const updatedColumns = _.filter(
            resultSchema,
            (column) =>
              _.find(
                aggregateStep.group,
                (selectedColumn) =>
                  selectedColumn.name === column.name &&
                  selectedColumn.table === column.table,
              ) !== undefined,
          );
          updatedColumns.push({
            name: aggregateStep.as,
            table: "aggregate",
            type: "", //TODO: Add type
            is_nullable: false,
            is_identity: false,
            is_updateable: false,
            default_expression: null,
          });
          resultSchema = updatedColumns;
        case StepIdentifierEnum.Relate:
        case StepIdentifierEnum.Derive:
        case StepIdentifierEnum.Filter:
        case StepIdentifierEnum.Order:
        case StepIdentifierEnum.Take:
          // No schema changes
          resultSchema = resultSchema;
        default:
          throw new Error("Invalid step type");
      }
    }

    return { data: resultSchema, isLoading, error: null };
  }

  return { data: null, isLoading, error: error || "Base table not found" };
};
