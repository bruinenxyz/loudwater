"use client";
import { ObjectDefinition, Workbook, PartialWorkbook } from "@/definitions";
import { Callout, Spinner, SpinnerSize, Text } from "@blueprintjs/core";
import { ErrorDisplay } from "@/components/error-display";
import QueryTableView from "@/components/old-reference/query/query-table-view";
import { useQuery } from "@/data/use-query";

export default function WorkbookDataView({
  workbook,
  workbookValid,
  baseObjectDefinition,
}: {
  workbook: Workbook | PartialWorkbook;
  workbookValid: boolean;
  baseObjectDefinition: ObjectDefinition;
}) {
  const {
    data: previewData,
    isLoading: isLoadingPreviewData,
    error: previewDataError,
  } = useQuery(workbook);

  if (!workbookValid) {
    return (
      <div className="flex flex-row items-center justify-center">
        <Callout
          intent="warning"
          icon="warning-sign"
          title="Workbook is invalid"
          className="border w-fit"
        >
          <Text>
            Cannot display results for an invalid workbook. Please fix the
            workbook errors and try again.
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
      pipeline={workbook}
    />
  );
}
