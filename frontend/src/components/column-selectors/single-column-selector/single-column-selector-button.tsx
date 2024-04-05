"use client";
import { HydratedTable, InferredSchemaColumn } from "@/definitions";
import { Button, IconName, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import * as _ from "lodash";

export default function SingleColumnSelectorButton({
  selected,
  disabled,
  tables,
}: {
  selected: InferredSchemaColumn | null;
  disabled: boolean;
  tables: HydratedTable[];
}) {
  function renderSelectedContent() {
    const table = _.find(
      tables,
      (table: HydratedTable) => table.id === selected!.table,
    );
    return (
      <div className="flex flex-row items-center gap-1">
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
        <Text className="text-md">{selected!.name}</Text>
        {selected!.relation && (
          <Text className="ml-1">{`(${selected!.relation.as})`}</Text>
        )}
      </div>
    );
  }

  return (
    <Button rightIcon="double-caret-vertical" disabled={disabled}>
      {selected ? renderSelectedContent() : "Select a column"}
    </Button>
  );
}
