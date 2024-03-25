"use client";
import { Icon, Text } from "@blueprintjs/core";

export default function InvalidPropertyTag({
  property,
  index,
  removeProperty,
}: {
  property: string;
  index: number;
  removeProperty: (index: number) => void;
}) {
  return (
    <div className="flex flex-row items-center h-4 rounded bg-error">
      <div className="flex flex-row items-center ml-1 mr-2">
        <Text className={`text-bluprint-text-light cursor-default ml-1`}>
          {property}
        </Text>
      </div>
      <Icon
        className="mr-1 cursor-pointer text-bluprint-text-light"
        icon="cross"
        onClick={() => removeProperty(index)}
      />
    </div>
  );
}
