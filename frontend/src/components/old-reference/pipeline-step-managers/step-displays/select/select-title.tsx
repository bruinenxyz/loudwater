"use client";
import {
  InferSchemaOutputSuccess,
  InferredSchemaProperty,
  SelectStep,
} from "@/definitions/pipeline";
import InferredSchemaPropertyTag from "@/components/old-reference/properties/tags/inferred-schema-property-tag";
import * as _ from "lodash";

export default function SelectTitle({
  step,
  inputSchema,
}: {
  step: SelectStep;
  inputSchema: InferSchemaOutputSuccess;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-1 mx-2 grow">
      {_.map(step.select, (property: string, index: number) => {
        const schemaProperty = _.find(
          inputSchema!.data.properties,
          (schemaProperty: InferredSchemaProperty) =>
            schemaProperty.api_path === property,
        );
        return (
          <InferredSchemaPropertyTag key={index} property={schemaProperty!} />
        );
      })}
    </div>
  );
}
