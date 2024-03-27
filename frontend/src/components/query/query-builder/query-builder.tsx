"use client";
import {
  Pipeline,
  SelectStep,
  Step,
  StepIdentifier,
  StepIdentifierEnum,
} from "@/definitions/pipeline";
import { Section } from "@blueprintjs/core";
import FromStepComponent from "./steps/from-step";
import SelectStepComponent from "./steps/select-step";
import * as _ from "lodash";
import { useState, useEffect } from "react";
import StepTypeSelector from "./step-type-selector";

interface QueryBuilderProps {
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
}

export type NewStepSelection = {
  stepType: StepIdentifier;
  index: number;
};

export default function QueryBuilder({
  pipeline,
  setPipeline,
}: QueryBuilderProps) {
  const [newStepType, setNewStepType] = useState<NewStepSelection | null>(null);
  const [editStepIndex, setEditStepIndex] = useState<number | null>(
    pipeline.from ? null : -1,
  );

  useEffect(() => {
    setNewStepType(null);
  }, [pipeline]);

  function renderStep(step: Step, index: number) {
    switch (step.type) {
      case StepIdentifierEnum.Select:
        return (
          <SelectStepComponent
            key={index}
            step={step as SelectStep}
            pipeline={pipeline}
            setPipeline={setPipeline}
            editStepIndex={editStepIndex}
            setEditStepIndex={setEditStepIndex}
            newStepType={newStepType}
          />
        );
    }
    return <></>;
  }

  function renderSteps() {
    return (
      <>
        {_.map(pipeline.steps, (step: Step, index) => {
          return (
            <>
              {newStepType && newStepType.index === index ? (
                <></>
              ) : (
                <StepTypeSelector
                  index={index}
                  setNewStepType={setNewStepType}
                  disabled={newStepType !== null || editStepIndex !== null}
                />
              )}
              {renderStep(step, index)}
            </>
          );
        })}
        {newStepType && newStepType.index === pipeline.steps.length ? (
          <></>
        ) : (
          <StepTypeSelector
            index={pipeline.steps.length}
            setNewStepType={setNewStepType}
            disabled={newStepType !== null || editStepIndex !== null}
          />
        )}
      </>
    );
  }

  return (
    <Section className="overflow-y-auto h-[400px] flex flex-col p-3 gap-y-2">
      <FromStepComponent
        pipeline={pipeline}
        setPipeline={setPipeline}
        editStepIndex={editStepIndex}
        setEditStepIndex={setEditStepIndex}
        newStepType={newStepType}
      />
      {pipeline.from && renderSteps()}
    </Section>
  );
}
