"use client";
import { Icon, IconName, Popover, Tag, Text } from "@blueprintjs/core";
import {
  FilterCondition,
  InferredSchemaColumn,
  InferredSchemaColumnSchema,
} from "@/definitions";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { getFormattedDateStrings } from "@/utils/value-format";
import { useTable } from "@/data/use-tables";
import { useDarkMode } from "@/stores";

interface FilterConditionTagProps {
  condition: FilterCondition;
  index: number;
  removeable: boolean;
  removeCondition: (index: number) => void;
}

export default function FilterConditionTag({
  condition,
  index,
  removeable,
  removeCondition,
}: FilterConditionTagProps) {
  const [darkMode] = useDarkMode();
  const {
    data: columnTable,
    isLoading: isLoadingColumnTable,
    error: columnTableError,
  } = useTable(condition.column.table);

  const {
    data: valueTable,
    isLoading: isLoadingValueTable,
    error: valueTableError,
  } = useTable(
    condition.value?.table && condition.value.table !== "aggregate"
      ? condition.value.table
      : null,
  );

  const renderValue = (
    value: string | number | boolean | undefined | InferredSchemaColumn,
    column: InferredSchemaColumn,
  ) => {
    if (value === undefined) {
      return null;
    } else if (
      typeof value === "object" &&
      InferredSchemaColumnSchema.safeParse(value).success
    ) {
      return (
        <div className="flex flex-row items-center gap-1">
          {valueTable ? (
            <SquareIcon
              icon={valueTable.icon as IconName}
              color={valueTable.color}
              size={SquareIconSize.SMALL}
            />
          ) : (
            <SquareIcon
              icon="function"
              color="gray"
              size={SquareIconSize.SMALL}
            />
          )}
          {valueTable ? (
            <Text className="text-xs font-bold">{valueTable.name}</Text>
          ) : null}
          <Text className="text-xs font-normal">{value.name}</Text>
          {value.relation && (
            <Text className="text-xs font-normal">{`(${value.relation.as})`}</Text>
          )}
        </div>
      );
    } else {
      if (column.type === "date" || column.type === "datetime") {
        const { localString, utcString } = getFormattedDateStrings(value);
        return (
          <Popover
            content={
              <div className="p-1">
                <Text className="bp5-text-muted">{utcString}</Text>
              </div>
            }
            interactionKind="hover"
            placement="top"
          >
            <div className="flex flex-row items-center">
              <Text className="text-xs font-bold cursor-help">
                {localString}
              </Text>
            </div>
          </Popover>
        );
      } else if (typeof value === "string") {
        return (
          <div className="flex flex-row items-center">
            <Text className="text-xs font-bold ">{`"${value}"`}</Text>
          </div>
        );
      } else if (typeof value === "boolean") {
        return (
          <div className="flex flex-row items-center">
            <Text className="text-xs font-bold ">
              {value ? "True" : "False"}
            </Text>
          </div>
        );
      } else {
        return (
          <div className="flex flex-row items-center">
            <Text className="text-xs font-bold ">{value!.toString()}</Text>
          </div>
        );
      }
    }
  };

  if (isLoadingColumnTable || isLoadingValueTable) {
    return <Tag className="bp5-skeleton w-[135px]" />;
  }

  if (
    columnTableError ||
    (valueTableError &&
      condition.value.table &&
      condition.value.table !== "aggregate")
  ) {
    return null;
  }

  return (
    <div
      className={`flex flex-row items-center h-4 gap-2 px-1 rounded flex-nowrap ${darkMode ? "bg-bluprint-tag-dark" : "bg-bluprint-tag-light"}`}
    >
      <div className="flex flex-row items-center gap-1">
        {columnTable ? (
          <SquareIcon
            icon={columnTable.icon as IconName}
            color={columnTable.color}
            size={SquareIconSize.SMALL}
          />
        ) : (
          <SquareIcon
            icon="function"
            color="gray"
            size={SquareIconSize.SMALL}
          />
        )}
        {columnTable ? (
          <Text className="text-xs font-bold">{columnTable.name}</Text>
        ) : null}
        <Text className="text-xs font-normal">{condition.column.name}</Text>
        {condition.column.relation && (
          <Text className="text-xs font-normal">{`(${condition.column.relation.as})`}</Text>
        )}
      </div>
      <Text className="text-xs font-bold flex-nowrap ">
        {condition.operator.replace(/_/g, " ")}
      </Text>
      {renderValue(condition.value, condition.column)}
      {removeable && (
        <Icon
          className="cursor-pointer"
          icon="cross"
          onClick={() => removeCondition(index)}
        />
      )}
    </div>
  );
}
