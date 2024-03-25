"use client";
import * as _ from "lodash";

import { ErrorDisplay } from "@/components/error-display";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { InferredSchemaProperty, Pipeline } from "@/definitions/pipeline";
import { Card, Spinner, SpinnerSize, Text } from "@blueprintjs/core";

import PropertyIcon from "../property-icon";
import PipelineValidationErrorPopover from "./pipeline-validation-error-popover";

const MAX_PROPERTIES = 5;

export default function SavedPipelineCard({
  pipeline,
  onClick,
}: {
  pipeline: Pipeline;
  onClick?: () => void;
}) {
  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useValidatePipelineAndWorkbook(pipeline);

  if (isLoadingSchema) {
    return (
      <Card className="flex flex-col justify-center p-3 bp5-elevation-2">
        <Spinner size={SpinnerSize.STANDARD} />
      </Card>
    );
  }

  if (schemaError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={schemaError.message}
      />
    );
  }

  return (
    <Card
      className="flex flex-col justify-between gap-3 p-3 cursor-pointer bp5-elevation-2"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col w-5/6 gap-1">
          <Text className="flex-auto font-semibold" ellipsize={true}>
            {pipeline.name}
          </Text>
          <Text className="bp5-text-muted" ellipsize={true}>
            {pipeline.description}
          </Text>
        </div>
        {!schema!.success && (
          <PipelineValidationErrorPopover contentTitle={`Invalid pipeline`} />
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {schema!.success && (
            <>
              {_.map(
                _.slice(schema!.data!.properties, 0, MAX_PROPERTIES),
                (property: InferredSchemaProperty) => {
                  return (
                    <div
                      key={property.api_path}
                      className="flex flex-row items-center h-4 rounded cursor-pointer bg-bluprint-tag-gray"
                    >
                      <div className="flex flex-row items-center ml-1 mr-2">
                        <PropertyIcon property={property} />
                        <Text className="ml-1 text-bluprint-text-light">
                          {property.name}
                        </Text>
                      </div>
                    </div>
                  );
                },
              )}
              {schema!.data!.properties.length > MAX_PROPERTIES && (
                <div className="flex flex-row items-center">
                  <Text className="mx-1 text-black">
                    +{schema!.data!.properties.length - MAX_PROPERTIES}
                  </Text>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
