"use client";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
  ScatterPlot,
} from "@/definitions/displays/charts/charts";
import { SinglePropertySelector } from "@/components/property-selectors";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import { Switch, Text } from "@blueprintjs/core";
import { useField } from "@/utils/use-field";
import ColorPicker from "@/components/color-picker";

export default function ScatterPlotEditor({
  columns,
  setChartConfig,
  chartConfig,
}: {
  columns: any[];
  setChartConfig: (chart: ChartConfiguration | null) => void;
  chartConfig?: ScatterPlot | null;
}) {
  const [xAxisKey, setXAxisKey] = useState<string | null>(
    chartConfig?.xAxisKey ?? null,
  );
  const [yAxisKey, setYAxisKey] = useState<string | null>(
    chartConfig?.yAxisKey ?? null,
  );
  const [showGraph, setShowGraph] = useState<boolean>(
    chartConfig?.showGraph ?? false,
  );
  const colorField = useField<string>(chartConfig?.color ?? "gray");

  useEffect(() => {
    if (!xAxisKey || (yAxisKey && xAxisKey === yAxisKey)) {
      setXAxisKey(null);
    }
  }, [xAxisKey]);

  useEffect(() => {
    if (xAxisKey && yAxisKey) {
      setChartConfig({
        chartType: ChartIdentifierEnum.ScatterPlot,
        xAxisKey: xAxisKey,
        yAxisKey: yAxisKey,
        color: colorField.value ?? "gray",
        showGraph: showGraph,
      });
    } else {
      setChartConfig(null);
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
            items={columns}
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
              columns,
              (property: string) => property !== xAxisKey,
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
          checked={showGraph}
        />
      </div>
    </div>
  );
}
