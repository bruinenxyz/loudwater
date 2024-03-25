"use client";
import {
  ObjectDefinition,
  Step,
  StepIdentifierEnum,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import { StepTypeSelector } from "@/components/old-reference/pipeline";
import AggregateStepCreator from "../step-creators/aggregate/aggregate-step-creator";
import FilterStepCreator from "../step-creators/filter/filter-step-creator";
import NewStepSelection from "../step-creators/new-step-selection";
import OrderStepCreator from "../step-creators/order/order-step-creator";
import RelateStepCreator from "../step-creators/relate/relate-step-creator";
import SelectStepCreator from "../step-creators/select/select-step-creator";
import TakeStepCreator from "../step-creators/take/take-step-creator";
import BranchStepDisplay from "./branch-step-display";
import { ErrorDisplay } from "@/components/error-display";
import Loading from "@/app/loading";
import { useState } from "react";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import * as _ from "lodash";

export default function BranchPipelineEditor({
  objectDefinition,
  branchSteps,
  setBranchSteps,
  inputPipeline,
}: {
  objectDefinition: ObjectDefinition;
  branchSteps: Step[];
  setBranchSteps: (steps: Step[]) => void;
  inputPipeline: Workbook | PartialWorkbook;
}) {
  const [newStepType, setNewStepType] = useState<NewStepSelection | null>(null);

  const {
    data: branchSchema,
    error: branchSchemaError,
    isLoading: isLoadingBranchSchema,
  } = useValidatePipelineAndWorkbook({
    ...inputPipeline,
    steps: [...inputPipeline.steps, ...branchSteps],
  });

  if (isLoadingBranchSchema) {
    return <Loading />;
  }

  if (branchSchemaError || !branchSchema) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={branchSchemaError.message}
      />
    );
  }

  const firstInvalidStepIndex: number | null = branchSchema.success
    ? null
    : parseInt(branchSchema.error.issues[0].path[0]) -
      inputPipeline.steps.length;

  function addStepToBranch(newStep: WorkbookStep, index: number) {
    setNewStepType(null);
    if (newStep.type !== StepIdentifierEnum.Display) {
      const newBranchSteps = [...branchSteps];
      newBranchSteps.splice(index - inputPipeline.steps.length, 0, newStep);
      setBranchSteps(newBranchSteps);
    }
  }

  function renderStepCreator() {
    switch (newStepType!.stepType) {
      case StepIdentifierEnum.Select:
        return (
          <SelectStepCreator
            fullPipeline={{
              ...inputPipeline,
              steps: [...inputPipeline.steps, ...branchSteps],
            }}
            index={newStepType!.index + inputPipeline.steps.length}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToBranch}
          />
        );
      case StepIdentifierEnum.Filter:
        return (
          <FilterStepCreator
            fullPipeline={{
              ...inputPipeline,
              steps: [...inputPipeline.steps, ...branchSteps],
            }}
            index={newStepType!.index + inputPipeline.steps.length}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToBranch}
          />
        );
      case StepIdentifierEnum.Aggregate:
        return (
          <AggregateStepCreator
            fullPipeline={{
              ...inputPipeline,
              steps: [...inputPipeline.steps, ...branchSteps],
            }}
            index={newStepType!.index + inputPipeline.steps.length}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToBranch}
          />
        );
      case StepIdentifierEnum.Relate:
        return (
          <RelateStepCreator
            fullPipeline={{
              ...inputPipeline,
              steps: [...inputPipeline.steps, ...branchSteps],
            }}
            index={newStepType!.index + inputPipeline.steps.length}
            baseObjectDefinition={objectDefinition!}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToBranch}
          />
        );
      case StepIdentifierEnum.Order:
        return (
          <OrderStepCreator
            fullPipeline={{
              ...inputPipeline,
              steps: [...inputPipeline.steps, ...branchSteps],
            }}
            index={newStepType!.index + inputPipeline.steps.length}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToBranch}
          />
        );
      case StepIdentifierEnum.Take:
        return (
          <TakeStepCreator
            index={newStepType!.index + inputPipeline.steps.length}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToBranch}
          />
        );
    }
  }

  function renderTrailingStepCreator() {
    if (firstInvalidStepIndex === null) {
      if (newStepType && newStepType.index === branchSteps.length) {
        return renderStepCreator();
      } else {
        return (
          <StepTypeSelector
            index={branchSteps.length}
            setNewStepType={setNewStepType}
            pipeType="pipeline"
          />
        );
      }
    }
    return null;
  }

  return (
    <>
      {_.map(branchSteps, (step: Step, stepIndex: number) => {
        return (
          <>
            {newStepType && newStepType.index === stepIndex
              ? renderStepCreator()
              : (firstInvalidStepIndex === null ||
                  firstInvalidStepIndex >= stepIndex) && (
                  <StepTypeSelector
                    index={stepIndex}
                    setNewStepType={setNewStepType}
                    pipeType="pipeline"
                  />
                )}
            <BranchStepDisplay
              key={stepIndex}
              objectDefinition={objectDefinition}
              step={step}
              stepIndex={inputPipeline.steps.length + stepIndex}
              branchPipeline={{
                ...inputPipeline,
                steps: [...inputPipeline.steps, ...branchSteps],
              }}
              branchSteps={branchSteps}
              setBranchSteps={setBranchSteps}
              disabled={
                !!(
                  firstInvalidStepIndex !== null &&
                  stepIndex > firstInvalidStepIndex
                )
              }
            />
          </>
        );
      })}
      {renderTrailingStepCreator()}
    </>
  );
}
