"use client";
import {
  FilterCondition,
  FilterStep,
  InferSchemaOutputSuccess,
  InferredSchemaProperty,
  InferredSchemaPropertySchema,
} from "@/definitions/pipeline";
import { Popover, Text } from "@blueprintjs/core";
import InferredSchemaPropertyTag from "@/components/old-reference/properties/tags/inferred-schema-property-tag";
import { getFormattedDateStrings } from "@/utils/value-format";
import * as _ from "lodash";

export default function FilterTitle({
  step,
  inputSchema,
}: {
  step: FilterStep;
  inputSchema: InferSchemaOutputSuccess;
}) {
  function renderValueString({
    schemaProperty,
    value,
  }: {
    schemaProperty: InferredSchemaProperty;
    value: InferredSchemaProperty | string | number | boolean | undefined;
  }) {
    if (schemaProperty.type === "date" || schemaProperty.type === "datetime") {
      const { localString, utcString } = getFormattedDateStrings(value);
      return (
        <Popover
          content={
            <div className="p-1">
              <Text className=" bp5-text-muted">{utcString}</Text>
            </div>
          }
          interactionKind="hover"
          placement="top"
        >
          <Text className="font-normal cursor-help">{localString}</Text>
        </Popover>
      );
    } else if (typeof value === "string") {
      return <Text className="font-normal">{`"${value}"`}</Text>;
    } else if (typeof value === "boolean") {
      return <Text className="font-normal">{value ? "True" : "False"}</Text>;
    } else {
      return <Text className="font-normal">{value!.toString()}</Text>;
    }
  }

  function renderValue({
    schemaProperty,
    value,
  }: {
    schemaProperty: InferredSchemaProperty;
    value: InferredSchemaProperty | string | number | boolean | undefined;
  }) {
    if (value === undefined) {
      return null;
    } else if (InferredSchemaPropertySchema.safeParse(value).success) {
      return (
        <div className="items-center ml-2">
          <InferredSchemaPropertyTag
            property={value as InferredSchemaProperty}
          />
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center ml-2">
          {renderValueString({
            schemaProperty,
            value,
          })}
        </div>
      );
    }
  }

  return (
    <div className="flex flex-row flex-wrap gap-2 ml-3 mr-2 grow">
      {_.map(step.conditions, (condition: FilterCondition, index: number) => {
        const schemaProperty = _.find(
          inputSchema!.data.properties,
          (schemaProperty: InferredSchemaProperty) =>
            schemaProperty.api_path === condition.property,
        );
        const foundValueProperty: InferredSchemaProperty | undefined = _.find(
          inputSchema!.data.properties,
          (schemaProperty: InferredSchemaProperty) =>
            schemaProperty.api_path === condition.value,
        );
        return (
          <div className="flex flex-row items-center">
            {!!index && (
              <Text className="mr-2 font-bold">
                {_.upperCase(step.logicalOperator)}
              </Text>
            )}
            <InferredSchemaPropertyTag property={schemaProperty!} />
            <Text className="ml-2 font-bold flex-nowrap">
              {condition.operator.replace(/_/g, " ")}
            </Text>
            {renderValue({
              schemaProperty: schemaProperty!,
              value: foundValueProperty ? foundValueProperty : condition.value,
            })}
          </div>
        );
      })}
    </div>
  );
}
