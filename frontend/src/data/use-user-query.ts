import {
  InferSchemaOutputSchema,
  InferredSchema,
  InferredSchemaColumn,
  InferredSchemaRelation,
  UserQuery,
  Pipeline,
} from "@/definitions";
import useSWR, { useSWRConfig } from "swr";
import useSWRMutation from "swr/mutation";
import { backendCreate, backendGet, backendUpdate } from "./client";
import { applyPipelineStep, validatePipelineStep } from "@/utils/pipeline";
import { useSelectedDatabase } from "@/stores";
import { useTables } from "./use-tables";
import { useRelations } from "./use-relations";
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
        populateCache: (
          result: UserQuery,
          currentData: UserQuery[] | undefined,
        ) => {
          return [...(currentData || []), result];
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
  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id);
  const {
    data: relations,
    isLoading: isLoadingRelations,
    error: relationsError,
  } = useRelations(selectedDatabase.id);

  if (isLoadingTables || isLoadingRelations) {
    return { data: null, isLoading: true, error: null };
  }

  if (tablesError || relationsError || !tables) {
    return {
      data: null,
      isLoading: false,
      error: tablesError || relationsError || "Tables not found",
    };
  }

  const baseTable = _.find(tables, (table) => table.id === pipeline.from);

  if (!baseTable) {
    return { success: false, error: "Base table not found" };
  }

  // Create the base columns from the root table
  let baseColumns: InferredSchemaColumn[] = _.map(
    _.values(baseTable.external_columns),
    (column) => {
      return { ...column, table: baseTable.id };
    },
  );
  if (!baseColumns.length) {
    throw new Error("Root table has no columns");
  }

  // Create the base relations as an empty array
  let baseRelations: InferredSchemaRelation[] = [];

  // Create the base result schema
  let resultSchema: InferredSchema = {
    columns: baseColumns,
    relations: baseRelations,
  };

  // Iterate through each step in the pipeline, validate it, and if it is valid, apply it to the schema
  for (let i = 0; i < pipeline.steps.length; i++) {
    const step = pipeline.steps[i];

    // Validate the step
    const validation = validatePipelineStep(
      step,
      i,
      resultSchema,
      baseTable,
      tables,
      relations || [],
    );

    // If the step is not valid, return the validation error
    if (!validation.success) {
      if (!validation.error) {
        throw new Error("No validation error returned");
      }
      return {
        data: validation,
        isLoading: !!(isLoadingTables || isLoadingRelations),
        error: null,
      };
    }

    // Apply the step to the schema
    resultSchema = applyPipelineStep(
      step,
      resultSchema,
      baseTable,
      tables,
      relations || [],
    );
  }

  // Return the parsed result schema
  return {
    data: InferSchemaOutputSchema.parse({
      success: true,
      data: resultSchema,
    }),
    isLoading: false,
    error: null,
  };
};
