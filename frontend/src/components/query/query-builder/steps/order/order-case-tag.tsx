"use client";
import { OrderColumn } from "@/definitions";
import { Icon, IconName, Tag, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useTable } from "@/data/use-tables";

interface OrderCaseTagProps {
  orderCase: OrderColumn;
  index: number;
  removeable: boolean;
  removeCase: (index: number) => void;
}

export default function OrderCaseTag({
  orderCase,
  index,
  removeable,
  removeCase,
}: OrderCaseTagProps) {
  const {
    data: table,
    isLoading: isLoadingTable,
    error: tableError,
  } = useTable(orderCase.column.table);

  // If orderCase.column.table is not a valid table, don't render the tag
  // Aggregated columns don't have a table and use "aggregate" on their table field, so we allow those
  if (tableError && orderCase.column.table !== "aggregate") {
    return null;
  }

  return (
    <Tag
      minimal
      intent="none"
      className={`${isLoadingTable ? "bp5-skeleton" : ""}`}
    >
      <div className="flex flex-row items-center gap-2 py-1">
        <div className="flex flex-row items-center gap-1 flex-nowrap">
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
          {table && <Text className="font-bold text-md">{table.name}</Text>}
          <Text className="font-normal text-md">{orderCase.column.name}</Text>
          {orderCase.column.relation && (
            <Text className="ml-1 font-normal">{`(${orderCase.column.relation.as})`}</Text>
          )}
        </div>
        <Text className="font-bold flex-nowrap">{orderCase.direction}</Text>
        {removeable && (
          <Icon
            className="cursor-pointer"
            icon="cross"
            onClick={() => removeCase(index)}
          />
        )}
      </div>
    </Tag>
  );
}
