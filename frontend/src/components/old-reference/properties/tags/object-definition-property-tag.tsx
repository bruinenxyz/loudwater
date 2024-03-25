"use client";
import { ObjectDefinition, ObjectProperty } from "@/definitions";
import { Popover, Tag, Text } from "@blueprintjs/core";

export default function ObjectDefinitionPropertyTag({
  objectDefinition,
  property,
}: {
  objectDefinition: ObjectDefinition;
  property: ObjectProperty;
}) {
  if (property.description) {
    return (
      <Popover
        content={
          <div className="p-1">
            <Text className=" bp5-text-muted">{property.description}</Text>
          </div>
        }
        interactionKind="hover"
        placement="top"
      >
        <Tag minimal={true} intent={"none"} className="cursor-help h-fit">
          {property.name}
        </Tag>
      </Popover>
    );
  } else {
    return (
      <Tag minimal={true} intent={"none"} className="cursor-default h-fit">
        {property.name}
      </Tag>
    );
  }
}
