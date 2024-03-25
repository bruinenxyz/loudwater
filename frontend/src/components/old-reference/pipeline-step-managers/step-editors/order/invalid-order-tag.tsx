"use client";
import { OrderProperty } from "@/definitions/pipeline";
import { Icon, Text } from "@blueprintjs/core";

export default function InvalidOrderTag({
  invalidCase,
  index,
  removeCase,
}: {
  invalidCase: OrderProperty;
  index: number;
  removeCase: (index: number) => void;
}) {
  return (
    <div className="flex flex-row items-center h-4 rounded bg-error">
      <div className="flex flex-row items-center ml-1 mr-2">
        <Text className={`text-bluprint-text-light cursor-default ml-1`}>
          {invalidCase.property}
        </Text>
        <Text
          className={`text-bluprint-text-light font-bold cursor-default ml-2`}
        >
          {invalidCase.direction}
        </Text>
      </div>
      <Icon
        className="mr-1 cursor-pointer text-bluprint-text-light"
        icon="cross"
        onClick={() => removeCase(index)}
      />
    </div>
  );
}
