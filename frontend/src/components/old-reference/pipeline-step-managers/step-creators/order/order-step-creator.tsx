"use client";
import {
  InferredSchemaProperty,
  OrderStep,
  Pipeline,
  StepIdentifierEnum,
  PartialPipeline,
  PartialWorkbook,
  Workbook,
  WorkbookStep,
} from "@/definitions";
import { Button, Section, Text } from "@blueprintjs/core";
import NewStepSelection from "../new-step-selection";
import OrderCaseAdder from "./order-case-adder";
import OrderCreatorTag from "./order-creator-tag";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";
import * as _ from "lodash";

export type OrderCase = {
  property: InferredSchemaProperty;
  direction: "asc" | "desc";
};

export default function OrderStepCreator({
  fullPipeline,
  index,
  setNewStepType,
  addStepToPipeline,
}: {
  fullPipeline: Workbook | Pipeline | PartialPipeline | PartialWorkbook;
  index: number;
  setNewStepType: (newStepObj: NewStepSelection | null) => void;
  addStepToPipeline: (newStep: WorkbookStep, index: number) => void;
}) {
  const [orderCases, setOrderCases] = useState<OrderCase[]>([]);

  const partialPipeline = {
    ...fullPipeline,
    steps: fullPipeline.steps.slice(0, index),
  };

  const {
    data: schema,
    error: schemaError,
    isLoading: isLoadingSchema,
  } = useValidatePipelineAndWorkbook(partialPipeline);

  if (isLoadingSchema) {
    return <Loading />;
  }

  if (schemaError || !schema || !schema.success) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={schemaError.message}
      />
    );
  }

  function renderCases() {
    return (
      <div className="flex flex-row w-full gap-1 mx-3 my-2">
        {orderCases.map((orderCase: OrderCase, index: number) => {
          return (
            <OrderCreatorTag
              key={index}
              property={orderCase.property}
              direction={orderCase.direction}
              index={index}
              orderCases={orderCases}
              setOrderCases={setOrderCases}
            />
          );
        })}
      </div>
    );
  }

  return (
    <Section
      className="flex-none w-full mt-2 rounded-sm"
      title={<Text className="text-xl">Order</Text>}
      rightElement={
        <div className="flex flex-row">
          <Button
            alignText="left"
            disabled={!orderCases.length}
            text="Add step"
            onClick={() =>
              addStepToPipeline(
                {
                  type: StepIdentifierEnum.Order,
                  order: _.map(orderCases, (orderCase: OrderCase) => {
                    return {
                      property: orderCase.property.api_path,
                      direction: orderCase.direction,
                    };
                  }),
                } as OrderStep,
                index,
              )
            }
          />
          <Button
            className="ml-2"
            alignText="left"
            text="Cancel step"
            onClick={() => {
              setNewStepType(null);
            }}
          />
        </div>
      }
    >
      {!!orderCases.length && renderCases()}
      <OrderCaseAdder
        schema={schema.data}
        orderCases={orderCases}
        setOrderCases={setOrderCases}
      />
    </Section>
  );
}
