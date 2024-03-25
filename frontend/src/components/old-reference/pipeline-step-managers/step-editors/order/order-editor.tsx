"use client";
import {
  InferSchemaOutput,
  InferredSchemaProperty,
  OrderStep,
  OrderProperty,
  InferSchemaOutputSuccess,
  StepIdentifierEnum,
  WorkbookStep,
} from "@/definitions";
import { Button, Section, Text } from "@blueprintjs/core";
import InvalidOrderTag from "./invalid-order-tag";
import OrderCreatorTag from "@/components/old-reference/pipeline-step-managers/step-creators/order/order-creator-tag";
import InvalidStepPopover from "@/components/old-reference/pipeline-step-managers/invalid-step-popover";
import OrderCaseAdder from "@/components/old-reference/pipeline-step-managers/step-creators/order/order-case-adder";
import { useEffect, useState } from "react";
import * as _ from "lodash";

export type OrderCase = {
  property: InferredSchemaProperty;
  direction: "asc" | "desc";
};

export default function OrderEditor({
  step,
  stepIndex,
  updateStep,
  schema,
  inputSchema,
  setIsEditing,
}: {
  step: OrderStep;
  stepIndex: number;
  updateStep: (step: WorkbookStep, index: number) => void;
  schema: InferSchemaOutput;
  inputSchema: InferSchemaOutputSuccess;
  setIsEditing: (value: boolean) => void;
}) {
  // State for invalid order cases
  const [invalidCases, setInvalidCases] = useState<OrderProperty[]>([]);
  // State for valid order cases
  const [selectedCases, setSelectedCases] = useState<OrderCase[]>([]);

  // Update selected valid/invalid order cases when input schema changes
  useEffect(() => {
    if (inputSchema && inputSchema.success) {
      const availablePropertyPaths = _.map(
        inputSchema.data.properties,
        (property: InferredSchemaProperty) => property.api_path,
      );
      const [validSelectedConditions, invalidSelectedConditions] = _.partition(
        step.order,
        (orderCondition: OrderProperty) =>
          _.includes(availablePropertyPaths, orderCondition.property),
      );
      setInvalidCases(invalidSelectedConditions);
      setSelectedCases(
        _.map(validSelectedConditions, (orderCondition: OrderProperty) => {
          return {
            property: _.find(
              inputSchema.data.properties,
              (property: InferredSchemaProperty) =>
                property.api_path === orderCondition.property,
            ) as InferredSchemaProperty,
            direction: orderCondition.direction,
          };
        }),
      );
    }
  }, [inputSchema]);

  function removeCase(selectedIndex: number) {
    setInvalidCases(
      _.filter(invalidCases, (value, index) => index !== selectedIndex),
    );
  }

  function renderRightElement() {
    return (
      <div className="flex flex-row">
        <Button
          alignText="left"
          disabled={!selectedCases.length}
          text="Save"
          onClick={() =>
            updateStep(
              {
                type: StepIdentifierEnum.Order,
                order: [
                  ..._.map(selectedCases, (selectedCase: OrderCase) => {
                    return {
                      property: selectedCase.property.api_path,
                      direction: selectedCase.direction,
                    } as OrderProperty;
                  }),
                  ...invalidCases,
                ],
              } as OrderStep,
              stepIndex,
            )
          }
        />
        <Button
          className="ml-2"
          alignText="left"
          text="Cancel"
          onClick={() => setIsEditing(false)}
        />
      </div>
    );
  }

  function renderCases() {
    return (
      <div className="flex flex-row w-full gap-1 mx-3 my-2">
        {selectedCases.map((orderCase: OrderCase, index: number) => {
          return (
            <OrderCreatorTag
              key={index}
              property={orderCase.property}
              direction={orderCase.direction}
              index={index}
              orderCases={selectedCases}
              setOrderCases={setSelectedCases}
            />
          );
        })}
      </div>
    );
  }

  return (
    <Section
      className={`flex-none w-full my-2 rounded-sm ${
        invalidCases.length ? "border-2 border-error" : ""
      }`}
      title={
        !invalidCases.length ? (
          <Text className="text-xl">Order</Text>
        ) : (
          <div className="items-center">
            <div className="flex flex-row items-center">
              <Text className="text-xl grow-0">Order:</Text>
              <InvalidStepPopover errors={schema!.error.issues} />
            </div>
          </div>
        )
      }
      rightElement={renderRightElement()}
    >
      {!!invalidCases.length && (
        <div className="flex flex-row mx-3 mt-2">
          <div className="flex flex-row items-center h-4">
            <Text className="text-md">Invalid order cases:</Text>
          </div>
          <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
            {_.map(
              invalidCases,
              (invalidCase: OrderProperty, index: number) => {
                return (
                  <InvalidOrderTag
                    key={index}
                    invalidCase={invalidCase}
                    index={index}
                    removeCase={removeCase}
                  />
                );
              },
            )}
          </div>
        </div>
      )}
      {!!selectedCases.length && renderCases()}
      <OrderCaseAdder
        schema={inputSchema.data}
        orderCases={selectedCases}
        setOrderCases={setSelectedCases}
      />
    </Section>
  );
}
