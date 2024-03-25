import {
  FilterStep,
  OrderStep,
  OrderStepSchema,
  StepIdentifierEnum,
  TakeStep,
  TakeStepSchema,
} from "@/definitions/pipeline";
import { HydratedTable } from "@/definitions";
import {
  Cell,
  CellRenderer,
  Column,
  ColumnHeaderCell,
  Table2,
  TableLoadingOption,
  TruncatedFormat,
  TruncatedPopoverMode,
} from "@blueprintjs/table";
import { InputGroup, Menu, MenuItem, Text } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "../error-display";
import TableFilterComponent from "./filters/table-filter-component";
import { convertToColumns } from "@/utils/convert-to-columns";
import EditableInnerCell from "./editable-cell";
import React, { useEffect, useState } from "react";
import * as _ from "lodash";

interface Props {
  table?: HydratedTable;
  results:
    | {
        rowCount: number;
        rows: any[];
      }
    | undefined;
  isLoadingResults: boolean;
  resultsError: any;
  isEditable?: boolean;
  onEditConfirm?: (
    value: string | number | boolean | null,
    rowIndex: number,
    columnName: string,
  ) => void;
  resultsConfig?: {
    filters?: FilterStep;
    order?: OrderStep;
    take?: TakeStep;
  };
  setResultsConfig?: (config: {
    filters?: FilterStep;
    order?: OrderStep;
    take?: TakeStep;
  }) => void;
  // TODO update type
  tableEnums: any;
}

const Table: React.FC<Props> = (props) => {
  const {
    table,
    results,
    isLoadingResults,
    resultsError,
    resultsConfig,
    setResultsConfig,
    isEditable,
    onEditConfirm,
    tableEnums,
  } = props;
  const [tableData, setTableData] = useState<any>();
  const [limit, setLimit] = useState<string>("100");
  const [offset, setOffset] = useState<string>("0");

  useEffect(() => {
    if (results) {
      setTableData({
        rowCount: results.rowCount,
        columns: convertToColumns(results.rows),
      });
    }
  }, [results]);

  useEffect(() => {
    if (resultsConfig && setResultsConfig) {
      if (limit === "" || offset === "") {
        setResultsConfig({ ...resultsConfig, take: undefined });
      } else {
        const take = TakeStepSchema.parse({
          type: StepIdentifierEnum.Take,
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        setResultsConfig({ ...resultsConfig, take: take });
      }
    }
  }, [limit, offset]);

  function orderTableData(direction: "asc" | "desc", index?: number) {
    if (index !== undefined && results && resultsConfig && setResultsConfig) {
      const columnName = Object.keys(tableData.columns)[index];
      const order: OrderStep = OrderStepSchema.parse({
        type: StepIdentifierEnum.Order,
        order: [{ property: columnName, direction }],
      });
      setResultsConfig({
        ...resultsConfig,
        order: order,
      });
      const sortedData =
        direction === "asc"
          ? _.sortBy(results.rows, columnName)
          : _.sortBy(results.rows, columnName).reverse();
      setTableData({
        rowCount: results.rowCount,
        columns: convertToColumns(sortedData),
      });
    }
  }

  function renderMenu(index?: number) {
    return (
      <Menu>
        <MenuItem
          icon="sort-asc"
          onClick={() => orderTableData("asc", index)}
          text="Order Asc"
        />
        <MenuItem
          icon="sort-desc"
          onClick={() => orderTableData("desc", index)}
          text="Order Desc"
        />
      </Menu>
    );
  }

  const headerCellRenderer = (index: number) => {
    const name = Object.keys(tableData.columns)[index];
    return (
      <ColumnHeaderCell
        name={name}
        index={index}
        menuRenderer={
          resultsConfig && setResultsConfig ? renderMenu : undefined
        }
      />
    );
  };

  const genericCellRenderer = (key: string) => {
    const cellRenderer: CellRenderer = (rowIndex: number) => {
      // TODO add is_nullable functionality
      if (isEditable) {
        const columnType = table?.external_columns[key]?.type || "";
        const cellData = tableData?.columns[key][rowIndex];
        return (
          <Cell>
            <EditableInnerCell
              columnType={columnType}
              columnEnumValues={tableEnums[key] || []}
              cellData={cellData}
              onConfirm={(value) => {
                onEditConfirm ? onEditConfirm(value, rowIndex, key) : null;
              }}
            ></EditableInnerCell>
          </Cell>
        );
      }
      return (
        <Cell>
          <TruncatedFormat
            detectTruncation={true}
            showPopover={TruncatedPopoverMode.WHEN_TRUNCATED}
          >
            {tableData.columns[key][rowIndex]}
          </TruncatedFormat>
        </Cell>
      );
    };
    return cellRenderer;
  };

  function renderTableManager() {
    if (table && resultsConfig && setResultsConfig) {
      return (
        <div className="flex flex-row justify-between">
          <TableFilterComponent
            table={table}
            resultsConfig={resultsConfig}
            setResultsConfig={setResultsConfig}
          />
          <div className="flex flex-row items-end gap-2 mb-2">
            <div className="flex flex-row items-center">
              <Text className="mr-1 bp5-text-muted">Limit:</Text>
              <InputGroup
                className="w-[100px]"
                value={limit}
                onValueChange={(newValue: string) => {
                  const cleanedValue = _.replace(newValue, /[^0-9]/g, "");
                  setLimit(cleanedValue);
                }}
              />
            </div>
            <div className="flex flex-row items-center">
              <Text className="mr-1 bp5-text-muted">Offset:</Text>
              <InputGroup
                className="w-[100px]"
                value={offset}
                onValueChange={(newValue: string) => {
                  const cleanedValue = _.replace(newValue, /[^0-9]/g, "");
                  setOffset(cleanedValue);
                }}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  if (isLoadingResults && !tableData) {
    return <Loading />;
  }

  if (!resultsError && !tableData) {
    return <></>;
  }

  if (resultsError) {
    return (
      <ErrorDisplay
        title="An unexpected error occurred"
        description={resultsError?.message}
      />
    );
  }

  return (
    <>
      {renderTableManager()}
      <Table2
        numRows={tableData.rowCount || 0}
        enableGhostCells
        cellRendererDependencies={[tableData]}
        enableFocusedCell={true}
        // loadingOptions={[TableLoadingOption.CELLS]}
      >
        {_.keys(tableData.columns).map((key) => (
          <Column
            key={key}
            name={key}
            cellRenderer={genericCellRenderer(key)}
            columnHeaderCellRenderer={headerCellRenderer}
          />
        ))}
      </Table2>
    </>
  );
};

export default Table;
