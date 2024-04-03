"use client";
import { HydratedTable, InferredSchemaColumn } from "@/definitions";
import { IconName, MenuItem, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";

export default function SingleColumnSelectorListItem({
  column,
  table,
  handleClick,
  selected,
}: {
  column: InferredSchemaColumn;
  table?: HydratedTable;
  handleClick: any;
  selected: InferredSchemaColumn | null;
}) {
  function renderContent() {
    return (
      <div className="flex flex-row items-center gap-1 my-1">
        {table ? (
          <SquareIcon
            icon={table.icon as IconName}
            color={table.color}
            size={SquareIconSize.SMALL}
          />
        ) : (
          <SquareIcon
            icon="function"
            color="gray"
            size={SquareIconSize.SMALL}
          />
        )}
        {table ? <Text className="font-bold text-md">{table.name}</Text> : null}
        <Text className="text-md">{column.name}</Text>
        {column.relation && (
          <Text className="ml-1">{`(${column.relation.as})`}</Text>
        )}
      </div>
    );
  }

  return (
    <MenuItem
      onClick={handleClick}
      selected={
        selected?.name === column.name &&
        selected?.table === column.table &&
        selected?.relation?.as === column.relation?.as
      }
      text={renderContent()}
    />
  );
}
