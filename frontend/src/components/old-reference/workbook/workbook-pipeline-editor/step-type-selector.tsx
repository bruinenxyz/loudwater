"use client";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { NewStepSelection } from "./workbook-pipeline-editor";
import { StepIdentifier, StepIdentifierEnum } from "@/definitions";
import * as _ from "lodash";

export default function StepTypeSelector({
  index,
  setNewStepType,
}: {
  index: number;
  setNewStepType: (newStepObj: NewStepSelection) => void;
}) {
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
    <div className="flex flex-row">
      <Select<string>
        className="w-fit"
        items={Object.values(StepIdentifierEnum)}
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
      <Button
        className="justify-center ml-2 text-md w-fit"
        text="Add display"
        icon="timeline-area-chart"
        onClick={() =>
          setNewStepType({
            stepType: StepIdentifierEnum.Display,
            index: index,
          })
        }
      />
    </div>
  );
}
