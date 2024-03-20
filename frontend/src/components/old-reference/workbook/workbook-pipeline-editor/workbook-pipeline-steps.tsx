"use client";
import * as _ from "lodash";

import { ErrorDisplay } from "@/components/error-display";
// Step creators
import {
  AggregateStepCreator,
  BaseStepDisplay,
  DisplayStep,
  DisplayStepCreator,
  FilterStepCreator,
  OrderStepCreator,
  RelateStepCreator,
  SelectStepCreator,
  TakeStepCreator,
} from "@/components/old-reference/pipeline-step-managers";
// Step displays
import {
  ObjectDefinition,
  StepIdentifierEnum,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import { Section, Spinner, SpinnerSize } from "@blueprintjs/core";

import StepTypeSelector from "./step-type-selector";
import { NewStepSelection } from "./workbook-pipeline-editor";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import ChartCreator from "@/components/old-reference/pipeline-step-managers/step-creators/display/chart-creator/chart-creator";

export default function WorkbookPipelineSteps({
  editable,
  objectDefinition,
  newStepType,
  setNewStepType,
  workbook,
  setWorkbook,
}: {
  editable?: boolean;
  objectDefinition: ObjectDefinition;
  newStepType: NewStepSelection | null;
  setNewStepType: (newStepType: NewStepSelection | null) => void;
  workbook: Workbook | PartialWorkbook;
  setWorkbook: (workbook: Workbook | PartialWorkbook) => void;
}) {
  const {
    data: schema,
    error: schemaError,
    isLoading: isLoadingSchema,
  } = useValidatePipelineAndWorkbook(workbook);

  if (isLoadingSchema) {
    return (
      <Section className="w-full m-4" style={{ height: "calc(100% - 58px)" }}>
        <div className="flex flex-col items-center justify-center mx-3 mt-4">
          <Spinner size={SpinnerSize.STANDARD} />
        </div>
      </Section>
    );
  }

  if (schemaError || !schema) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={schemaError.message}
      />
    );
  }

  const firstInvalidStepIndex: number | null = schema.success
    ? null
    : parseInt(schema.error.issues[0].path[0]);

  function addStepToPipeline(newStep: WorkbookStep, index: number) {
    const newSteps: WorkbookStep[] = [...workbook.steps];
    newSteps.splice(index, 0, newStep);
    setWorkbook({ ...workbook, steps: newSteps });
    setNewStepType(null);
  }

  function deleteStep(index: number) {
    const newSteps = [...workbook.steps];
    newSteps.splice(index, 1);
    setWorkbook({
      ...workbook,
      steps: newSteps,
    });
  }

  function updateStep(newStep: WorkbookStep, index: number) {
    const newSteps: WorkbookStep[] = _.update(
      [...workbook.steps],
      index,
      () => newStep,
    );
    setWorkbook({ ...workbook, steps: newSteps });
  }

  function renderStepCreator() {
    switch (newStepType!.stepType) {
      case StepIdentifierEnum.Select:
        return (
          <SelectStepCreator
            fullPipeline={workbook}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Filter:
        return (
          <FilterStepCreator
            fullPipeline={workbook}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Aggregate:
        return (
          <AggregateStepCreator
            fullPipeline={workbook}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Relate:
        return (
          <RelateStepCreator
            fullPipeline={workbook}
            index={newStepType!.index}
            baseObjectDefinition={objectDefinition!}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
      case StepIdentifierEnum.Order:
        return (
          <OrderStepCreator
            fullPipeline={workbook}
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
      case StepIdentifierEnum.Display:
        return (
          <DisplayStepCreator
            objectDefinition={objectDefinition}
            fullPipeline={workbook}
            index={newStepType!.index}
            setNewStepType={setNewStepType}
            addStepToPipeline={addStepToPipeline}
          />
        );
    }
  }

  return (
    <>
      {_.map(workbook.steps, (step: WorkbookStep, stepIndex: number) => {
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
                    />
                  ))}
            {step.type === StepIdentifierEnum.Display ? (
              editable && (
                <DisplayStep
                  editable={editable}
                  key={stepIndex}
                  step={step}
                  stepIndex={stepIndex}
                  fullPipeline={workbook}
                  setPipeline={setWorkbook}
                  disabled={
                    !!(
                      firstInvalidStepIndex !== null &&
                      stepIndex > firstInvalidStepIndex
                    )
                  }
                />
              )
            ) : (
              <BaseStepDisplay
                key={stepIndex}
                objectDefinition={objectDefinition}
                step={step}
                stepIndex={stepIndex}
                pipeline={workbook}
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
            )}
          </>
        );
      })}
      {editable &&
        (newStepType && newStepType.index === workbook.steps.length ? (
          renderStepCreator()
        ) : (
          <StepTypeSelector
            index={workbook.steps.length}
            setNewStepType={setNewStepType}
          />
        ))}
    </>
  );
}
