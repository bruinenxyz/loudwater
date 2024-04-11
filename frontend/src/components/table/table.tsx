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
import { HeaderCellRenderer } from "@blueprintjs/table/lib/esm/headers/header";
import { useUpdateTable } from "@/data/use-tables";
import { AppToaster } from "../toaster/toaster";
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
  tableEnums?: any;
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
  const [hiddenColumns, setHiddenColumns] = useState<string[]>(
    table?.configuration?.hidden_columns || [],
  );
  const [orderedColumns, setOrderedColumns] = useState<string[]>([]);

  const { trigger: updateTable } = useUpdateTable();

  useEffect(() => {
    if (results) {
      const columns = convertToColumns(results.rows);
      setTableData({
        rowCount: results.rowCount,
        columns: columns,
      });

      if (!table?.configuration.ordered_columns) {
        setOrderedColumns(_.keys(columns));
      } else {
        setOrderedColumns(table.configuration.ordered_columns);
      }
    }
  }, [results, setTableData]);

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

  function orderTableData(direction: "asc" | "desc", key?: string) {
    if (key !== undefined && results && resultsConfig && setResultsConfig) {
      const column = _.find(
        table?.external_columns,
        (column) => column.name === key,
      );
      if (column && table) {
        const order: OrderStep = OrderStepSchema.parse({
          type: StepIdentifierEnum.Order,
          order: [{ column: { ...column, table: table.id }, direction }],
        });
        setResultsConfig({
          ...resultsConfig,
          order: order,
        });
        const sortedData =
          direction === "asc"
            ? _.sortBy(results.rows, column.name)
            : _.sortBy(results.rows, column.name).reverse();
        setTableData({
          rowCount: results.rowCount,
          columns: convertToColumns(sortedData),
        });
      }
    }
  }

  async function orderColumn(
    oldIndex: number,
    newIndex: number,
    length: number,
  ) {
    const newOrderedColumns = orderedColumns.slice();
    newOrderedColumns.splice(
      newIndex,
      0,
      newOrderedColumns.splice(oldIndex, 1)[0],
    );

    setOrderedColumns(newOrderedColumns);

    await updateTable({
      id: table!.id,
      update: {
        configuration: {
          ...table!.configuration,
          ordered_columns: newOrderedColumns,
        },
      },
    });
  }

  async function hideColumn(key: string) {
    if (key == undefined) return;

    const newHiddenColumns = [...hiddenColumns, key];
    const newOrderedColumns = orderedColumns.filter(
      (column) => !newHiddenColumns.includes(column),
    );

    await updateTable({
      id: table!.id,
      update: {
        configuration: {
          ...table!.configuration,
          hidden_columns: newHiddenColumns,
          ordered_columns: newOrderedColumns,
        },
      },
    });

    setHiddenColumns(newHiddenColumns);
    setOrderedColumns(newOrderedColumns);
  }

  async function unhideColumn(key: string, index?: number) {
    if (key == undefined || index == undefined) return;

    const newHiddenColumns = hiddenColumns.filter((column) => column != key);
    const newOrderedColumns = orderedColumns.slice();
    newOrderedColumns.splice(index + 1, 0, key);

    await updateTable({
      id: table!.id,
      update: {
        configuration: {
          ...table!.configuration,
          hidden_columns: newHiddenColumns,
          ordered_columns: newOrderedColumns,
        },
      },
    });

    setHiddenColumns(newHiddenColumns);
    setOrderedColumns(newOrderedColumns);
  }

  function renderMenu(key: string) {
    const menuRenderer = (index?: number) => {
      return (
        <Menu>
          <MenuItem
            icon="sort-asc"
            onClick={() => orderTableData("asc", key)}
            text="Order Asc"
          />
          <MenuItem
            icon="sort-desc"
            onClick={() => orderTableData("desc", key)}
            text="Order Desc"
          />
          {orderedColumns.length > 1 && (
            <MenuItem
              icon="eye-off"
              onClick={() => hideColumn(key)}
              text="Hide"
            />
          )}
          {hiddenColumns.length > 0 && (
            <MenuItem icon="eye-open" text="Unhide">
              <Menu>
                {hiddenColumns.map((column) => (
                  <MenuItem
                    key={column}
                    text={column}
                    onClick={() => unhideColumn(column, index)}
                  />
                ))}
              </Menu>
            </MenuItem>
          )}
        </Menu>
      );
    };
    return menuRenderer;
  }

  const genericHeaderCellRenderer = (key: string) => {
    const headerCellRenderer: HeaderCellRenderer = (index: number) => {
      return (
        <ColumnHeaderCell
          name={key}
          index={index}
          menuRenderer={
            resultsConfig && setResultsConfig ? renderMenu(key) : undefined
          }
        />
      );
    };

    return headerCellRenderer;
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
              columnEnumValues={
                tableEnums && tableEnums[key] ? tableEnums[key] : []
              }
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

  function getCellData(rowIndex: number, columnIndex: number) {
    const cellData = tableData?.columns[orderedColumns[columnIndex]][rowIndex];

    AppToaster(document.body).then((toaster) => {
      toaster.show({
        message: `Copied to clipboard`,
        icon: "clipboard",
      });
    });

    return cellData;
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
        cellRendererDependencies={[tableData, orderedColumns]}
        enableColumnReordering
        enableColumnResizing
        onColumnsReordered={orderColumn}
        enableFocusedCell={true}
        getCellClipboardData={getCellData}
        // loadingOptions={[TableLoadingOption.CELLS]}
      >
        {orderedColumns.map((key) => (
          <Column
            key={key}
            name={key}
            cellRenderer={genericCellRenderer(key)}
            columnHeaderCellRenderer={genericHeaderCellRenderer(key)}
          />
        ))}
      </Table2>
    </>
  );
};

export default Table;
