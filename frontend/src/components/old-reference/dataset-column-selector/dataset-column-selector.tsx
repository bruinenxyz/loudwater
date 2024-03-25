"use client";
import { ObjectPropertyType, ObjectPropertyTypeEnum } from "@/definitions";
import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { ErrorDisplay } from "../../error-display";
import Loading from "@/app/loading";
import { useDatasetSchema } from "@/data/use-dataset";
import * as _ from "lodash";

export interface DatasetColumn {
  name: string;
  type: ObjectPropertyType;
}

export default function DatasetColumnSelector({
  className,
  datasetId,
  selectedColumn,
  setSelectedColumn,
}: {
  className?: string;
  datasetId: string;
  selectedColumn: DatasetColumn | null;
  setSelectedColumn: (column: DatasetColumn | null) => void;
}) {
  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useDatasetSchema(datasetId);

  if (isLoadingSchema) {
    return <Loading />;
  }

  if (schemaError || !schema) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={schemaError?.message}
      />
    );
  }

  function getColumnType(inputType: string): ObjectPropertyType {
    switch (inputType) {
      case "BIGINT":
      case "HUGEINT":
      case "INTEGER":
      case "SMALLINT":
      case "TINYINT":
      case "UBIGINT":
      case "UINTEGER":
      case "USMALLINT":
      case "UTINYINT":
        return ObjectPropertyTypeEnum.number;
      case "BOOLEAN":
        return ObjectPropertyTypeEnum.boolean;
      case "BLOB":
      case "VARCHAR":
      case "UUID":
        return ObjectPropertyTypeEnum.string;
      case "DATE":
        return ObjectPropertyTypeEnum.date;
      case "DATETIME":
      case "TIMESTAMP":
      case "TIME":
      case "TIMESTAMP WITH TIME ZONE":
        return ObjectPropertyTypeEnum.datetime;
      case "DOUBLE":
      case "DECIMAL":
      case "REAL":
        return ObjectPropertyTypeEnum.float;
      default:
        return ObjectPropertyTypeEnum.string;
    }
  }

  function getItems(): DatasetColumn[] {
    // Filter out Airbyte columns - only required for datasets that get synced via Airbyte
    return _.map(
      _.filter(
        schema,
        (column: any) => !_.startsWith(column.column_name, "_airbyte"),
      ),
      (column: any) => {
        return {
          name: column.column_name,
          type: getColumnType(column.column_type),
        };
      },
    );
  }

  // @ts-ignore
  const renderColumn = (column: DatasetColumn, { handleClick, modifiers }) => {
    return (
      <MenuItem
        key={column.name}
        onClick={handleClick}
        active={modifiers.active}
        selected={selectedColumn?.name === column.name}
        roleStructure="listoption"
        text={`${column.name} - ${column.type}`}
      />
    );
  };

  function selectColumn(column: DatasetColumn) {
    if (selectedColumn && selectedColumn.name === column.name) {
      setSelectedColumn(null);
    } else {
      setSelectedColumn(column);
    }
  }

  return (
    <Select<DatasetColumn>
      className={className}
      items={getItems()}
      itemRenderer={renderColumn}
      onItemSelect={(item) => selectColumn(item)}
      popoverProps={{ minimal: true, matchTargetWidth: true }}
    >
      <Button
        className={className}
        text={
          selectedColumn
            ? `${selectedColumn.name} - ${selectedColumn.type}`
            : "Select a column"
        }
        rightIcon="double-caret-vertical"
        placeholder="Select a column"
      />
    </Select>
  );
}
