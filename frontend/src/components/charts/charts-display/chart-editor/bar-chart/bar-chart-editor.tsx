"use client";
import {
  BarChart,
  ChartConfiguration,
  ChartIdentifierEnum,
} from "@/definitions/displays/charts/charts";
import { InferSchemaOutputSuccess } from "@/definitions/pipeline";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import { useField } from "@/utils/use-field";
import { Switch, Text } from "@blueprintjs/core";
import ColorPicker from "@/components/color-picker";
import { SinglePropertySelector } from "@/components/property-selectors";

export default function BarChartEditor({
  columns,
  setChartConfig,
  chartConfig,
}: {
  columns: any[];
  setChartConfig: (chart: ChartConfiguration | null) => void;
  chartConfig?: BarChart | null;
}) {
  const [barKey, setBarKey] = useState<string | null>(
    chartConfig?.barKey ?? null,
  );
  const [xAxisKey, setXAxisKey] = useState<string | null>(
    chartConfig?.xAxisKey ?? null,
  );
  const [showGraph, setShowGraph] = useState<boolean>(
    chartConfig?.showGraph ?? false,
  );
  const colorField = useField<string>(chartConfig?.color ?? "gray");

  useEffect(() => {
    if (!barKey || (xAxisKey && barKey === xAxisKey)) {
      setXAxisKey(null);
    }
  }, [barKey]);

  useEffect(() => {
    if (xAxisKey && barKey) {
      setChartConfig({
        chartType: ChartIdentifierEnum.BarChart,
        barKey: barKey,
        xAxisKey: xAxisKey,
        color: colorField.value ?? "gray",
        showGraph: showGraph,
      });
    } else {
      setChartConfig(null);
    }
  }, [barKey, xAxisKey, colorField.value, showGraph]);

  return (
    <div className="pt-3">
      <div className="flex flex-row items-center gap-3 pt-3">
        <div className="flex flex-row items-center">
          <Text className="text-lg">Data: </Text>
          <SinglePropertySelector
            className="ml-2"
            selectedProperty={barKey}
            setSelectedProperty={setBarKey}
            items={columns}
            popoverTargetProps={{ className: "w-fit" }}
          />
        </div>
        <div className="flex flex-row items-center">
          <Text className="text-lg">X Axis: </Text>
          <SinglePropertySelector
            className="ml-2"
            disabled={!barKey}
            selectedProperty={xAxisKey}
            setSelectedProperty={setXAxisKey}
            items={_.filter(columns, (column: string) => column !== barKey)}
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
