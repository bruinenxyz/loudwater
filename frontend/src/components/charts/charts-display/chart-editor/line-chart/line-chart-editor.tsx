"use client";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
  LineChart,
} from "@/definitions/displays/charts/charts";
import { SinglePropertySelector } from "@/components/property-selectors";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import { Switch, Text } from "@blueprintjs/core";
import ColorPicker from "@/components/color-picker";
import { useField } from "@/utils/use-field";

export default function LineChartEditor({
  columns,
  setChartConfig,
  chartConfig,
}: {
  columns: any[];
  setChartConfig: (chart: ChartConfiguration | null) => void;
  chartConfig?: LineChart | null;
}) {
  const [lineKey, setLineKey] = useState<string | null>(
    chartConfig?.lineKey ?? null,
  );
  const [xAxisKey, setXAxisKey] = useState<string | null>(
    chartConfig?.xAxisKey ?? null,
  );
  const [showGraph, setShowGraph] = useState<boolean>(
    chartConfig?.showGraph ?? false,
  );
  const colorField = useField<string>(chartConfig?.color ?? "gray");

  useEffect(() => {
    if (!lineKey || (xAxisKey && lineKey === xAxisKey)) {
      setXAxisKey(null);
    }
  }, [lineKey]);

  useEffect(() => {
    if (xAxisKey && lineKey) {
      setChartConfig({
        chartType: ChartIdentifierEnum.LineChart,
        lineKey: lineKey,
        xAxisKey: xAxisKey,
        color: colorField.value ?? "gray",
        showGraph: showGraph,
      });
    } else {
      setChartConfig(null);
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
            items={columns}
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
              columns,
              (property: string) => property !== lineKey,
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
