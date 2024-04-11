import { OrderStep, Table } from "@/definitions";
import { compileTemplate, generateColumnName } from "./utils";
import * as _ from "lodash";

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
      const columnName = generateColumnName(singleOrder.column, tables);
      return `${dir}${columnName}`;
    }).join(", "),
  });

  return orderPrql;
}
