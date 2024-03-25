"use client";
import { ErrorDisplay } from "@/components/error-display";
import QueryTableView from "@/components/old-reference/query/query-table-view";
import { useQuery } from "@/data/use-query";
import { ObjectDefinition } from "@/definitions";
import { Pipeline, PartialPipeline } from "@/definitions/pipeline";
import { Callout, Spinner, SpinnerSize, Text } from "@blueprintjs/core";

export default function PipelineDataView({
  pipeline,
  pipelineValid,
  baseObjectDefinition,
}: {
  pipeline: Pipeline | PartialPipeline;
  pipelineValid: boolean;
  baseObjectDefinition: ObjectDefinition;
}) {
  const {
    data: previewData,
    isLoading: isLoadingPreviewData,
    error: previewDataError,
  } = useQuery(pipeline);

  if (!pipelineValid) {
    return (
      <div className="flex flex-row items-center justify-center">
        <Callout
          intent="warning"
          icon="warning-sign"
          title="Pipeline is invalid"
          className="border w-fit"
        >
          <Text>
            Cannot display results for an invalid pipeline. Please fix the
            pipeline errors and try again.
          </Text>
        </Callout>
      </div>
    );
  }

  if (isLoadingPreviewData) {
    return (
      <div className="flex flex-col items-center justify-center h-full mx-3 mt-4">
        <Spinner size={SpinnerSize.STANDARD} />
      </div>
    );
  }

  if (previewDataError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={previewDataError.message}
      />
    );
  }

  return (
    <QueryTableView
      baseObjectDefinition={baseObjectDefinition!}
      queryResults={previewData}
      pipeline={pipeline}
    />
  );
}
