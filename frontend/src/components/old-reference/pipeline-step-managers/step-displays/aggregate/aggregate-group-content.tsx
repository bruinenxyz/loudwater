"use client";
import {
  AggregateStep,
  InferSchemaOutputSuccess,
  InferredSchemaProperty,
} from "@/definitions/pipeline";
import { Icon, IconSize, Text } from "@blueprintjs/core";
import InferredSchemaPropertyTag from "@/components/old-reference/properties/tags/inferred-schema-property-tag";
import { useState } from "react";
import * as _ from "lodash";

export default function AggregateGroupContent({
  step,
  inputSchema,
}: {
  step: AggregateStep;
  inputSchema: InferSchemaOutputSuccess;
}) {
  const [viewGroupByToggle, setViewGroupByToggle] = useState<boolean>(false);
  return (
    <div className="w-full border-b border-bluprint-border-gray">
      <div className="my-1 ml-3">
        <div
          className="flex flex-row items-center text-sm hover:cursor-pointer"
          onClick={() => setViewGroupByToggle(!viewGroupByToggle)}
        >
          {viewGroupByToggle ? (
            <>
              <Text className="mr-1">Hide &quot;group by&quot; properties</Text>
              <Icon icon="chevron-down" size={IconSize.LARGE} />
            </>
          ) : (
            <>
              <Text className="mr-1">View &quot;group by&quot; properties</Text>
              <Icon icon="chevron-right" size={IconSize.LARGE} />
            </>
          )}
        </div>
        {viewGroupByToggle && (
          <div className="flex flex-row flex-wrap gap-1 my-2 grow">
            {_.map(step.group, (property: string, index: number) => {
              const schemaProperty = _.find(
                inputSchema!.data.properties,
                (schemaProperty: InferredSchemaProperty) =>
                  schemaProperty.api_path === property,
              );
              return (
                <InferredSchemaPropertyTag
                  key={index}
                  property={schemaProperty!}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
