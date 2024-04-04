"use client";
import { InferredSchemaColumn, HydratedTable } from "@/definitions";
import { ItemRenderer, Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import SingleColumnSelectorListItem from "./single-column-selector-list-item";
import { useTables } from "@/data/use-tables";
import { useSelectedDatabase } from "@/stores";
import * as _ from "lodash";
import SingleColumnSelectorButton from "./single-column-selector-button";

interface SingleColumnSelectorProps {
  className?: string;
  disabled?: boolean;
  items: InferredSchemaColumn[];
  selected: InferredSchemaColumn | null;
  onColumnSelect: (column: InferredSchemaColumn) => void;
}

export default function SingleColumnSelector({
  className,
  disabled,
  items,
  selected,
  onColumnSelect,
}: SingleColumnSelectorProps) {
  const [selectedDatabase] = useSelectedDatabase();
  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id);

  if (isLoadingTables) {
    return <Loading />;
  }

  if (tablesError) {
    return <ErrorDisplay description={tablesError} />;
  }

  const renderColumnItem: ItemRenderer<InferredSchemaColumn> = (
    column,
    { handleClick, modifiers },
  ) => {
    const table = _.find(
      tables,
      (table: HydratedTable) => table.id === column.table,
    );
    return (
      <SingleColumnSelectorListItem
        key={`${column.table}.${column.name}${column.relation ? `.${column.relation.as}` : ""}`}
        column={column}
        table={table}
        handleClick={handleClick}
        selected={selected}
      />
    );
  };

  return (
    <Select<InferredSchemaColumn>
      disabled={disabled === true}
      className={className}
      items={items}
      itemRenderer={renderColumnItem}
      onItemSelect={onColumnSelect}
    >
      <SingleColumnSelectorButton
        selected={selected}
        disabled={!!disabled}
        tables={tables!}
      />
    </Select>
  );
}
