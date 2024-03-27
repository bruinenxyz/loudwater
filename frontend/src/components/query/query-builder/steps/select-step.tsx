"use client";
import { Pipeline, SelectStep } from "@/definitions/pipeline";
import { Button, Section } from "@blueprintjs/core";

interface SelectStepProps {
  key: number;
  step: SelectStep;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
}

export default function SelectStepComponent({
  key,
  step,
  pipeline,
  setPipeline,
}: SelectStepProps) {
  return (
    <Section
      className="flex-none w-full rounded-sm"
      title={renderContent()}
      rightElement={
        <div className="flex flex-row">
          {isEditing ? (
            <Button
              alignText="left"
              disabled={!selected}
              text="Confirm step"
              onClick={() => {
                setPipeline({ ...pipeline, steps: [] });
                setIsEditing(false);
              }}
            />
          ) : (
            <Button
              alignText="left"
              text="Edit step"
              onClick={() => setIsEditing(true)}
            />
          )}
        </div>
      }
    />
  );
}
