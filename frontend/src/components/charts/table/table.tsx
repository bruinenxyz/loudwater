"use client";
import { ErrorDisplay } from "@/components/error-display";
import QueryTableView from "@/components/old-reference/query/query-table-view";
import { useObjectDefinition } from "@/data/use-object-definition";
import { useQuery } from "@/data/use-query";
import { Pipeline, PartialPipeline } from "@/definitions";
import { Spinner, SpinnerSize } from "@blueprintjs/core";

export default function TableComponent({
  pipeline,
}: {
  pipeline: Pipeline | PartialPipeline;
}) {
  const {
    data: baseObjectDefinition,
    isLoading: isLoadingBaseObjectDefinition,
    error: baseObjectDefinitionError,
  } = useObjectDefinition(pipeline.from);

  const {
    data: previewData,
    isLoading: isLoadingPreviewData,
    error: previewDataError,
  } = useQuery(pipeline);

  if (isLoadingBaseObjectDefinition || isLoadingPreviewData) {
    return (
      <div className="flex flex-col items-center justify-center mx-3 mt-4">
        <Spinner size={SpinnerSize.STANDARD} />
      </div>
    );
  }

  if (baseObjectDefinitionError || previewDataError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={
          baseObjectDefinitionError
            ? baseObjectDefinitionError.message
            : previewDataError.message
        }
      />
    );
  }

  return (
    <div className="w-full h-[450px] max-w-full">
      <QueryTableView
        baseObjectDefinition={baseObjectDefinition!}
        queryResults={previewData}
        pipeline={pipeline}
      />
    </div>
  );
}
