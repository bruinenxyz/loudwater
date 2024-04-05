import { AggregateStep, Table } from "@/definitions";
import { compileTemplate } from "./utils";
import * as _ from "lodash";
import * as assert from "assert";

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
  // Find the table for the column that the aggregate is being performed on
  const aggregateTable = _.find(
    tables,
    (table) => table.id === aggregateStep.column.table,
  );
  assert(aggregateTable, `Table not found: ${aggregateStep.column.table}`);

  // Prefix the aggregate column with the relation name if it exists
  let aggregatePrefix;
  if (aggregateStep.column.relation) {
    aggregatePrefix = aggregateStep.column.relation.as;
  } else {
    aggregatePrefix = aggregateTable.external_name;
  }

  let aggregatePrql = "";
  if (aggregateStep.group.length === 0) {
    // Aggregate over the whole table
    aggregatePrql = compileTemplate(aggregateTemplateUngrouped, {
      stepName: `step_${index}`,
      from: `step_${index - 1}`,
      as: aggregateStep.as,
      operation: aggregateStep.operation,
      column: `${aggregatePrefix}__${aggregateStep.column.name}`,
    });
  } else {
    // Aggregate over a group
    const groupedColumnNames = _.map(aggregateStep.group, (column) => {
      // If the column was created via aggregate, we don't need to prefix it
      if (column.table === "aggregate") {
        return column.name;
      }

      // If the column was added via relation, prefix it with the relation name
      if (column.relation) {
        return `${column.relation.as}__${column.name}`;
      }

      // Otherwise, prefix it with its base table name
      const table = _.find(tables, (table) => table.id === column.table);
      assert(table, `Table not found: ${column.table}`);

      return `${table.external_name}__${column.name}`;
    });

    aggregatePrql = compileTemplate(aggregateTemplateGrouped, {
      stepName: `step_${index}`,
      from: `step_${index - 1}`,
      group: groupedColumnNames.join(", "),
      as: aggregateStep.as,
      operation: aggregateStep.operation,
      column: `${aggregatePrefix}__${aggregateStep.column.name}`,
    });
  }

  return aggregatePrql;
}
