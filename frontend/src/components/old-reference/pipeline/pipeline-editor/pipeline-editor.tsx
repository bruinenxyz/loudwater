"use client";
import {
  Pipeline,
  Step,
  StepIdentifier,
  StepIdentifierEnum,
  PartialPipeline,
} from "@/definitions/pipeline";
import { Section, Spinner, SpinnerSize } from "@blueprintjs/core";
import { StepTypeSelector } from "@/components/old-reference/pipeline";
import {
  AggregateStepCreator,
  BaseStepDisplay,
  FilterStepCreator,
  FromDisplay,
  OrderStepCreator,
  RelateStepCreator,
  SelectStepCreator,
  TakeStepCreator,
} from "@/components/old-reference/pipeline-step-managers";
import { useObjectDefinition } from "@/data/use-object-definition";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import { WorkbookStep } from "@/definitions";

export type NewStepSelection = {
  stepType: StepIdentifier;
  index: number;
};

export default function PipelineEditor({
  pipeline,
  setPipeline,
  editable,
}: {
  pipeline: Pipeline | PartialPipeline;
  setPipeline: (pipeline: Pipeline | PartialPipeline) => void;
  editable: boolean;
}) {
  const [newStepType, setNewStepType] = useState<NewStepSelection | null>(null);

  useEffect(() => {
    setNewStepType(null);
  }, [pipeline]);

  const {
    data: objectDefinition,
    isLoading: isLoadingObjectDefinition,
    error: objectDefinitionError,
  } = useObjectDefinition(pipeline.from);
  const {
    data: schema,
    error: schemaError,
    isLoading: isLoadingSchema,
  } = useValidatePipelineAndWorkbook(pipeline);

  if (isLoadingObjectDefinition || isLoadingSchema) {
    return (
      <Section className="w-full m-4" style={{ height: "calc(100% - 58px)" }}>
        <div className="flex flex-col items-center justify-center mx-3 mt-4">
          <Spinner size={SpinnerSize.STANDARD} />
        </div>
      </Section>
    );
  }

  if (!objectDefinition || objectDefinitionError) {
    return null; //TODO: add error state
  }

  if (!schema || schemaError) {
    return null; //TODO: add error state
  }

  function addStepToPipeline(newStep: WorkbookStep, index: number) {
    if (newStep.type !== StepIdentifierEnum.Display) {
      const newSteps: Step[] = [...pipeline.steps];
      newSteps.splice(index, 0, newStep as Step);
      setPipeline({ ...pipeline, steps: newSteps });
      setNewStepType(null);
    }
  }

  function deleteStep(index: number) {
    const newSteps = [...pipeline.steps];
    newSteps.splice(index, 1);
    setPipeline({
      ...pipeline,
      steps: newSteps,
    });
  }

  function updateStep(newStep: WorkbookStep, index: number) {
    if (newStep.type !== StepIdentifierEnum.Display) {
      const newSteps: Step[] = _.update(
        [...pipeline.steps],
        index,
        () => newStep,
      );
      setPipeline({ ...pipeline, steps: newSteps });
    }
  }

  const firstInvalidStepIndex: number | null = schema.success
    ? null
    : parseInt(schema.error.issues[0].path[0]);

  function renderStepCreator() {
    switch (newStepType!.stepType) {
      case StepIdentifierEnum.Select:
        return (
          <SelectStepCreator
            fullPipeline={pipeline}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Filter:
        return (
          <FilterStepCreator
            fullPipeline={pipeline}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Aggregate:
        return (
          <AggregateStepCreator
            fullPipeline={pipeline}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Relate:
        return (
          <RelateStepCreator
            fullPipeline={pipeline}
            index={newStepType!.index}
            baseObjectDefinition={objectDefinition!}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Order:
        return (
          <OrderStepCreator
            fullPipeline={pipeline}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Take:
        return (
          <TakeStepCreator
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
    }
  }

  return (
    <>
      <FromDisplay objectDefinition={objectDefinition} editable={false} />
      {_.map(pipeline.steps, (step: Step, stepIndex: number) => {
        return (
          <>
            {editable &&
              (newStepType && newStepType.index === stepIndex
                ? renderStepCreator()
                : (firstInvalidStepIndex === null ||
                    firstInvalidStepIndex >= stepIndex) && (
                    <StepTypeSelector
                      index={stepIndex}
                      setNewStepType={setNewStepType}
                      pipeType="pipeline"
                    />
                  ))}
            <BaseStepDisplay
              key={stepIndex}
              objectDefinition={objectDefinition}
              step={step}
              stepIndex={stepIndex}
              pipeline={pipeline}
              deleteStep={deleteStep}
              updateStep={updateStep}
              disabled={
                !!(
                  firstInvalidStepIndex !== null &&
                  stepIndex > firstInvalidStepIndex
                )
              }
              editable={editable}
            />
          </>
        );
      })}
      {editable &&
        (newStepType && newStepType.index === pipeline.steps.length ? (
          renderStepCreator()
        ) : (
          <StepTypeSelector
            index={pipeline.steps.length}
            setNewStepType={setNewStepType}
            pipeType="pipeline"
          />
        ))}
    </>
  );
}
