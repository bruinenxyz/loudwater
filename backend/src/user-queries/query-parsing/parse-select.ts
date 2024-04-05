import { SelectStep, Table } from "@/definitions";
import { compileTemplate } from "./utils";
import * as _ from "lodash";
import * as assert from "assert";

const selectTemplate = `
let {{ stepName }} = (
  from {{ from }}
  select {
    {{ columns }}
  }
)`;

export function parseSelect(
  selectStep: SelectStep,
  index: number,
  tables: Table[],
): string {
  // Generate the PRQL for the select step
  const selectPrql = compileTemplate(selectTemplate, {
    stepName: `step_${index}`,
    from: `step_${index - 1}`,
    columns: _.map(selectStep.select, (column) => {
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

      // TODO add in schema?
      return `${table.external_name}__${column.name}`;
    }).join(", "),
  });

  return selectPrql;
}
