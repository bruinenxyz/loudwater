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
  tablesSchema: Record<string, Record<string, ExternalColumn>>,
) {
  const table = _.find(tables, (table) => table.id === from);
  assert(table, `Table not found: ${from}`);

  // TODO we need to deal with schema here as well
  const columns = _.keys(tablesSchema[table.external_name]);

  // Define the base object using the table schema
  const baseObjectPrql = compileTemplate(baseObjectTemplate, {
    varName: `${table.schema}__${table.external_name}`,
    // TODO will need to update this to add the schema
    tableName: table.external_name,
    deriveProperties: _.map(columns, (column) => {
      // TODO add in schema?
      return `${table.external_name}__${column} = ${column}`;
    }).join(", "),
    selectProperties: _.map(columns, (column) => {
      return `${table.external_name}__${column}`;
    }).join(", "),
  });

  const fromPrql = compileTemplate(fromTemplate, {
    stepName: "step_0",
    from: `${table.schema}__${table.external_name}`,
  });

  return [baseObjectPrql, fromPrql].join("\n");
}
