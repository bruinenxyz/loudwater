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
  RelateStep,
  RelateStepSchema,
  FilterStep,
  FilterStepSchema,
  OrderStep,
  OrderStepSchema,
  TakeStep,
  TakeStepSchema,
  StepValidationOutput,
  InferredSchema,
  InferredSchemaColumn,
  FilterCondition,
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
    case StepIdentifierEnum.Relate:
      return createRelateStepValidator(
        inputSchema,
        stepIndex,
        tables,
        relations,
      );
    case StepIdentifierEnum.Take:
      return createTakeStepValidator(stepIndex);
    case StepIdentifierEnum.Filter:
      return createFilterStepValidator(inputSchema, stepIndex);
    case StepIdentifierEnum.Order:
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
      const usedRelationNames = _.map(
        inputSchema.relations,
        (relation) => relation.as,
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
          message: `Aggregated column '${column.name}' on table '${column.table}' ${column.relation ? `via relation '${column.relation.as}' ` : ""}does not exist in input schema`,
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
      // Ensure that the new "as" column is not present in the input schema for columns or relations
      if (
        _.includes(usedColumnNames, step.as) ||
        _.includes(usedRelationNames, step.as)
      ) {
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

function createRelateStepValidator(
  inputSchema: InferredSchema,
  stepIndex: number,
  tables: HydratedTable[],
  relations: Relation[],
) {
  const relateValidator = RelateStepSchema.superRefine(
    (step: RelateStep, ctx: any) => {
      const usedColumnNames = _.map(
        inputSchema.columns,
        (column) => column.name,
      );
      const usedRelationNames = _.map(
        inputSchema.relations,
        (relation) => relation.as,
      );

      // Get target table
      const targetTable = _.find(
        tables,
        (table) => table.id === step.relation.table,
      );
      // Check that the table exists
      if (!targetTable) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Table '${step.relation.table}' does not exist`,
          path: [
            stepIndex.toString(),
            `step ${stepIndex + 1} - Relate`,
            "relation",
            "table",
          ],
        });
      }

      // Get the target relation
      const targetRelation = _.find(
        relations,
        (relation) => relation.id === step.relation.relation,
      );
      // Check that the relation exists
      if (!targetRelation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Relation '${step.relation.relation}' does not exist`,
          path: [
            stepIndex.toString(),
            `step ${stepIndex + 1} - Relate`,
            "relation",
            "relation",
          ],
        });
      }

      if (targetRelation && targetTable) {
        // Check that the target table is part of the target relation
        if (
          targetRelation.table_1 !== targetTable.id &&
          targetRelation.table_2 !== targetTable.id
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Table '${targetTable.name}' is not part of relation '${targetRelation.id}'`,
            path: [
              stepIndex.toString(),
              `step ${stepIndex + 1} - Relate`,
              "relation",
            ],
          });
        }

        // Check that the table we are tryting to join onto exists
        const originTable =
          targetRelation.table_1 === targetTable.id
            ? _.find(tables, (table) => table.id === targetRelation.table_2)
            : _.find(tables, (table) => table.id === targetRelation.table_1);
        if (!originTable) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `The table you are attempting to join onto does not exist`,
            path: [
              stepIndex.toString(),
              `step ${stepIndex + 1} - Relate`,
              "relation",
            ],
          });
        } else {
          // Check that the required join column exists in the input schema
          if (
            !_.find(inputSchema.columns, (column) =>
              _.isEqual(column, step.relation.on),
            )
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `The join column '${step.relation.on.name}' from table '${originTable.name}'${step.relation.on.relation ? ` via relation '${step.relation.on.relation.as}'` : ""} does not exist in the input schema. Either add it to the input schema in a prior step or select a different column to join on.`,
              path: [
                stepIndex.toString(),
                `step ${stepIndex + 1} - Relate`,
                "relation",
              ],
            });
          }

          // Ensure that the new "as" relation is not present in the input schema for columns or relations
          if (
            _.includes(usedRelationNames, step.relation.as) ||
            _.includes(usedColumnNames, step.relation.as)
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Relation name '${step.relation.as}' already exists in the input schema. Relation names must be unique in the schema.`,
              path: [
                stepIndex.toString(),
                `step ${stepIndex + 1} - Relate`,
                "relation",
                "as",
              ],
            });
          }
        }
      }
    },
  );
  return relateValidator;
}

function createTakeStepValidator(stepIndex: number) {
  const takeValidator = TakeStepSchema.superRefine(
    (step: TakeStep, ctx: any) => {
      if (typeof step.limit !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Limit must be type 'number', recieved type '${typeof step.limit}'`,
          path: [stepIndex.toString(), `step ${stepIndex + 1} - Take`, "limit"],
        });
      }
      if (typeof step.offset !== "number") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Offset must be type 'number', recieved type '${typeof step.offset}'`,
          path: [
            stepIndex.toString(),
            `step ${stepIndex + 1} - Take`,
            "offset",
          ],
        });
      }
    },
  );
  return takeValidator;
}

function createFilterStepValidator(
  inputSchema: InferredSchema,
  stepIndex: number,
) {
  const filterValidator = FilterStepSchema.superRefine(
    (step: FilterStep, ctx: any) => {
      // Check that the logical operator is valid
      if (!_.includes(["and", "or", "xor"], step.logicalOperator)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Invalid logical operator'`,
          path: [
            stepIndex.toString(),
            `step ${stepIndex + 1} - Filter`,
            "logicalOperator",
          ],
        });
      }

      // Iterate over each condition in the filter step and validate it
      step.conditions.forEach((condition: FilterCondition, index: number) => {
        const filteredColumn = _.find(
          inputSchema.columns,
          (column: InferredSchemaColumn) => _.isEqual(column, condition.column),
        );
        // Ensure that the column being filtered is present in the input schema
        if (!filteredColumn) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Filtered column '${condition.column.name}' on table '${condition.column.table}' ${condition.column.relation ? `via relation '${condition.column.relation.as}' ` : ""}does not exist in input schema`,
            path: [
              stepIndex.toString(),
              `step ${stepIndex + 1} - Filter`,
              "conditions",
              index.toString(),
              "column",
            ],
          });
        } else {
          // Ensure that the value is valid
          if (_.includes(["is_null", "is_not_null"], condition.operator)) {
            if (condition.value !== undefined) {
              // If the operator is is_null or is_not_null, the value must be undefined
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `For 'is_null' and 'is_not_null' operators, value must be undefined`,
                path: [
                  stepIndex.toString(),
                  `step ${stepIndex + 1} - Filter`,
                  "conditions",
                  index.toString(),
                  "value",
                ],
              });
            }
          } else {
            if (condition.value === undefined) {
              // If the operator is not is_null or is_not_null, the value must be defined
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `For operators other than 'is_null' and 'is_not_null', value must be defined`,
                path: [
                  stepIndex.toString(),
                  `step ${stepIndex + 1} - Filter`,
                  "conditions",
                  index.toString(),
                  "value",
                ],
              });
            } else {
              if (typeof condition.value === "object") {
                // If the value is an object, check that it is a column on the input schema
                const valueColumn = _.find(
                  inputSchema.columns,
                  (column: InferredSchemaColumn) =>
                    _.isEqual(column, condition.value),
                );
                if (!valueColumn) {
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `Value for column '${condition.column.name}' on table '${condition.column.table}' ${condition.column.relation ? `via relation '${condition.column.relation.as}' ` : ""}is a column that does not exist in input schema`,
                    path: [
                      stepIndex.toString(),
                      `step ${stepIndex + 1} - Filter`,
                      "conditions",
                      index.toString(),
                      "value",
                    ],
                  });
                }
              } else {
                // If the value is not a column on the input schema, check that the filtered column is of the same type as the value
                if (filteredColumn.type !== typeof condition.value) {
                  if (
                    (filteredColumn.type !== "date" &&
                      filteredColumn.type !== "datetime") ||
                    ((filteredColumn.type === "date" ||
                      filteredColumn.type === "datetime") &&
                      typeof condition.value !== "string")
                  ) {
                    // The filtered column on the input schema must be of the same type as the value
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: `Value for column '${
                        condition.column.name
                      }' on table '${condition.column.table}' ${condition.column.relation ? `via relation '${condition.column.relation.as}' ` : ""}must be of type ${
                        filteredColumn.type === "date" ||
                        filteredColumn.type === "datetime"
                          ? "string"
                          : filteredColumn.type
                      }`,
                      path: [
                        stepIndex.toString(),
                        `step ${stepIndex + 1} - Filter`,
                        "conditions",
                        index.toString(),
                        "value",
                      ],
                    });
                  }
                }
              }
            }
          }
        }
      });
    },
  );

  return filterValidator;
}
