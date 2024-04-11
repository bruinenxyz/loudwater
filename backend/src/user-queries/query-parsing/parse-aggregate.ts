import { AggregateStep, Table } from "@/definitions";
import { compileTemplate, generateColumnName } from "./utils";
import * as _ from "lodash";

const aggregateTemplateGrouped = `
let {{ stepName }} = (
  from {{ from }}
  group { {{ group }} } (
    aggregate {
      {{ as }} = {{ operation }} {{ column }}
    }
  )
)`;

const aggregateTemplateUngrouped = `
let {{ stepName }} = (
  from {{ from }}
  aggregate {
    {{ as }} = {{ operation }} {{ column }}
  }
)`;

export function parseAggregate(
  aggregateStep: AggregateStep,
  index: number,
  tables: Table[],
): string {
  const aggregateName = generateColumnName(aggregateStep.column, tables);

  if (aggregateStep.group.length === 0) {
    // Aggregate over the whole table
    return compileTemplate(aggregateTemplateUngrouped, {
      stepName: `step_${index}`,
      from: `step_${index - 1}`,
      as: aggregateStep.as,
      operation: aggregateStep.operation,
      column: aggregateName,
    });
  } else {
    // Aggregate over a group
    const groupedColumnNames = _.map(aggregateStep.group, (column) =>
      generateColumnName(column, tables),
    );

    return compileTemplate(aggregateTemplateGrouped, {
      stepName: `step_${index}`,
      from: `step_${index - 1}`,
      group: groupedColumnNames.join(", "),
      as: aggregateStep.as,
      operation: aggregateStep.operation,
      column: aggregateName,
    });
  }
}
