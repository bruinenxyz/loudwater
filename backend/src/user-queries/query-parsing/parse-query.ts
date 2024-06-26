import {
  ExternalColumn,
  Pipeline,
  Relation,
  StepIdentifierEnum,
  Table,
} from "@/definitions";
import { parseAggregate } from "./parse-aggregate";
import { parseFrom } from "./parse-from";
import { parseOrder } from "./parse-order";
import { parseRelate } from "./parse-relate";
import { parseSelect } from "./parse-select";
import { parseTake } from "./parse-take";
import { compile } from "prql-js";
import * as _ from "lodash";
import { parseFilter } from "./parse-filter";

function objectToPrql(
  pipeline: Pipeline,
  tables: Table[],
  relations: Relation[],
  tablesSchema: Record<string, Record<string, Record<string, ExternalColumn>>>,
): string {
  let prql = "prql target:sql.postgres\n";
  prql += parseFrom(pipeline.from, tables, tablesSchema);

  _.forEach(pipeline.steps, (step, index) => {
    switch (step.type) {
      case StepIdentifierEnum.Aggregate:
        prql += parseAggregate(step, index + 1, tables);
        break;
      case StepIdentifierEnum.Filter:
        prql += parseFilter(step, index + 1, tables);
        break;
      case StepIdentifierEnum.Order:
        prql += parseOrder(step, index + 1, tables);
        break;
      case StepIdentifierEnum.Relate:
        prql += parseRelate(step, index + 1, tables, relations, tablesSchema);
        break;
      case StepIdentifierEnum.Select:
        prql += parseSelect(step, index + 1, tables);
        break;
      case StepIdentifierEnum.Take:
        prql += parseTake(step, index + 1);
      default:
        break;
    }
  });

  prql += `\nfrom step_${pipeline.steps.length}`;

  return prql;
}

export function writeSQL(
  pipeline: Pipeline,
  tables: Table[],
  relations: Relation[],
  tablesSchema: Record<string, Record<string, Record<string, ExternalColumn>>>,
) {
  const prqlQuery = objectToPrql(pipeline, tables, relations, tablesSchema);

  console.log("prqlQuery:");
  console.log(prqlQuery);

  try {
    // TODO add in support for prepared statements
    const sql = compile(prqlQuery) as string;

    console.log("sql:");
    console.log(sql);

    return sql;
  } catch (e) {
    const prqlMessage = JSON.parse(e.message);
    _.forEach(prqlMessage.inner, (inner) => {
      console.log("-------- Error Display --------");
      console.log(inner.display);
    });

    throw e;
  }
}
