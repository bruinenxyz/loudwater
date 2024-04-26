"use client";
import { Text } from "@blueprintjs/core";

export default function SinglePropertySelectorButtonProperty({
  property,
}: {
  property: string;
}) {
  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-row items-center ml-1 w-fit">
        <Text className="font-bold">{property}</Text>
      </div>
    </div>
  );
}
