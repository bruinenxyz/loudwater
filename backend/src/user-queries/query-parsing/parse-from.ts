import { ExternalColumn, Table } from "@/definitions";
import { baseObjectTemplate, compileTemplate } from "./utils";
import * as _ from "lodash";
import * as assert from "assert";

const fromTemplate = `
let {{ stepName }} = (
  from {{ from }}
)`;

export function parseFrom(
  from: string,
  tables: Table[],
  tablesSchema: Record<string, Record<string, Record<string, ExternalColumn>>>,
) {
  const table = _.find(tables, (table) => table.id === from);
  assert(table, `Table not found: ${from}`);

  const columns = _.keys(tablesSchema[table.schema][table.external_name]);

  // Define the base object using the table schema
  const baseObjectPrql = compileTemplate(baseObjectTemplate, {
    varName: `${table.schema}__${table.external_name}`,
    tableName: `${table.schema}.${table.external_name}`,
    deriveProperties: _.map(
      columns,
      (column) => `${table.external_name}__${column} = ${column}`,
    ).join(", "),
    selectProperties: _.map(
      columns,
      (column) => `${table.external_name}__${column}`,
    ).join(", "),
  });

  // Add the step_0 object that begins the pipeline by pulling from the base variable
  const fromPrql = compileTemplate(fromTemplate, {
    stepName: "step_0",
    from: `${table.schema}__${table.external_name}`,
  });

  return [baseObjectPrql, fromPrql].join("\n");
}
