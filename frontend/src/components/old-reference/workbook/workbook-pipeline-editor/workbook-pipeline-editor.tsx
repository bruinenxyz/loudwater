"use client";
import * as _ from "lodash";
import { useEffect, useState } from "react";
import { useObjectDefinition } from "@/data/use-object-definition";
import { Workbook, PartialWorkbook, StepIdentifier } from "@/definitions";
import { Section, Spinner, SpinnerSize } from "@blueprintjs/core";
import WorkbookPipelineSteps from "./workbook-pipeline-steps";
import {
  FromDisplay,
  FromStepCreator,
} from "@/components/old-reference/pipeline-step-managers";
import { ErrorDisplay } from "@/components/error-display";

export type NewStepSelection = {
  stepType: StepIdentifier;
  index: number;
};

export default function WorkbookPipelineEditor({
  editable,
  workbook,
  setWorkbook,
}: {
  editable?: boolean;
  workbook: Workbook | PartialWorkbook;
  setWorkbook: (pipeline: Workbook | PartialWorkbook) => void;
}) {
  const [newStepType, setNewStepType] = useState<NewStepSelection | null>(null);

  useEffect(() => {
    setNewStepType(null);
  }, [workbook]);

  const {
    data: objectDefinition,
    isLoading: isLoadingObjectDefinition,
    error: objectDefinitionError,
  } = useObjectDefinition(workbook.from ? workbook.from : undefined);

  if (isLoadingObjectDefinition) {
    return (
      <Section className="w-full m-4" style={{ height: "calc(100% - 58px)" }}>
        <div className="flex flex-col items-center justify-center mx-3 mt-4">
          <Spinner size={SpinnerSize.STANDARD} />
        </div>
      </Section>
    );
  }

  if (objectDefinitionError) {
    return (
      <ErrorDisplay
        title="Error loading object definition"
        description={objectDefinitionError}
      />
    );
  }

  return (
    <>
      {!objectDefinition ? (
        <FromStepCreator setPipeline={setWorkbook} />
      ) : (
        <>
          <FromDisplay
            editable={editable}
            objectDefinition={objectDefinition}
            setPipeline={setWorkbook}
          />
          <WorkbookPipelineSteps
            editable={editable}
            objectDefinition={objectDefinition}
            newStepType={newStepType}
            setNewStepType={setNewStepType}
            workbook={workbook}
            setWorkbook={setWorkbook}
          />
        </>
      )}
    </>
  );
}
