import {
  FilterStep,
  InferredSchemaColumnSchema,
  OperatorsEnum,
  Table,
} from "@/definitions";
import { compileTemplate } from "./utils";
import * as _ from "lodash";
import * as assert from "assert";

const filterTemplate = `
let {{ stepName }} = (
  from {{ from }}
  filter ({{ conditions }})
)`;

export const parseFilter = (
  filterStep: FilterStep,
  index: number,
  tables: Table[],
): string => {
  // TODO move this into definitions
  const logicalOperatorMap = {
    and: "&&",
    or: "||",
  };

  // Pull out logical operator for use in PRQL
  if (!filterStep.logicalOperator) filterStep.logicalOperator = "and";
  const logicalOperator = logicalOperatorMap[filterStep.logicalOperator];

  // Compile PRQL for filter step
  const filterPrql = compileTemplate(filterTemplate, {
    stepName: `step_${index}`,
    from: `step_${index - 1}`,
    conditions: _.map(filterStep.conditions, (condition) => {
      // Pull out the correct name for the column
      let columnName;
      if (condition.column.table === "aggregate") {
        columnName = condition.column.name;
      } else if (condition.column.relation) {
        columnName = `${condition.column.relation.as}__${condition.column.name}`;
      } else {
        const table = _.find(
          tables,
          (table) => table.id === condition.column.table,
        );
        assert(table, `Table not found: ${condition.column.table}`);
        columnName = `${table.external_name}__${condition.column.name}`;
      }

      // TODO add support for prepared statements here
      switch (condition.operator) {
        case OperatorsEnum.isNull:
          return `${columnName} == null`;
        case OperatorsEnum.isNotNull:
          return `${columnName} != null`;
        case OperatorsEnum.like:
          // For the like operator only string columns are supported
          return `${columnName} ~= "${condition.value}"`;
        case OperatorsEnum.notLike:
          // For the not like operator only string columns are supported
          return `!(${columnName} ~= "${condition.value}")`;
        case OperatorsEnum.equal:
        case OperatorsEnum.notEqual:
        case OperatorsEnum.greaterThan:
        case OperatorsEnum.lessThan:
        case OperatorsEnum.greaterThanOrEqual:
        case OperatorsEnum.lessThanOrEqual:
          const validationResult = InferredSchemaColumnSchema.safeParse(
            condition.value,
          );

          if (validationResult.success) {
            // Pull out the correct name for the value column
            let valueColumnName;
            if (condition.value.table === "aggregate") {
              valueColumnName = condition.value.name;
            } else if (condition.value.relation) {
              valueColumnName = `${condition.value.relation.as}__${condition.value.name}`;
            } else {
              const table = _.find(
                tables,
                (table) => table.id === condition.value.table,
              );
              assert(table, `Table not found: ${condition.value.table}`);
              valueColumnName = `${table.external_name}__${condition.value.name}`;
            }

            return `${columnName} ${condition.operator} ${valueColumnName}`;
          } else {
            // Comparing against a value
            if (typeof condition.value === "string") {
              return `${columnName} ${condition.operator} "${condition.value}"`;
            } else {
              return `${columnName} ${condition.operator} ${condition.value}`;
            }
          }
      }
    }).join(` ${logicalOperator} `),
  });

  return filterPrql;
};
