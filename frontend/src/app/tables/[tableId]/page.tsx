"use client";
import { FilterStep, OrderStep, TakeStep } from "@/definitions/pipeline";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import Table from "@/components/table/table";
import { TableHeader } from "@/components/table/table-header";
import { AppToaster } from "@/components/toaster/toaster";
import { useClipboard } from "use-clipboard-copy";
import {
  useTable,
  useResults,
  useTablePk,
  useUpdateCell,
  useTableEnums,
} from "@/data/use-tables";
import { useState } from "react";
import * as _ from "lodash";

interface ObjectViewPageProps {
  params: {
    tableId: string;
  };
}

export default function ObjectViewPage(props: ObjectViewPageProps) {
  const [resultsConfig, setResultsConfig] = useState<{
    filters?: FilterStep;
    order?: OrderStep;
    take?: TakeStep;
  }>({
    filters: undefined,
    order: undefined,
    take: undefined,
  });
  const {
    data: table,
    isLoading: isLoadingTable,
    error: tableError,
  } = useTable(props.params.tableId);
  const {
    data: results,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useResults(resultsConfig, table?.id);

  const {
    data: tablePk,
    isLoading: isLoadingPk,
    error: pkError,
  } = useTablePk(table?.id);
  const {
    data: tableEnums,
    isLoading: isLoadingEnums,
    error: enumsError,
  } = useTableEnums(table?.id);

  // use the useUpdateCell hook
  const {
    trigger: updateCell,
    error: updateCellError,
    isMutating,
  } = useUpdateCell(resultsConfig, table?.id);

  const clipboard = useClipboard();

  const handleTagClick = async () => {
    clipboard.copy(table?.external_name);
    const toaster = await AppToaster;
    toaster.show({
      message: `Copied ${table?.external_name} to clipboard`,
      icon: "clipboard",
    });
  };

  const handleEditConfirm = (
    newValue: any,
    rowIndex: number,
    columnName: string,
  ) => {
    // Implement check for whether it is the same value
    const existingValue = _.get(results, `[${rowIndex}][${columnName}]`);
    if (existingValue !== newValue) {
      if (!tablePk) {
        return;
      }
      const rowPk = _.get(tablePk.rows[0], "column_name");
      const rowId = _.get(results.rows, `[${rowIndex}][${rowPk}]`);
      updateCell({
        value: newValue,
        rowId: rowId,
        column: columnName,
        pkColumn: rowPk,
      });
    }
  };

  if (
    (isLoadingTable && !table) ||
    (isLoadingEnums && !tableEnums) ||
    (isLoadingPk && !tablePk)
  ) {
    return <Loading />;
  }

  if (
    tableError ||
    !table ||
    enumsError ||
    !tableEnums ||
    pkError ||
    !tablePk
  ) {
    return (
      <ErrorDisplay
        title="An unexpected error occurred"
        description={tableError?.message}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TableHeader table={table} />
      <Table
        table={table}
        results={results}
        isEditable={true}
        onEditConfirm={handleEditConfirm}
        isLoadingResults={isLoadingResults}
        resultsError={resultsError}
        resultsConfig={resultsConfig}
        setResultsConfig={setResultsConfig}
        tableEnums={tableEnums}
      />
    </div>
  );
}
