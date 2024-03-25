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
import { useField } from "@/utils/use-field";
import ColorPicker from "@/components/color-picker";

export default function ScatterPlotCreator({
  displaySchema,
  setChart,
}: {
  displaySchema: InferSchemaOutputSuccess;
  setChart: (chart: ChartConfiguration | null) => void;
}) {
  const [xAxisKey, setXAxisKey] = useState<InferredSchemaProperty | null>(null);
  const [yAxisKey, setYAxisKey] = useState<InferredSchemaProperty | null>(null);
  const [showGraph, setShowGraph] = useState<boolean>(false);
  const colorField = useField<string>("gray");

  useEffect(() => {
    if (!xAxisKey || (yAxisKey && xAxisKey.api_path === yAxisKey.api_path)) {
      setXAxisKey(null);
    }
  }, [xAxisKey]);

  useEffect(() => {
    if (xAxisKey && yAxisKey) {
      setChart({
        chartType: ChartIdentifierEnum.ScatterPlot,
        xAxisKey: xAxisKey.api_path,
        yAxisKey: yAxisKey.api_path,
        color: colorField.value ?? "gray",
        showGraph: showGraph,
      });
    } else {
      setChart(null);
    }
  }, [xAxisKey, yAxisKey, showGraph, colorField.value]);

  return (
    <div className="pt-3">
      <div className="flex flex-row items-center gap-3 pt-3">
        <div className="flex flex-row items-center">
          <Text className="text-lg">X Axis: </Text>
          <SinglePropertySelector
            className="ml-2"
            selectedProperty={xAxisKey}
            setSelectedProperty={setXAxisKey}
            items={displaySchema.data.properties}
            popoverTargetProps={{ className: "w-fit" }}
          />
        </div>
        <div className="flex flex-row items-center">
          <Text className="text-lg">Y Axis: </Text>
          <SinglePropertySelector
            className="ml-2"
            disabled={!xAxisKey}
            selectedProperty={yAxisKey}
            setSelectedProperty={setYAxisKey}
            items={_.filter(
              displaySchema.data.properties,
              (property: InferredSchemaProperty) =>
                property.api_path !== xAxisKey?.api_path,
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
