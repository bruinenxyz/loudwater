"use client";
import { useObjectDefinition } from "@/data/use-object-definition";
import { InferredSchemaProperty } from "@/definitions/pipeline";
import { IconName } from "@blueprintjs/core";

import { ErrorDisplay } from "../../error-display";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";
import Loading from "@/app/loading";

export default function PropertyIcon({
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
    <>
      {objectDefinition ? (
        <SquareIcon
          icon={(objectDefinition.icon as IconName) || ("cube" as IconName)}
          color={objectDefinition.color || "gray"}
          size={SquareIconSize.SMALL}
        />
      ) : (
        <SquareIcon icon="function" color="gray" size={SquareIconSize.SMALL} />
      )}
    </>
  );
}
