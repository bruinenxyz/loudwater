"use client";
import {
  AggregateStep,
  InferSchemaOutputSuccess,
  InferredSchemaProperty,
} from "@/definitions/pipeline";
import { Tag, Text } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import InferredSchemaPropertyTag from "@/components/old-reference/properties/tags/inferred-schema-property-tag";
import * as _ from "lodash";

export default function AggregateTitle({
  step,
  inputSchema,
}: {
  step: AggregateStep;
  inputSchema: InferSchemaOutputSuccess;
}) {
  const { operation, as } = step;
  const property: InferredSchemaProperty = _.find(
    inputSchema!.data.properties,
    (schemaProperty: InferredSchemaProperty) =>
      schemaProperty.api_path === step.property,
  )!;

  return (
    <div className="flex flex-row items-center ml-3 overflow-hidden grow h-fit">
      <Text className="mr-2 flex-nowrap ">{operation}</Text>
      <div className="flex flex-row items-center mr-2 w-fit">
        <InferredSchemaPropertyTag property={property} />
      </div>
      <Text className="mr-2 flex-nowrap">as</Text>
      <div className="flex flex-row items-center h-full mr-2 w-fit">
        <Tag
          minimal={true}
          intent={"none"}
          className={`w-fit  cursor-default `}
        >
          <div className="flex flex-row items-center w-fit">
            <SquareIcon
              icon="function"
              color="gray"
              size={SquareIconSize.SMALL}
            />
            <Text className="py-1 ml-1 font-bold flex-nowrap">{as}</Text>
          </div>
        </Tag>
      </div>
    </div>
  );
}
