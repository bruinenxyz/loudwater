import {
  ExternalColumn,
  RelateStep,
  Relation,
  RelationTypeEnum,
  Table,
} from "@/definitions";
import {
  baseObjectTemplate,
  compileTemplate,
  generateColumnName,
} from "./utils";
import * as _ from "lodash";
import * as assert from "assert";

const relateTemplate = `
let {{ stepName }} = (
  from {{ from }}
  join side:left {{ relation }} (this.{{ baseJoinColumn }}=={{ relation }}.{{ relationJoinColumn }})
)`;

const relateTemplateManyToMany = `
let {{ stepName }} = (
  from {{ from }}
  join side:left {{ joinTable }} (this.{{ baseJoinColumn }}=={{ joinTable }}.{{ joinTableBaseColumn }})
  join side:left {{ relation }} (this.{{ joinTableRelationColumn }}=={{ relation }}.{{ relationJoinColumn }})
  select { {{ selectProperties }} }
)`;

export function parseRelate(
  relateStep: RelateStep,
  index: number,
  tables: Table[],
  relations: Relation[],
  tablesSchema: Record<string, Record<string, Record<string, ExternalColumn>>>,
): string {
  const relateStepPrql: string[] = [];

  const relatedTable = _.find(
    tables,
    (table) => table.id === relateStep.relation.table,
  );
  assert(relatedTable, `Table not found: ${relateStep.relation.table}`);

  const columns = _.keys(
    tablesSchema[relatedTable.schema][relatedTable.external_name],
  );

  // Add the base object variable to the PRQL, prefixing every column with the alias
  relateStepPrql.push(
    compileTemplate(baseObjectTemplate, {
      varName: relateStep.relation.as,
      tableName: `${relatedTable.schema}.${relatedTable.external_name}`,
      deriveProperties: _.map(columns, (column) => {
        return `${relateStep.relation.as}__${column} = ${column}`;
      }).join(", "),
      selectProperties: _.map(columns, (column) => {
        return `${relateStep.relation.as}__${column}`;
      }).join(", "),
    }),
  );

  const relation = _.find(
    relations,
    (relation) => relation.id === relateStep.relation.relation,
  );
  assert(relation, `Relation not found: ${relateStep.relation.relation}`);

  if (relation.type === RelationTypeEnum.ManyToMany) {
    let relationColumnName;
    let joinTableBaseColumnName;
    let joinTableRelationColumnName;

    // Check which side of the relation is the base table and use the appropriate columns
    if (relateStep.relation.table === relation.table_1) {
      relationColumnName = relation.column_1;
      joinTableBaseColumnName = relation.join_column_2;
      joinTableRelationColumnName = relation.join_column_1;
    } else {
      relationColumnName = relation.column_2;
      joinTableBaseColumnName = relation.join_column_1;
      joinTableRelationColumnName = relation.join_column_2;
    }

    // Pull the external name of the join table
    const joinTable = _.find(
      tables,
      (table) => table.id === relation.join_table,
    );
    assert(joinTable, `Table not found: ${relation.join_table}`);

    const joinTableColumns = _.keys(
      tablesSchema[joinTable.schema][joinTable.external_name],
    );

    // Add the base variable of the join table to the PRQL
    relateStepPrql.push(
      compileTemplate(baseObjectTemplate, {
        varName: `${relateStep.relation.as}_join_table`,
        tableName: `${joinTable.schema}.${joinTable.external_name}`,
        deriveProperties: _.map(
          joinTableColumns,
          (column) =>
            `${relateStep.relation.as}_join_table__${column} = ${column}`,
        ).join(", "),
        selectProperties: _.map(
          joinTableColumns,
          (column) => `${relateStep.relation.as}_join_table__${column}`,
        ).join(", "),
      }),
    );

    const baseJoinKeyName = generateColumnName(relateStep.relation.on, tables);

    // Select all of the properties on the base and related tables (excluding join table columns)
    const selectProperties = _.concat(
      _.map(relateStep.inputSchema, (column) =>
        generateColumnName(column, tables),
      ),
    ).join(", ");

    // Add the relation to the step PRQL
    relateStepPrql.push(
      compileTemplate(relateTemplateManyToMany, {
        stepName: `step_${index}`,
        from: `step_${index - 1}`,
        joinTable: `${relateStep.relation.as}_join_table`,
        baseJoinColumn: baseJoinKeyName,
        joinTableBaseColumn: `${relateStep.relation.as}_join_table__${joinTableBaseColumnName}`,
        joinTableRelationColumn: `${relateStep.relation.as}_join_table__${joinTableRelationColumnName}`,
        relation: relateStep.relation.as,
        relationJoinColumn: `${relateStep.relation.as}__${relationColumnName}`,
        selectProperties: selectProperties,
      }),
    );
  } else {
    let relationColumnName;

    // Check which side of the relation is the base table and use the appropriate columns
    if (relateStep.relation.table === relation.table_1) {
      relationColumnName = relation.column_1;
    } else {
      relationColumnName = relation.column_2;
    }

    const baseJoinKeyName = generateColumnName(relateStep.relation.on, tables);

    // Add the relation to the step PRQL
    relateStepPrql.push(
      compileTemplate(relateTemplate, {
        stepName: `step_${index}`,
        from: `step_${index - 1}`,
        relation: relateStep.relation.as,
        baseJoinColumn: baseJoinKeyName,
        relationJoinColumn: `${relateStep.relation.as}__${relationColumnName}`,
      }),
    );
  }

  return relateStepPrql.join("\n");
}
