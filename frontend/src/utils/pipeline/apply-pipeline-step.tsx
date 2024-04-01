import {
  AggregateStep,
  HydratedTable,
  InferredSchema,
  Relation,
  SelectStep,
  Step,
  StepIdentifierEnum,
} from "@/definitions";
import * as _ from "lodash";

export function applyPipelineStep(
  step: Step,
  inputSchema: InferredSchema,
  baseTable: HydratedTable,
  tables: HydratedTable[],
  relations: Relation[],
): InferredSchema {
  switch (step.type) {
    case StepIdentifierEnum.Select:
      // Filter the schema to only include the selected columns
      const selectStep = step as SelectStep;
      return applySelectStep(selectStep, inputSchema);
    case StepIdentifierEnum.Aggregate:
      // Filter the schema to only include the group columns and the new aggregate column
      const aggregateStep = step as AggregateStep;
      return applyAggregateStep(aggregateStep, inputSchema);
    case StepIdentifierEnum.Relate:
    case StepIdentifierEnum.Derive:
    case StepIdentifierEnum.Filter:
    case StepIdentifierEnum.Order:
    case StepIdentifierEnum.Take:
      // No schema changes
      return inputSchema;
    default:
      throw new Error("Invalid step type");
  }
}

function applySelectStep(
  step: SelectStep,
  inputSchema: InferredSchema,
): InferredSchema {
  // Filter the schema to only include the selected columns
  const selectedColumns = _.filter(
    inputSchema.columns,
    (column) =>
      _.find(
        step.select,
        (selectedColumn) =>
          // The column is considered selected if the name, table, and relation match
          selectedColumn.name === column.name &&
          selectedColumn.table === column.table &&
          ((selectedColumn.relation === undefined &&
            column.relation === undefined) ||
            (selectedColumn.relation !== undefined &&
              column.relation !== undefined &&
              selectedColumn.relation.as === column.relation.as)),
      ) !== undefined,
  );
  return {
    relations: inputSchema.relations,
    columns: selectedColumns,
  };
}

function applyAggregateStep(step: AggregateStep, inputSchema: InferredSchema) {
  // Filter the schema to only include the group columns and the new aggregate column
  const aggregatedColumns = _.filter(
    inputSchema.columns,
    (column) =>
      _.find(
        step.group,
        (selectedColumn) =>
          // The column is considered selected if the name, table, and relation match
          selectedColumn.name === column.name &&
          selectedColumn.table === column.table &&
          ((selectedColumn.relation === undefined &&
            column.relation === undefined) ||
            (selectedColumn.relation !== undefined &&
              column.relation !== undefined &&
              selectedColumn.relation.as === column.relation.as)),
      ) !== undefined,
  );

  aggregatedColumns.push({
    name: step.as,
    table: "aggregate",
    type: _.includes(["count", "sum", "average"], step.operation)
      ? "number"
      : step.column.type,
    is_nullable: false,
    is_identity: false,
    is_updateable: false,
    default_expression: null,
  });
  return {
    relations: inputSchema.relations,
    columns: aggregatedColumns,
  };
}
