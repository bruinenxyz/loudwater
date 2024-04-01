import { SelectStep, Table } from "@/definitions";
import { compileTemplate } from "./utils";
import * as _ from "lodash";
import * as assert from "assert";

const selectTemplate = `
let {{ stepName }} = (
  from {{ from }}
  select {
    {{ properties }}
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
    properties: _.map(selectStep.select, (property) => {
      const table = _.find(tables, (table) => table.id === property.table);
      assert(table, `Table not found: ${property.table}`);

      // TODO add in schema?
      return `${table.external_name}__${property.name}`;
    }).join(", "),
  });

  return selectPrql;
}
