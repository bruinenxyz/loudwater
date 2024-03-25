"use client";
import { ObjectDefinition } from "@/definitions";
import {
  InferredSchemaProperty,
  InferredSchemaPropertySchema,
  Operators,
} from "@/definitions/pipeline";
import { Icon, Popover, Text } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { FilterCreatorCondition } from "./filter-step-creator";
import { ErrorDisplay } from "@/components/error-display";
import PropertyIcon from "@/components/old-reference/pipeline/property-icon";
import { useObjectDefinition } from "@/data/use-object-definition";
import { getFormattedDateStrings } from "@/utils/value-format";
import * as _ from "lodash";

export default function FilterCreatorConditionTag({
  arrayIndex,
  conditions,
  setConditions,
  property,
  operator,
  value,
}: {
  arrayIndex: number;
  conditions: FilterCreatorCondition[];
  setConditions: (conditions: FilterCreatorCondition[]) => void;
  property: InferredSchemaProperty;
  operator: Operators;
  value: InferredSchemaProperty | string | number | boolean | undefined;
}) {
  const valueIsProperty = InferredSchemaPropertySchema.safeParse(value).success;

  const {
    data: propertyObjectDefinition,
    isLoading: isLoadingPropertyObjectDefinition,
    error: propertyObjectDefinitionError,
  } = useObjectDefinition(property.object_definition_id);

  const {
    data: valueObjectDefinition,
    isLoading: isLoadingValueObjectDefinition,
    error: valueObjectDefinitionError,
  } = useObjectDefinition(
    valueIsProperty
      ? (value as InferredSchemaProperty).object_definition_id
      : undefined,
  );

  if (isLoadingPropertyObjectDefinition || isLoadingValueObjectDefinition) {
    return <Loading />;
  }

  if (propertyObjectDefinitionError || valueObjectDefinitionError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={
          propertyObjectDefinitionError
            ? propertyObjectDefinitionError.message
            : valueObjectDefinitionError.message
        }
      />
    );
  }

  function removeCondition() {
    const newConditions = [...conditions];
    newConditions.splice(arrayIndex, 1);
    setConditions(newConditions);
  }

  function getPropertyText(
    property: InferredSchemaProperty,
    objectDefinition: ObjectDefinition | undefined,
  ) {
    if (property.relation_name) {
      return property.relation_name + "." + property.name;
    } else if (objectDefinition) {
      return objectDefinition.name + "." + property.name;
    } else {
      return property.name;
    }
  }

  function renderProperty(
    property: InferredSchemaProperty,
    objectDefinition: ObjectDefinition | undefined,
  ) {
    return (
      <>
        <PropertyIcon property={property} />
        <Text className="ml-1 font-bold text-bluprint-text-light">
          {getPropertyText(property, objectDefinition)}
        </Text>
      </>
    );
  }

  function renderValueString() {
    if (property.type === "date" || property.type === "datetime") {
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
          <Text className="font-bold cursor-help text-bluprint-text-light">
            {localString}
          </Text>
        </Popover>
      );
    } else if (typeof value === "string") {
      return (
        <Text className="font-bold text-bluprint-text-light">{`"${value}"`}</Text>
      );
    } else if (typeof value === "boolean") {
      return (
        <Text className="font-bold text-bluprint-text-light">
          {value ? "True" : "False"}
        </Text>
      );
    } else {
      return (
        <Text className="font-bold text-bluprint-text-light">
          {value!.toString()}
        </Text>
      );
    }
  }

  function renderValue() {
    if (!value) {
      return null;
    } else if (valueIsProperty) {
      return (
        <div className="flex flex-row items-center mr-2">
          {renderProperty(
            value as InferredSchemaProperty,
            valueObjectDefinition,
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center mr-2">
          {renderValueString()}
        </div>
      );
    }
  }

  return (
    <div className="flex flex-row items-center h-4 rounded bg-bluprint-tag-gray">
      <div className="flex flex-row items-center ml-1 mr-2">
        {renderProperty(property, propertyObjectDefinition)}
      </div>
      <Text className="mr-2 font-bold flex-nowrap text-bluprint-text-light">
        {operator.replace(/_/g, " ")}
      </Text>
      {renderValue()}
      <Icon
        className="mr-1 cursor-pointer text-bluprint-text-light"
        icon="cross"
        onClick={() => removeCondition()}
      />
    </div>
  );
}
