"use client";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import * as _ from "lodash";
import { NewStepSelection } from "./pipeline-editor";
import { StepIdentifierEnum, StepIdentifier } from "@/definitions";

export default function StepTypeSelector({
  index,
  setNewStepType,
  pipeType,
}: {
  index: number;
  setNewStepType: (newStepObj: NewStepSelection) => void;
  pipeType: "pipeline" | "workbook";
}) {
  // If the pipeType is a pipeline, we don't want to show the display step
  // If the pipeType is a workbook, we want to show all steps
  const stepTypes =
    pipeType === "pipeline"
      ? _.filter(
          Object.values(StepIdentifierEnum),
          (stepType: StepIdentifier) => stepType !== "display",
        )
      : Object.values(StepIdentifierEnum);

  const renderStepType: ItemRenderer<string> = (
    stepIdentifier: string,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={stepIdentifier}
        roleStructure="listoption"
        text={stepIdentifier.charAt(0).toUpperCase() + stepIdentifier.slice(1)}
        onClick={handleClick}
      />
    );
  };

  const selectStepType = (stepIdentifier: string) => {
    setNewStepType({
      stepType: stepIdentifier as StepIdentifier,
      index: index,
    });
  };

  return (
    <div>
      <Select<string>
        className="w-fit"
        items={stepTypes}
        itemRenderer={renderStepType}
        onItemSelect={selectStepType}
        filterable={false}
        popoverProps={{ matchTargetWidth: false }}
      >
        <Button
          className="justify-center text-md w-[110px]"
          text="Add step"
          rightIcon="double-caret-vertical"
        />
      </Select>
    </div>
  );
}
