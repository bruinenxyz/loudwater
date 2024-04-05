import { OrderStep, Table } from "@/definitions";
import { compileTemplate } from "./utils";
import * as _ from "lodash";
import * as assert from "assert";

const orderTemplate = `
let {{ stepName }} = (
  from {{ from }}
  sort { {{ order }} }
)`;

export function parseOrder(
  orderStep: OrderStep,
  index: number,
  tables: Table[],
): string {
  const orderPrql = compileTemplate(orderTemplate, {
    stepName: `step_${index}`,
    from: `step_${index - 1}`,
    order: _.map(orderStep.order, (singleOrder) => {
      const dir = singleOrder.direction === "asc" ? "+" : "-";

      // If the ordered column was created via aggregate, we don't need to prefix it
      if (singleOrder.column.table === "aggregate") {
        return `${dir}${singleOrder.column.name}`;
      }

      // If the ordered column was added via relation, prefix it with the relation name
      if (singleOrder.column.relation) {
        return `${dir}${singleOrder.column.relation.as}__${singleOrder.column.name}`;
      }

      // Otherwise, prefix it with its base table name
      const table = _.find(
        tables,
        (table) => table.id === singleOrder.column.table,
      );
      assert(table, `Table not found: ${singleOrder.column.table}`);

      // TODO include schema?
      return `${dir}${table.external_name}__${singleOrder.column.name}`;
    }).join(", "),
  });

  return orderPrql;
}
