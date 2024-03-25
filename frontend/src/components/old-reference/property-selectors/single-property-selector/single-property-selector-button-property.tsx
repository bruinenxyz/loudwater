"use client";
import { ErrorDisplay } from "@/components/error-display";
import { useObjectDefinition } from "@/data/use-object-definition";
import { InferredSchemaProperty } from "@/definitions/pipeline";
import { Text } from "@blueprintjs/core";

import { PropertyIcon } from "../../pipeline";
import Loading from "@/app/loading";

export default function SinglePropertySelectorButtonProperty({
  property,
}: {
  property: InferredSchemaProperty;
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
        title="Unexpected error"
        description={objectDefinitionError.message}
      />
    );
  }

  return (
    <div className="flex flex-row items-center">
      <PropertyIcon property={property} />
      <div className="flex flex-row items-center ml-1 w-fit">
        {property.relation_name || !!objectDefinition ? (
          <Text className="mr-1">
            {(property.relation_name
              ? property.relation_name
              : objectDefinition!.name) + " "}
          </Text>
        ) : null}
        <Text className="font-bold">{property.name}</Text>
      </div>
    </div>
  );
}
