"use client";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
} from "@/definitions/displays/charts/charts";
import {
  InferredSchemaProperty,
  InferSchemaOutputSuccess,
} from "@/definitions/pipeline";
import { SinglePropertySelector } from "@/components/old-reference/property-selectors";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import { Switch, Text } from "@blueprintjs/core";
import ColorPicker from "@/components/color-picker";
import { useField } from "@/utils/use-field";

export default function LineChartCreator({
  displaySchema,
  setChart,
}: {
  displaySchema: InferSchemaOutputSuccess;
  setChart: (chart: ChartConfiguration | null) => void;
}) {
  const [lineKey, setLineKey] = useState<InferredSchemaProperty | null>(null);
  const [xAxisKey, setXAxisKey] = useState<InferredSchemaProperty | null>(null);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const colorField = useField<string>("gray");

  useEffect(() => {
    if (!lineKey || (xAxisKey && lineKey.api_path === xAxisKey.api_path)) {
      setXAxisKey(null);
    }
  }, [lineKey]);

  useEffect(() => {
    if (xAxisKey && lineKey) {
      setChart({
        chartType: ChartIdentifierEnum.LineChart,
        lineKey: lineKey.api_path,
        xAxisKey: xAxisKey.api_path,
        color: colorField.value ?? "gray",
        showGraph: showGraph,
      });
    } else {
      setChart(null);
    }
  }, [lineKey, xAxisKey, colorField.value, showGraph]);

  return (
    <div className="pt-3">
      <div className="flex flex-row items-center gap-3 pt-3">
        <div className="flex flex-row items-center">
          <Text className="text-lg">Data: </Text>
          <SinglePropertySelector
            className="ml-2"
            selectedProperty={lineKey}
            setSelectedProperty={setLineKey}
            items={displaySchema.data.properties}
            popoverTargetProps={{ className: "w-fit" }}
          />
        </div>
        <div className="flex flex-row items-center">
          <Text className="text-lg">X Axis: </Text>
          <SinglePropertySelector
            className="ml-2"
            disabled={!lineKey}
            selectedProperty={xAxisKey}
            setSelectedProperty={setXAxisKey}
            items={_.filter(
              displaySchema.data.properties,
              (property: InferredSchemaProperty) =>
                property.api_path !== lineKey?.api_path,
            )}
            popoverTargetProps={{ className: "w-fit" }}
          />
        </div>
      </div>
      <div className="flex flex-row items-center gap-3 pt-3">
        <Text className="text-lg">Color: </Text>
        <ColorPicker {...colorField} />
      </div>
      <div className="flex flex-row gap-3 pt-3">
        <Text className="text-lg">Show graph: </Text>
        <Switch
          onChange={() => setShowGraph(!showGraph)}
          large
          className="text-lg"
        />
      </div>
    </div>
  );
}
