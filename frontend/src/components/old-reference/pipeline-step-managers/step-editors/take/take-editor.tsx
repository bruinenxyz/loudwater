"use client";
import { TakeStep, StepIdentifierEnum, WorkbookStep } from "@/definitions";
import { Button, NumericInput, Section, Text } from "@blueprintjs/core";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";

export default function TakeEditor({
  step,
  stepIndex,
  updateStep,
  setIsEditing,
}: {
  step: TakeStep;
  stepIndex: number;
  updateStep: (step: WorkbookStep, index: number) => void;
  setIsEditing: (value: boolean) => void;
}) {
  // State for the limit
  const limit = useField<number>(step.limit, {
    valueTransformer: (value) => {
      return value === 0 ? 1 : value;
    },
  });
  // State for the offset
  const offset = useField<number>(step.offset);

  function renderRightElement() {
    return (
      <div className="flex flex-row">
        <Button
          alignText="left"
          disabled={limit.value === undefined || offset.value === undefined}
          text="Save"
          onClick={() =>
            updateStep(
              {
                type: StepIdentifierEnum.Take,
                limit: limit.value,
                offset: offset.value,
              } as TakeStep,
              stepIndex,
            )
          }
        />
        <Button
          className="ml-2"
          alignText="left"
          text="Cancel"
          onClick={() => setIsEditing(false)}
        />
      </div>
    );
  }
  return (
    <Section
      className="flex-none w-full my-2 rounded-sm"
      title={<Text className="text-xl">Take</Text>}
      rightElement={renderRightElement()}
    >
      <div className="flex flex-row gap-3 mx-3 my-2">
        <NumericInput
          placeholder="limit"
          allowNumericCharactersOnly={true}
          min={1}
          {...limit}
        />
        <NumericInput
          placeholder="offset"
          allowNumericCharactersOnly={true}
          min={0}
          {...offset}
        />
      </div>
    </Section>
  );
}
