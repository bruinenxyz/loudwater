"use client";
import {
  InferredSchemaColumn,
  Pipeline,
  SelectStep,
} from "@/definitions/pipeline";
import { Button, Section, Text } from "@blueprintjs/core";
import { NewStepSelection } from "../query-builder";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import MultiColumnSelector from "@/components/column-selectors/multi-column-selector/multi-column-selector";
import { useState } from "react";
import { usePipelineSchema } from "@/data/use-user-query";
import * as _ from "lodash";

interface SelectStepProps {
  key: number;
  step: SelectStep;
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  editStepIndex: number | null;
  setEditStepIndex: (value: number | null) => void;
  newStepType: NewStepSelection | null;
}

export default function SelectStepComponent({
  key,
  step,
  pipeline,
  setPipeline,
  editStepIndex,
  setEditStepIndex,
  newStepType,
}: SelectStepProps) {
  const [selected, setSelected] = useState<InferredSchemaColumn[]>(step.select);

  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = usePipelineSchema({
    ...pipeline,
    steps: _.slice(pipeline.steps, 0, key),
  });

  function renderContent() {
    if (isLoadingSchema) {
      return <Loading />;
    } else if (schemaError || !schema) {
      return <ErrorDisplay description={schemaError} />;
    } else {
      if (editStepIndex === key) {
        return (
          <div className="flex flex-row items-center">
            <Text className="mr-3 text-xl">Select:</Text>
            <MultiColumnSelector
              selected={selected}
              setSelected={setSelected}
              items={schema}
            />
          </div>
        );
      } else {
        return (
          <div className="flex flex-row items-center">
            <Text className="text-xl">From:</Text>
            <Button className="ml-2 bg-white border border-bluprint-border-gray">
              {/* <div className="flex flex-row items-center">
                <SquareIcon
                  icon={fromTable.icon as IconName}
                  color={fromTable.color}
                  size={SquareIconSize.SMALL}
                />
                <div className="flex flex-row items-center ml-2">
                  <Text className="text-md">{fromTable.name}</Text>
                </div>
              </div> */}
            </Button>
          </div>
        );
      }
    }
  }

  return (
    <Section
      className="flex-none w-full rounded-sm"
      title={renderContent()}
      rightElement={
        <div className="flex flex-row">
          {editStepIndex === key ? (
            <Button
              alignText="left"
              disabled={selected.length === 0}
              text="Confirm step"
              onClick={() => {
                setPipeline({ ...pipeline, steps: [] });
                setEditStepIndex(null);
              }}
            />
          ) : (
            <Button
              alignText="left"
              text="Edit step"
              disabled={editStepIndex !== null || newStepType !== null}
              onClick={() => setEditStepIndex(key)}
            />
          )}
        </div>
      }
    />
  );
}
