"use client";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { useObjectDefinition } from "@/data/use-object-definition";
import { InferredSchemaProperty } from "@/definitions";
import { IconName, Popover, Tag, Text } from "@blueprintjs/core";

export default function InferredSchemaPropertyTag({
  property,
  action,
}: {
  property: InferredSchemaProperty;
  action?: () => void;
}) {
  const {
    data: objectDefinition,
    isLoading: isLoadingObjectDefinition,
    error: objectDefinitionError,
  } = useObjectDefinition(property.object_definition_id);

  if (isLoadingObjectDefinition) {
  }
  if (objectDefinitionError) {
    return null;
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
        <Tag
          minimal={true}
          intent={"none"}
          className={`h-fit w-fit ${
            !!action ? "cursor-pointer" : "cursor-help"
          }`}
          onClick={action}
        >
          <div className="flex flex-row items-center w-fit">
            {objectDefinition ? (
              <SquareIcon
                icon={objectDefinition.icon as IconName}
                color={
                  objectDefinition.color ? objectDefinition.color : undefined
                }
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
        </Tag>
      </Popover>
    );
  } else {
    return (
      <Tag
        minimal={true}
        intent={"none"}
        className={`h-fit w-fit ${
          !!action ? "cursor-pointer" : "cursor-default "
        }`}
        onClick={action}
      >
        <div className="flex flex-row items-center w-fit">
          {objectDefinition ? (
            <SquareIcon
              icon={objectDefinition.icon as IconName}
              color={
                objectDefinition.color ? objectDefinition.color : undefined
              }
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
      </Tag>
    );
  }
}
