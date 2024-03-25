"use client";
import { StepIdentifierEnum, TakeStep, WorkbookStep } from "@/definitions";
import { Button, NumericInput, Section, Text } from "@blueprintjs/core";
import NewStepSelection from "../new-step-selection";
import { useField } from "@/utils/use-field";

export default function TakeStepCreator({
  index,
  setNewStepType,
  addStepToPipeline,
}: {
  index: number;
  setNewStepType: (newStepObj: NewStepSelection | null) => void;
  addStepToPipeline: (newStep: WorkbookStep, index: number) => void;
}) {
  const limit = useField<number | undefined>(undefined, {
    valueTransformer: (value) => {
      return value === 0 ? 1 : value;
    },
  });
  const offset = useField<number | undefined>(undefined);

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={<Text className="text-xl">Take</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={limit.value === undefined || offset.value === undefined}
            text="Add step"
            onClick={() =>
              addStepToPipeline(
                {
                  type: StepIdentifierEnum.Take,
                  limit: limit.value,
                  offset: offset.value,
                } as TakeStep,
                index,
              )
            }
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel step"
            onClick={() => {
              setNewStepType(null);
            }}
          />
        </div>
      }
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
