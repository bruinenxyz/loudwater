import {
  ExternalColumn,
  RelateStep,
  Relation,
  RelationTypeEnum,
  Table,
} from "@/definitions";
import { baseObjectTemplate, compileTemplate } from "./utils";
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
  tablesSchema: Record<string, Record<string, ExternalColumn>>,
): string {
  const relateStepPrql: string[] = [];

  const relatedTable = _.find(
    tables,
    (table) => table.id === relateStep.relation.table,
  );
  assert(relatedTable, `Table not found: ${relateStep.relation.table}`);

  const columns = _.keys(tablesSchema[relatedTable.external_name]);

  // Add the base object variable to the PRQL, prefixing every column with the alias
  // TODO we will need to add the schema to the names below
  relateStepPrql.push(
    compileTemplate(baseObjectTemplate, {
      varName: relateStep.relation.as,
      tableName: relatedTable.external_name,
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
    let baseTableId;
    let baseColumnName;
    let relationColumnName;
    let joinTableBaseColumnName;
    let joinTableRelationColumnName;

    // Check which side of the relation is the base table and use the appropriate columns
    if (relateStep.relation.table === relation.table_1) {
      baseTableId = relation.table_2;
      baseColumnName = relation.column_2;
      relationColumnName = relation.column_1;
      joinTableBaseColumnName = relation.join_column_2;
      joinTableRelationColumnName = relation.join_column_1;
    } else {
      baseTableId = relation.table_1;
      baseColumnName = relation.column_1;
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

    const joinTableColumns = _.keys(tablesSchema[joinTable.external_name]);

    relateStepPrql.push(
      compileTemplate(baseObjectTemplate, {
        // TODO add schema
        varName: `${relateStep.relation.as}_join_table`,
        tableName: joinTable.external_name,
        deriveProperties: _.map(joinTableColumns, (column) => {
          return `${relateStep.relation.as}_join_table__${column} = ${column}`;
        }).join(", "),
        selectProperties: _.map(joinTableColumns, (column) => {
          return `${relateStep.relation.as}_join_table__${column}`;
        }).join(", "),
      }),
    );

    // Check if the base join key is on a table that has been related in previously
    let baseColumnPrefix;
    if (relateStep.relation.on.relation) {
      baseColumnPrefix = relateStep.relation.on.relation.as;
    } else {
      const baseTable = _.find(tables, (table) => table.id === baseTableId);
      assert(baseTable, `Table not found: ${baseTableId}`);
      baseColumnPrefix = baseTable.external_name;
    }

    // Select all of the properties on the base and related tables (excluding joiun table columns)
    // TODO add schema
    const selectProperties = _.concat(
      _.map(relateStep.inputSchema, (column) => {
        if (column.table === "aggregate") {
          return column.name;
        }

        if (column.relation) {
          return `${column.relation.as}__${column.name}`;
        }

        const table = _.find(tables, (table) => table.id === column.table);
        assert(table, `Table not found: ${column.table}`);

        return `${table.external_name}__${column.name}`;
      }),
      _.map(columns, (column) => {
        return `${relateStep.relation.as}__${column}`;
      }),
    ).join(", ");

    // Add the relation to the step PRQL
    relateStepPrql.push(
      compileTemplate(relateTemplateManyToMany, {
        stepName: `step_${index}`,
        from: `step_${index - 1}`,
        joinTable: `${relateStep.relation.as}_join_table`,
        baseJoinColumn: `${baseColumnPrefix}__${baseColumnName}`,
        joinTableBaseColumn: `${relateStep.relation.as}_join_table__${joinTableBaseColumnName}`,
        joinTableRelationColumn: `${relateStep.relation.as}_join_table__${joinTableRelationColumnName}`,
        relation: relateStep.relation.as,
        relationJoinColumn: `${relateStep.relation.as}__${relationColumnName}`,
        // TODO update
        selectProperties: selectProperties,
      }),
    );
  } else {
    let baseTableId;
    let baseColumnName;
    let relationColumnName;

    // Check which side of the relation is the base table and use the appropriate columns
    if (relateStep.relation.table === relation.table_1) {
      baseTableId = relation.table_2;
      baseColumnName = relation.column_2;
      relationColumnName = relation.column_1;
    } else {
      baseTableId = relation.table_1;
      baseColumnName = relation.column_1;
      relationColumnName = relation.column_2;
    }

    // Check if the base join key is on a table that has been related in previously
    let baseColumnPrefix;
    if (relateStep.relation.on.relation) {
      baseColumnPrefix = relateStep.relation.on.relation.as;
    } else {
      const baseTable = _.find(tables, (table) => table.id === baseTableId);
      assert(baseTable, `Table not found: ${baseTableId}`);
      baseColumnPrefix = baseTable.external_name;
    }

    // Add the relation to the step PRQL
    // TODO add in schema to the naming
    relateStepPrql.push(
      compileTemplate(relateTemplate, {
        stepName: `step_${index}`,
        from: `step_${index - 1}`,
        relation: relateStep.relation.as,
        baseJoinColumn: `${baseColumnPrefix}__${baseColumnName}`,
        relationJoinColumn: `${relateStep.relation.as}__${relationColumnName}`,
      }),
    );
  }

  return relateStepPrql.join("\n");
}
