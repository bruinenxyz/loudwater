import { ErrorDisplay } from "@/components/error-display";
import { DisplayStep } from "@/components/old-reference/pipeline-step-managers";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import {
  ObjectDefinition,
  StepIdentifierEnum,
  WorkbookPipeline,
  WorkbookStep,
} from "@/definitions";
import { Section, Spinner, SpinnerSize } from "@blueprintjs/core";
import * as _ from "lodash";
import React from "react";

export default function WorkbookDisplayChartStep({
  workbook,
}: {
  workbook: WorkbookPipeline;
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

  return (
    <>
      {_.map(workbook.steps, (step: WorkbookStep, stepIndex: number) => {
        return (
          <>
            {step.type === StepIdentifierEnum.Display && (
              <DisplayStep
                editable={false}
                key={stepIndex}
                step={step}
                stepIndex={stepIndex}
                fullPipeline={workbook}
                setPipeline={(_) => {}}
                disabled={
                  !!(
                    firstInvalidStepIndex !== null &&
                    stepIndex > firstInvalidStepIndex
                  )
                }
              />
            )}
          </>
        );
      })}
    </>
  );
}
