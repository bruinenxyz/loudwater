"use client";
import { Pipeline, SelectStep } from "@/definitions/pipeline";
import { Button, Section } from "@blueprintjs/core";
import { NewStepSelection } from "../query-builder";

interface SelectStepProps {
  key: number;
  step: SelectStep;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  editStepIndex: number | null;
  setEditStepIndex: (value: number | null) => void;
  newStepType: NewStepSelection | null;
}

export default function SelectStepComponent({
  key,
  step,
  pipeline,
  setPipeline,
  editStepIndex,
  setEditStepIndex,
  newStepType,
}: SelectStepProps) {
  return (
    <Section
      className="flex-none w-full rounded-sm"
      title={renderContent()}
      rightElement={
        <div className="flex flex-row">
          {editStepIndex === key ? (
            <Button
              alignText="left"
              disabled={!selected}
              text="Confirm step"
              onClick={() => {
                setPipeline({ ...pipeline, steps: [] });
                setEditStepIndex(null);
              }}
            />
          ) : (
            <Button
              alignText="left"
              text="Edit step"
              disabled={editStepIndex !== null || newStepType !== null}
              onClick={() => setEditStepIndex(key)}
            />
          )}
        </div>
      }
    />
  );
}
