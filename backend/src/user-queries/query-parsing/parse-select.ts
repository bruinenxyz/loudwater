import { SelectStep, Table } from "@/definitions";
import { compileTemplate, generateColumnName } from "./utils";
import * as _ from "lodash";

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
    columns: _.map(selectStep.select, (column) =>
      generateColumnName(column, tables),
    ).join(", "),
  });

  return selectPrql;
}
