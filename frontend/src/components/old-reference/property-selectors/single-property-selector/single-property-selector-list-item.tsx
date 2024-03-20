"use client";
import { InferredSchemaProperty } from "@/definitions/pipeline";
import { IconName, MenuItem, Text } from "@blueprintjs/core";
import { ErrorDisplay } from "@/components/error-display";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useObjectDefinition } from "@/data/use-object-definition";
import Loading from "@/app/loading";

export default function SinglePropertySelectorListItem({
  property,
  selectedProperty,
  handleClick,
}: {
  property: InferredSchemaProperty;
  selectedProperty: InferredSchemaProperty | null;
  handleClick: any;
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
        <div className="flex flex-row items-center py-1 ml-2 w-fit">
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

  return (
    <MenuItem
      key={property.api_path}
      roleStructure="listoption"
      selected={
        !!(selectedProperty && selectedProperty.api_path === property.api_path)
      }
      shouldDismissPopover={true}
      text={renderProperty()}
      onClick={handleClick}
    />
  );
}
