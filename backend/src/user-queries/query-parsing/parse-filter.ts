import {
  FilterStep,
  InferredSchemaColumnSchema,
  OperatorsEnum,
  Table,
} from "@/definitions";
import { compileTemplate, generateColumnName } from "./utils";
import * as _ from "lodash";

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
      const columnName = generateColumnName(condition.column, tables);

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
            // Comparing against another column
            const valueColumnName = generateColumnName(condition.value, tables);
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
