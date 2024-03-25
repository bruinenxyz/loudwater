"use client";
import { StepIdentifierEnum, WorkbookStep, Workbook } from "@/definitions";
import { Card, Text } from "@blueprintjs/core";
import * as _ from "lodash";

export default function SavedWorkbookCard({
  workbook,
  onClick,
}: {
  workbook: Workbook;
  onClick?: () => void;
}) {
  const displayCount = _.filter(
    workbook.steps,
    (step: WorkbookStep) => step.type === StepIdentifierEnum.Display,
  ).length;

  return (
    <Card
      className="flex flex-col justify-between gap-3 p-3 cursor-pointer bp5-elevation-2"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col w-5/6 gap-1">
          <Text className="flex-auto font-semibold" ellipsize={true}>
            {workbook.name}
          </Text>
          <Text className="bp5-text-muted" ellipsize={true}>
            {workbook.description}
          </Text>
          <Text className="bp5-text-muted" ellipsize={true}>
            {`${displayCount} Display${displayCount === 1 ? "" : "s"}`}
          </Text>
        </div>
      </div>
    </Card>
  );
}
