"use client";
import { InferredSchemaColumn } from "@/definitions";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";

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
  const renderColumnItem: ItemRenderer<InferredSchemaColumn> = (
    column,
    { handleClick, modifiers },
  ) => (
    <MenuItem
      key={`${column.table}.${column.name}`}
      text={`${column.name}${column.relation ? ` (${column.relation.as})` : ""}`}
      onClick={handleClick}
      selected={
        selected?.name === column.name && selected?.table === column.table
      }
    />
  );

  return (
    <Select<InferredSchemaColumn>
      disabled={disabled === true}
      className={className}
      items={items}
      itemRenderer={renderColumnItem}
      onItemSelect={onColumnSelect}
    >
      <Button rightIcon="double-caret-vertical" disabled={disabled === true}>
        {selected ? selected.name : "Select a column"}
      </Button>
    </Select>
  );
}
