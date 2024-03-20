"use client";
import { ObjectRelation } from "@/definitions";
import { Button, IconName, MenuItem, Text } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import SingleObjectSelectorListItem from "./single-object-selector-list-item";
import { useObjectDefinition } from "@/data/use-object-definition";
import { useObjects } from "@/data/use-object";
import * as _ from "lodash";

export default function SingleRelatedObjectSelector({
  className,
  objectDefinitionId,
  relation,
  selection,
  setSelectedObject,
  popoverTargetProps,
  disabled,
}: {
  className?: string;
  objectDefinitionId: string;
  relation: ObjectRelation;
  selection: any;
  setSelectedObject: (object: any | null, relation: ObjectRelation) => void;
  popoverTargetProps?: any;
  disabled?: boolean;
}) {
  const {
    data: objectDefinition,
    isLoading: isLoadingObjectDefinition,
    error: objectDefinitionError,
  } = useObjectDefinition(objectDefinitionId);

  const {
    data: allObjects,
    isLoading: isLoadingAllObjects,
    error: allObjectsError,
  } = useObjects(objectDefinitionId);

  if (isLoadingObjectDefinition || isLoadingAllObjects) {
    return <Loading />;
  }

  if (objectDefinitionError || !objectDefinition || allObjectsError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={objectDefinitionError}
      />
    );
  }

  const selectedObject =
    _.find(allObjects, (o) => o[relation.key] === selection) || null;

  function selectObject(selection: any) {
    setSelectedObject(selection, relation);
  }

  const renderObject = (object: any, { handleClick, modifiers }: any) => {
    return (
      <SingleObjectSelectorListItem
        object={object}
        objectDefinition={objectDefinition}
        selectedObject={selectedObject}
        handleClick={handleClick}
      />
    );
  };

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  function renderSelection() {
    if (!!selectedObject) {
      return (
        <div className="flex flex-row items-center w-fit">
          <div className="flex flex-row items-center shirnk-0">
            <div className="mr-2">
              <SquareIcon
                icon={objectDefinition!.icon as IconName}
                color={objectDefinition!.color}
                size={SquareIconSize.SMALL}
              />
            </div>
            <Text className="cursor-pointer bp5-text-muted">
              {selectedObject[relation.key]}
            </Text>
          </div>
          <div className="shrink">
            <Text
              className="ml-3 font-semibold cursor-pointer"
              ellipsize={true}
            >
              {objectDefinition!.title_property
                ? selectedObject[objectDefinition!.title_property]
                : selectedObject[objectDefinition!.primary_key_property]}
            </Text>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-row items-center">
          <Text>Select object from</Text>
          <div className="flex flex-row items-center ml-2">
            <SquareIcon
              icon={objectDefinition!.icon as IconName}
              color={objectDefinition!.color}
              size={SquareIconSize.SMALL}
            />
            <Text className="ml-1 font-semibold">{objectDefinition!.name}</Text>
          </div>
        </div>
      );
    }
  }

  return (
    <Select<any>
      className={className}
      popoverTargetProps={popoverTargetProps}
      items={allObjects}
      //itemPredicate={filterProperties}
      itemRenderer={renderObject}
      onItemSelect={selectObject}
      noResults={noResults}
    >
      <Button
        className="max-w-full"
        rightIcon="double-caret-vertical"
        text={renderSelection()}
      />
    </Select>
  );
}
