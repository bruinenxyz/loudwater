"use client";
import { InferredSchemaProperty } from "@/definitions/pipeline";
import { Tag, Popover, Text, IconName } from "@blueprintjs/core";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { ErrorDisplay } from "@/components/error-display";
import { useObjectDefinition } from "@/data/use-object-definition";
import Loading from "@/app/loading";

export default function MultiPropertySelectorTag({
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

  function renderProperty() {
    return (
      <div className="flex flex-row items-center w-fit">
        {objectDefinition ? (
          <SquareIcon
            icon={objectDefinition.icon as IconName}
            color={objectDefinition.color ? objectDefinition.color : undefined}
            size={SquareIconSize.SMALL}
          />
        ) : (
          <SquareIcon
            icon="function"
            color="gray"
            size={SquareIconSize.SMALL}
          />
        )}
        <div className="flex flex-row items-center py-1 ml-1 w-fit">
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

  if (!!property.description) {
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
        <Tag key={property.api_path.toString()} className="cursor-help">
          {renderProperty()}
        </Tag>
      </Popover>
    );
  } else {
    return (
      <Tag key={property.api_path.toString()} className="cursor-default">
        {renderProperty()}
      </Tag>
    );
  }
}
