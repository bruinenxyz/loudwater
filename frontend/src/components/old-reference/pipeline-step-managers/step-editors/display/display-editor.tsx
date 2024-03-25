"use client";
import { ObjectDefinition, PartialWorkbook } from "@/definitions";
import { DisplayConfig } from "@/definitions/displays/displays";
import { DisplayStep, Step, StepIdentifierEnum, Workbook } from "@/definitions";
import { Button, Divider, Section, Text } from "@blueprintjs/core";
import BranchStepManager from "../../step-creators/display/branch-manager/branch-step-manager";
import ChartEditor from "./chart-editor/chart-editor";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";

export default function DisplayEditor({
  step,
  stepIndex,
  inputPipeline,
  branchPipeline,
  baseObjectDefinition,
  updateStep,
  setIsEditing,
}: {
  step: DisplayStep;
  stepIndex: number;
  inputPipeline: PartialWorkbook;
  branchPipeline: Workbook | PartialWorkbook;
  baseObjectDefinition: ObjectDefinition;
  updateStep: (step: DisplayStep, index: number) => void;
  setIsEditing: (toggle: boolean) => void;
}) {
  const [branchSteps, setBranchSteps] = useState<Step[]>(step.steps);
  const [displayPipeline, setDisplayPipeline] = useState<
    Workbook | PartialWorkbook
  >({
    ...branchPipeline,
  });
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig | null>({
    ...step.display,
  });

  // Output schema for the displayPipeline
  const {
    data: branchSchema,
    error: branchSchemaError,
    isLoading: isLoadingBranchSchema,
  } = useValidatePipelineAndWorkbook(displayPipeline);

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
    : parseInt(branchSchema.error.issues[0].path[0]);

  return (
    <Section
      className="flex-none w-full my-2 rounded-sm"
      title={<Text className="text-xl">Display</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!displayConfig}
            text="Save step"
            onClick={() => {
              updateStep(
                {
                  type: StepIdentifierEnum.Display,
                  steps: branchSteps,
                  display: displayConfig,
                } as DisplayStep,
                stepIndex,
              );
            }}
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel"
            onClick={() => {
              setIsEditing(false);
            }}
          />
        </div>
      }
    >
      <div className="p-3">
        <BranchStepManager
          objectDefinition={baseObjectDefinition}
          index={stepIndex}
          firstInvalidStepIndex={firstInvalidStepIndex}
          inputPipeline={inputPipeline}
          displayPipeline={displayPipeline}
          displaySchema={branchSchema}
          setDisplayPipeline={setDisplayPipeline}
          branchSteps={branchSteps}
          setBranchSteps={setBranchSteps}
        />

        <>
          <div className="py-2">
            <Divider />
          </div>
          <ChartEditor
            branchSchema={branchSchema}
            setDisplayConfig={setDisplayConfig}
            baseDisplayConfig={step.display}
          />
        </>
      </div>
    </Section>
  );
}
