"use client";
import { Icon, Text } from "@blueprintjs/core";

export default function InvalidPropertyTag({
  property,
  removeProperty,
  setIsOpen,
}: {
  property: string;
  removeProperty: () => void;
  setIsOpen: (value: boolean) => void;
}) {
  return (
    <div
      className="flex flex-row items-center h-4 rounded cursor-pointer bg-error"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Icon className="mx-2 text-white" icon="warning-sign" />
      <div className="flex flex-row items-center mr-2">
        <Text className={`text-bluprint-text-light`}>{property}</Text>
      </div>
      <Icon
        className="mr-1 cursor-pointer text-bluprint-text-light"
        icon="cross"
        onClick={() => removeProperty()}
      />
    </div>
  );
}
