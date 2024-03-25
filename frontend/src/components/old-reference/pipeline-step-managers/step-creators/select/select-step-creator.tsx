"use client";
import {
  InferredSchemaProperty,
  Pipeline,
  SelectStep,
  StepIdentifierEnum,
  PartialPipeline,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import { Button, Section, Text } from "@blueprintjs/core";
import NewStepSelection from "../new-step-selection";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { MultiPropertySelector } from "@/components/old-reference/property-selectors";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";
import * as _ from "lodash";

export default function SelectStepCreator({
  fullPipeline,
  index,
  setNewStepType,
  addStepToPipeline,
}: {
  fullPipeline: Workbook | Pipeline | PartialPipeline | PartialWorkbook;
  index: number;
  setNewStepType: (newStepObj: NewStepSelection | null) => void;
  addStepToPipeline: (newStep: WorkbookStep, index: number) => void;
}) {
  const [selected, setSelected] = useState<InferredSchemaProperty[]>([]);

  const partialPipeline = {
    ...fullPipeline,
    steps: fullPipeline.steps.slice(0, index),
  };

  const {
    data: schema,
    error: schemaError,
    isLoading: isLoadingSchema,
  } = useValidatePipelineAndWorkbook(partialPipeline);

  if (isLoadingSchema) {
    return <Loading />;
  }

  if (schemaError || !schema || !schema.success) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={schemaError.message}
      />
    );
  }

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={<Text className="text-xl">Select</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!selected.length}
            text="Add step"
            onClick={() =>
              addStepToPipeline(
                {
                  type: StepIdentifierEnum.Select,
                  select: _.map(
                    selected,
                    (property: InferredSchemaProperty) => property.api_path,
                  ),
                } as SelectStep,
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
      <MultiPropertySelector
        className="mx-3 my-2"
        items={schema!.data.properties}
        selected={selected}
        setSelected={setSelected}
      />
    </Section>
  );
}
