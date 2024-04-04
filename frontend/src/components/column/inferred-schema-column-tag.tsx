"use client";
import { InferredSchemaColumn } from "@/definitions";
import { IconName, Tag, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useTable } from "@/data/use-tables";

export default function InferredSchemaColumnTag({
  column,
  action,
}: {
  column: InferredSchemaColumn;
  action?: () => void;
}) {
  const {
    data: table,
    isLoading: isLoadingTable,
    error: tableError,
  } = useTable(column.table);

  if (tableError && column.table !== "aggregate") {
    return null;
  }

  return (
    <Tag
      minimal={true}
      intent={"none"}
      className={`h-fit w-fit ${
        !!action ? "cursor-pointer" : "cursor-default "
      } ${isLoadingTable ? "bp5-skeleton" : ""}`}
      onClick={action}
    >
      <div className="flex flex-row items-center w-fit">
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
        <div className="flex flex-row items-center py-1 ml-1 w-fit">
          {column.relation || !!table ? (
            <Text className="mr-1">
              {(column.relation && column.relation.as
                ? column.relation.as
                : table!.name) + " "}
            </Text>
          ) : null}
          <Text className="font-bold">{column.name}</Text>
        </div>
      </div>
    </Tag>
  );
}
