"use client";
import {
  DisplayStep,
  ObjectDefinition,
  Step,
  StepIdentifierEnum,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import { DisplayConfig } from "@/definitions/displays/displays";
import { Button, Divider, Section, Text } from "@blueprintjs/core";
import BranchStepManager from "./branch-manager/branch-step-manager";
import ChartCreator from "./chart-creator/chart-creator";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { NewStepSelection } from "@/components/old-reference/workbook";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";
import * as _ from "lodash";

export default function DisplayStepCreator({
  objectDefinition,
  fullPipeline,
  index,
  setNewStepType,
  addStepToPipeline,
}: {
  objectDefinition: ObjectDefinition;
  fullPipeline: Workbook | PartialWorkbook;
  index: number;
  setNewStepType: (newStepObj: NewStepSelection | null) => void;
  addStepToPipeline: (newStep: WorkbookStep, index: number) => void;
}) {
  const inputPipeline = {
    from: fullPipeline.from,
    steps: _.slice(fullPipeline.steps, 0, index),
  };

  const [branchSteps, setBranchSteps] = useState<Step[]>([]);
  const [displayPipeline, setDisplayPipeline] = useState<PartialWorkbook>({
    ...inputPipeline,
  });
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig | null>(
    null,
  );

  const {
    data: displaySchema,
    error: displaySchemaError,
    isLoading: isLoadingDisplaySchema,
  } = useValidatePipelineAndWorkbook(displayPipeline);

  if (isLoadingDisplaySchema) {
    return <Loading />;
  }

  if (displaySchemaError || !displaySchema) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={displaySchemaError.message}
      />
    );
  }

  const firstInvalidStepIndex: number | null = displaySchema.success
    ? null
    : parseInt(displaySchema.error.issues[0].path[0]);

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={<Text className="text-xl">Display</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!displayConfig}
            text="Add step"
            onClick={() =>
              addStepToPipeline(
                {
                  type: StepIdentifierEnum.Display,
                  steps: branchSteps,
                  display: displayConfig,
                } as DisplayStep,
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
      <div className="p-3">
        <BranchStepManager
          objectDefinition={objectDefinition}
          index={index}
          firstInvalidStepIndex={firstInvalidStepIndex}
          inputPipeline={inputPipeline}
          displayPipeline={displayPipeline}
          displaySchema={displaySchema}
          setDisplayPipeline={setDisplayPipeline}
          branchSteps={branchSteps}
          setBranchSteps={setBranchSteps}
        />
        {displaySchema.success && (
          <>
            <div className="py-2">
              <Divider />
            </div>
            <ChartCreator
              displaySchema={displaySchema}
              setDisplayConfig={setDisplayConfig}
            />
          </>
        )}
      </div>
    </Section>
  );
}
