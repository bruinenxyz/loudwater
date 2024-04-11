import { InferredSchemaColumn, Table } from "@/definitions";
import * as _ from "lodash";
import * as assert from "assert";

export const baseObjectTemplate = `
let {{ varName }} = (
  from {{ tableName }}
  derive {
    {{ deriveProperties }}
  }
  select {
    {{ selectProperties }}
  }
)`;

export function compileTemplate(template: string, data: object): string {
  const templateOptions = {
    interpolate: /{{([\s\S]+?)}}/g, // This regex matches '{{ variableName }}'
  };
  const compiledTemplate = _.template(template, templateOptions)(data);
  return compiledTemplate;
}

export function generateColumnName(
  column: InferredSchemaColumn,
  tables: Table[],
): string {
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
}
