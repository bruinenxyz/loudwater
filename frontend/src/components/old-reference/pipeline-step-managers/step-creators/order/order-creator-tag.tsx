"use client";
import { InferredSchemaProperty } from "@/definitions/pipeline";
import { Icon, Text } from "@blueprintjs/core";
import { OrderCase } from "./order-step-creator";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { PropertyIcon } from "@/components/old-reference/pipeline";
import { useObjectDefinition } from "@/data/use-object-definition";

export default function OrderCreatorTag({
  property,
  direction,
  index,
  orderCases,
  setOrderCases,
}: {
  property: InferredSchemaProperty;
  direction: "asc" | "desc";
  index: number;
  orderCases: OrderCase[];
  setOrderCases: (orderCases: OrderCase[]) => void;
}) {
  const {
    data: objectDefinition,
    isLoading: isLoadingObjectDefinition,
    error: objectDefinitionError,
  } = useObjectDefinition(property.object_definition_id);

  if (isLoadingObjectDefinition) {
    return <Loading />;
  }

  if (objectDefinitionError) {
    return (
      <ErrorDisplay
        title="Cannot get Object Definition details"
        description={objectDefinitionError.message}
      />
    );
  }

  function getPropertyText() {
    if (property.relation_name) {
      return property.relation_name + "." + property.name;
    } else if (objectDefinition) {
      return objectDefinition.name + "." + property.name;
    } else {
      return property.name;
    }
  }

  function removeCase() {
    const newOrderCases = [...orderCases];
    newOrderCases.splice(index, 1);
    setOrderCases(newOrderCases);
  }

  return (
    <div className="flex flex-row items-center h-4 rounded bg-bluprint-tag-gray">
      <div className="flex flex-row items-center ml-1 mr-2">
        <PropertyIcon property={property} />
        <Text className={`text-bluprint-text-light cursor-default ml-1`}>
          {getPropertyText()}
        </Text>
      </div>
      <Text className="mr-2 font-bold flex-nowrap text-bluprint-text-light">
        {direction}
      </Text>
      <Icon
        className="mr-1 cursor-pointer text-bluprint-text-light"
        icon="cross"
        onClick={removeCase}
      />
    </div>
  );
}
