"use client";
import {
  InferredSchemaRelation,
  InferSchemaOutputSuccess,
  RelateStep,
} from "@/definitions/pipeline";
import { Button, IconName, Text } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useObjectDefinition } from "@/data/use-object-definition";
import * as _ from "lodash";

export default function RelateTitle({
  step,
  schema,
}: {
  step: RelateStep;
  schema: InferSchemaOutputSuccess;
}) {
  // Find the related object definition Id & API path
  const relatedObjectDefinition = _.find(
    schema.data.relations,
    (relation: InferredSchemaRelation) => {
      return relation.api_path === step.relation;
    },
  );

  // Get the object definition for the related object
  const {
    data: relationObjectDefinition,
    isLoading: isLoadingRelationObjectDefinition,
    error: relationObjectDefinitionError,
  } = useObjectDefinition(relatedObjectDefinition?.object_definition_id);

  if (isLoadingRelationObjectDefinition) {
    return <Loading />;
  }

  if (relationObjectDefinitionError || !relationObjectDefinition) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={relationObjectDefinitionError.message}
      />
    );
  }

  return (
    <Button
      className="ml-2 bg-white border border-bluprint-border-gray"
      // TODO: add onClick to open object definition drawer
    >
      <div className="flex flex-row items-center">
        <SquareIcon
          icon={
            (relationObjectDefinition!.icon as IconName) || ("cube" as IconName)
          }
          color={relationObjectDefinition!.color || "gray"}
          size={SquareIconSize.SMALL}
        />
        <div className="flex flex-row items-center ml-2">
          <Text className="text-md">
            {relatedObjectDefinition!.relation_name
              ? relatedObjectDefinition!.relation_name
              : relationObjectDefinition.name}
          </Text>
        </div>
      </div>
    </Button>
  );
}
