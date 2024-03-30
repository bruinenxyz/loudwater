import {
  HydratedTable,
  Relation,
  Step,
  StepIdentifier,
  StepIdentifierEnum,
  SelectStep,
  SelectStepSchema,
  AggregateStep,
  AggregateStepSchema,
  OrderStep,
  OrderStepSchema,
  TakeStep,
  TakeStepSchema,
  RelateStep,
  RelateStepSchema,
  FilterStep,
  FilterStepSchema,
  StepValidationOutput,
  InferredSchema,
  InferredSchemaColumn,
} from "@/definitions";
import { z } from "zod";
import * as _ from "lodash";

export function validatePipelineStep(
  step: Step,
  stepIndex: number,
  inputSchema: InferredSchema,
  baseTable: HydratedTable,
  tables: HydratedTable[],
  relations: Relation[],
): StepValidationOutput {
  const stepValidator = getPipelineStepValidator(
    step.type,
    stepIndex,
    inputSchema,
    baseTable,
    tables,
    relations,
  );
  // Validate the step
  const validation = stepValidator.safeParse(step);
  // Return the validation result
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    };
  }
  return { success: true, data: step };
}

// Given a step type, input schema, and base table, return the appropriate step validator
function getPipelineStepValidator(
  stepType: StepIdentifier,
  stepIndex: number,
  inputSchema: InferredSchema,
  baseTable: HydratedTable,
  tables: HydratedTable[],
  relations: Relation[],
) {
  switch (stepType) {
    case StepIdentifierEnum.Select:
      return createSelectStepValidator(inputSchema, stepIndex);
    case StepIdentifierEnum.Aggregate:
      return createAggregateStepValidator(inputSchema, stepIndex);
    case StepIdentifierEnum.Order:
    case StepIdentifierEnum.Take:
    case StepIdentifierEnum.Relate:
    case StepIdentifierEnum.Filter:
    case StepIdentifierEnum.Derive:
    default:
      throw new Error("Invalid step type");
  }
}

function createSelectStepValidator(
  inputSchema: InferredSchema,
  stepIndex: number,
) {
  const selectValidator = SelectStepSchema.superRefine(
    (step: SelectStep, ctx: any) => {
      // Ensure that all selected columns are present in the input schema
      step.select.forEach((column: InferredSchemaColumn) => {
        if (
          !_.find(inputSchema.columns, (inputColumn) =>
            _.isEqual(inputColumn, column),
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Column '${column.name}' on table '${column.table}' ${column.relation ? `via relation '${column.relation.as}' ` : ""}does not exist in input schema`,
            path: [
              stepIndex.toString(),
              `step ${stepIndex + 1} - Select`,
              "select",
            ],
          });
        }
      });
    },
  );
  // Ensure that all selected properties are present in the input schemaz
  return selectValidator;
}

function createAggregateStepValidator(
  inputSchema: InferredSchema,
  stepIndex: number,
) {
  const aggregateValidator = AggregateStepSchema.superRefine(
    (step: AggregateStep, ctx: any) => {
      const usedColumnNames = _.map(
        inputSchema.columns,
        (column) => column.name,
      );
      // Ensure that the column being aggregated is present in the input schema
      const column: InferredSchemaColumn = step.column;
      if (
        !_.find(inputSchema.columns, (inputColumn: InferredSchemaColumn) =>
          _.isEqual(inputColumn, step.column),
        )
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Aggregated column '${column.name}' on table '${column.table}' ${column.relation && `via relation '${column.relation.as}' `}does not exist in input schema`,
          path: [
            stepIndex.toString(),
            `step ${stepIndex + 1} - Aggregate`,
            "column",
          ],
        });
      }
      // Ensure that the group columns are present in the input schema
      step.group.forEach((groupColumn: InferredSchemaColumn) => {
        if (
          !_.find(inputSchema.columns, (inputColumn: InferredSchemaColumn) =>
            _.isEqual(inputColumn, groupColumn),
          )
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Group column '${groupColumn.name}' on table '${groupColumn.table}' ${groupColumn.relation && `via relation '${groupColumn.relation.as}' `}does not exist in input schema`,
            path: [
              stepIndex.toString(),
              `step ${stepIndex + 1} - Aggregate`,
              "group",
            ],
          });
        }
      });
      // Ensure that the new "as" column is not present in the input schema

      if (_.includes(usedColumnNames, step.as)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Aggregation result name '${step.as}' already exists in input schema. Aggregation result names must be unique in the schema.`,
          path: [
            stepIndex.toString(),
            `step ${stepIndex + 1} - Aggregate`,
            "as",
          ],
        });
      }
    },
  );
  // Ensure that all selected properties are present in the input schemaz
  return aggregateValidator;
}
