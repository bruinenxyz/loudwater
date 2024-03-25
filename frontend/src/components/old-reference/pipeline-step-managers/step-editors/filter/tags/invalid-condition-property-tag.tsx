"use client";
import { FilterCondition } from "@/definitions/pipeline";
import { Icon, Text } from "@blueprintjs/core";

export default function InvalidConditionPropertyTag({
  condition,
  index,
  removeCondition,
}: {
  condition: FilterCondition;
  index: number;
  removeCondition: (invalidType: "property" | "value", index: number) => void;
}) {
  function createValueString(value: any) {
    switch (typeof value) {
      case "string":
        return `"${value}"`;
      case "boolean":
        return value ? "True" : "False";
      default:
        return value!.toString();
    }
  }

  return (
    <div className="flex flex-row items-center h-4 rounded bg-error">
      <div className="flex flex-row items-center ml-1">
        <Text className="ml-1 mr-2 font-bold cursor-default text-bluprint-text-light">
          {condition.property}
        </Text>
        <Text className="mr-2 flex-nowrap text-bluprint-text-light">
          {condition.operator.replace(/_/g, " ")}
        </Text>
        {condition.value && (
          <Text className="mr-2 font-bold text-bluprint-text-light">
            {createValueString(condition.value)}
          </Text>
        )}
      </div>
      <Icon
        className="mr-1 cursor-pointer text-bluprint-text-light"
        icon="cross"
        onClick={() => removeCondition("property", index)}
      />
    </div>
  );
}
