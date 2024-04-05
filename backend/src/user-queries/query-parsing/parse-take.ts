import { TakeStep } from "@/definitions";
import { compileTemplate } from "./utils";

const takeTemplate = `
let {{ stepName }} = (
  from {{ from }}
  take {{ take }}
)`;

export function parseTake(takeStep: TakeStep, index: number): string {
  let take = "";
  if (takeStep.limit) {
    if (takeStep.offset) {
      take = `${takeStep.offset + 1}..${takeStep.offset + takeStep.limit}`;
    } else {
      take = `${takeStep.limit}`;
    }
  } else {
    if (takeStep.offset) {
      take = `${takeStep.offset + 1}..`;
    }
  }
  const takePrql = compileTemplate(takeTemplate, {
    stepName: `step_${index}`,
    from: `step_${index - 1}`,
    take: take,
  });

  return takePrql;
}
