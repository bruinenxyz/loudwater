"use client";
import { ObjectDefinition, ObjectRelation } from "@/definitions";
import { InferredSchema, InferredSchemaProperty } from "@/definitions/pipeline";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { ErrorDisplay } from "@/components/error-display";
import RelationSelectorButtonProperty from "./relation-selector-button-property";
import RelationSelectorListItem from "./relation-selector-list-item";
import Loading from "@/app/loading";
import {
  useMultiObjectRelations,
  useObjectRelations,
} from "@/data/use-relation";
import * as _ from "lodash";

export default function RelationSelector({
  baseObjectDefinition,
  schema,
  selected,
  setSelected,
}: {
  baseObjectDefinition: ObjectDefinition;
  schema: InferredSchema;
  selected: ObjectRelation | null;
  setSelected: (relation: ObjectRelation | null) => void;
}) {
  const {
    data: baseRelations,
    error: baseRelationsError,
    isLoading: isLoadingBaseRelations,
  } = useObjectRelations(baseObjectDefinition.id);

  const {
    data: additionalRelations,
    error: additionalRelationsError,
    isLoading: isLoadingAdditionalRelations,
  } = useMultiObjectRelations(schema.relations);

  if (isLoadingBaseRelations || isLoadingAdditionalRelations) {
    return <Loading />;
  }

  if (baseRelationsError || additionalRelationsError) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={
          baseRelationsError
            ? baseRelationsError.message
            : additionalRelationsError.message
        }
      />
    );
  }

  function getRelations() {
    const availableProperties = _.map(
      schema.properties,
      (property: InferredSchemaProperty) => property.api_path,
    );
    const validBaseRelations = _.filter(
      baseRelations!,
      (relation: ObjectRelation) =>
        _.includes(availableProperties, relation.base_key),
    );
    const validAdditionalRelations = _.filter(
      additionalRelations!,
      (relation: ObjectRelation) =>
        _.includes(availableProperties, relation.base_key),
    );
    const validRelations = _.concat(
      validBaseRelations,
      validAdditionalRelations,
    );
    return validRelations;
  }

  const filterRelations = (query: string, relation: ObjectRelation) =>
    relation.name
      ? relation.name.toLowerCase().includes(query.toLowerCase())
      : relation.api_name.toLowerCase().includes(query.toLowerCase());

  const renderRelation: ItemRenderer<ObjectRelation> = (
    relation: ObjectRelation,
    { handleClick, modifiers },
  ) => {
    return (
      <RelationSelectorListItem
        relation={relation}
        selected={selected}
        handleClick={handleClick}
      />
    );
  };

  function selectRelation(selection: ObjectRelation) {
    if (selected && selection.api_name === selected.api_name) {
      setSelected(null);
    } else {
      setSelected(selection);
    }
  }

  const noResults = (
    <MenuItem disabled={true} text="No results." roleStructure="listoption" />
  );

  return (
    <Select
      items={getRelations()}
      itemPredicate={filterRelations}
      itemRenderer={renderRelation}
      onItemSelect={selectRelation}
      noResults={noResults}
    >
      <Button
        rightIcon="double-caret-vertical"
        text={
          selected ? (
            <RelationSelectorButtonProperty relation={selected} />
          ) : (
            "Select relation"
          )
        }
      />
    </Select>
  );
}
