"use client";
import { StepIdentifierEnum, StepIdentifier } from "@/definitions";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import NewStepSelection from "../step-creators/new-step-selection";
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
        text={_.capitalize(stepIdentifier)}
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
        items={_.filter(
          Object.values(StepIdentifierEnum),
          (stepIdentifier) => stepIdentifier !== StepIdentifierEnum.Display,
        )}
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
