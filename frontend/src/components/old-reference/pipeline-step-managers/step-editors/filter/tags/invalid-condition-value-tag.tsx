"use client";
import { InferredSchemaProperty, ObjectDefinition } from "@/definitions";
import { Icon, Text } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { PropertyIcon } from "@/components/old-reference/pipeline";
import { FilterCreatorCondition } from "@/components/old-reference/pipeline-step-managers/step-creators/filter/filter-step-creator";
import { useObjectDefinition } from "@/data/use-object-definition";

export default function InvalidConditionPropertyTag({
  condition,
  index,
  removeCondition,
}: {
  condition: FilterCreatorCondition;
  index: number;
  removeCondition: (invalidType: "property" | "value", index: number) => void;
}) {
  const {
    data: propertyObjectDefinition,
    isLoading: isLoadingPropertyObjectDefinition,
    error: propertyObjectDefinitionError,
  } = useObjectDefinition(condition.property.object_definition_id);

  if (isLoadingPropertyObjectDefinition) {
    return <Loading />;
  }

  if (propertyObjectDefinitionError || !propertyObjectDefinition) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={propertyObjectDefinitionError.message}
      />
    );
  }

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

  return (
    <div className="flex flex-row items-center h-4 rounded bg-error">
      <div className="flex flex-row items-center ml-1">
        <div className="flex flex-row items-center mr-2">
          <PropertyIcon property={condition.property} />
          <Text className="ml-1 font-bold text-bluprint-text-light">
            {getPropertyText(condition.property, propertyObjectDefinition)}
          </Text>
        </div>
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
        onClick={() => removeCondition("value", index)}
      />
    </div>
  );
}
