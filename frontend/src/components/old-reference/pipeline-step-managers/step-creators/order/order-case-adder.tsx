"use client";
import { InferredSchema, InferredSchemaProperty } from "@/definitions/pipeline";
import { Button, MenuItem } from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import { SinglePropertySelector } from "@/components/old-reference/property-selectors";
import { OrderCase } from "./order-step-creator";
import { useState } from "react";
import * as _ from "lodash";

export default function OrderCaseAdder({
  schema,
  orderCases,
  setOrderCases,
}: {
  schema: InferredSchema;
  orderCases: OrderCase[];
  setOrderCases: (orderCases: OrderCase[]) => void;
}) {
  const [selectedProperty, setSelectedProperty] =
    useState<InferredSchemaProperty | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<
    "asc" | "desc" | null
  >(null);

  function getProperties() {
    const usedPropertyPaths = _.map(
      orderCases,
      (orderCase: OrderCase) => orderCase.property.api_path,
    );
    return _.filter(
      schema!.properties,
      (property: InferredSchemaProperty) =>
        !_.includes(usedPropertyPaths, property.api_path),
    );
  }

  const renderDirection: ItemRenderer<"asc" | "desc"> = (
    direction: "asc" | "desc",
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={direction}
        roleStructure="listoption"
        selected={direction === selectedDirection}
        text={direction === "asc" ? "Ascending" : "Descending"}
        onClick={handleClick}
      />
    );
  };

  function selectDirection(selection: "asc" | "desc") {
    if (selectedDirection && selection === selectedDirection) {
      setSelectedDirection(null);
    } else {
      setSelectedDirection(selection);
    }
  }

  function addCase() {
    const newCase = {
      property: selectedProperty,
      direction: selectedDirection,
    } as OrderCase;
    setOrderCases([...orderCases, newCase]);
    setSelectedProperty(null);
    setSelectedDirection(null);
  }

  return (
    <div className="flex flex-row mx-3 my-2">
      <SinglePropertySelector
        selectedProperty={selectedProperty}
        setSelectedProperty={setSelectedProperty}
        items={getProperties()}
      />
      <Select<"asc" | "desc">
        className="ml-3"
        filterable={false}
        items={["asc", "desc"]}
        itemRenderer={renderDirection}
        onItemSelect={selectDirection}
      >
        <Button
          rightIcon="double-caret-vertical"
          text={
            selectedDirection
              ? selectedDirection === "asc"
                ? "Ascending"
                : "Descending"
              : "Select direction"
          }
        />
      </Select>
      <Button
        disabled={!selectedProperty || !selectedDirection}
        className="ml-3"
        text="Add"
        onClick={() => addCase()}
      />
    </div>
  );
}
