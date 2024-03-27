"use client";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { NewStepSelection } from "./query-builder";
import { StepIdentifier, StepIdentifierEnum } from "@/definitions/pipeline";
import * as _ from "lodash";

export default function StepTypeSelector({
  index,
  setNewStepType,
  disabled,
}: {
  index: number;
  setNewStepType: (newStepObj: NewStepSelection) => void;
  disabled: boolean;
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
        disabled={disabled}
      />
    </Select>
  );
}
