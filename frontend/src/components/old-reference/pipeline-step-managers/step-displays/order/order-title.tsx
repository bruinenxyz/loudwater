"use client";
import {
  InferSchemaOutputSuccess,
  InferredSchemaProperty,
  OrderProperty,
  OrderStep,
} from "@/definitions/pipeline";
import { Text } from "@blueprintjs/core";
import InferredSchemaPropertyTag from "@/components/old-reference/properties/tags/inferred-schema-property-tag";
import * as _ from "lodash";

export default function OrderTitle({
  step,
  inputSchema,
}: {
  step: OrderStep;
  inputSchema: InferSchemaOutputSuccess;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2 ml-3 mr-2 grow">
      {_.map(step.order, (orderProperty: OrderProperty, index: number) => {
        const schemaProperty = _.find(
          inputSchema!.data.properties,
          (schemaProperty: InferredSchemaProperty) =>
            schemaProperty.api_path === orderProperty.property,
        );
        return (
          <div className="flex flex-row items-center">
            <InferredSchemaPropertyTag property={schemaProperty!} />
            <Text className="ml-2 font-bold flex-nowrap">
              {orderProperty.direction === "asc" ? "ascending" : "descending"}
            </Text>
            {index !== step.order.length - 1 && (
              <Text className="text-lg font-normal ml-[3px]">,</Text>
            )}
          </div>
        );
      })}
    </div>
  );
}
