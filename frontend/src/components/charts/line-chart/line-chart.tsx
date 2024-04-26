"use client";
import { useEffect, useRef, useState } from "react";

import { CartesianGrid, Label, Line, LineChart, XAxis, YAxis } from "recharts";

import { LineChart as LineChartType } from "@/definitions/displays/charts/charts";

const X_LABEL_OFFSET = -10;
const CHART_HEIGHT = 450;
const CHART_MARGIN = {
  top: 20,
  bottom: -1 * X_LABEL_OFFSET + 15,
  right: 20,
  left: -5,
};

export default function LineChartComponent({
  configuration,
  data,
}: {
  configuration: LineChartType;
  data: any[];
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number | null>(null);

  const handleResize = () => {
    if (chartRef.current) {
      const parentWidth = chartRef.current.clientWidth;
      setChartWidth(parentWidth);
    }
  };

  useEffect(() => {
    if (data) {
      handleResize();
    }
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={chartRef} className="w-full">
      {!!chartWidth && (
        <LineChart
          height={CHART_HEIGHT}
          width={chartWidth}
          margin={CHART_MARGIN}
          data={data}
        >
          <Line
            type="monotone"
            dataKey={configuration.lineKey}
            stroke={configuration.color}
            strokeWidth={3}
          />
          {configuration.showGraph && (
            <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
          )}
          <XAxis dataKey={configuration.xAxisKey}>
            <Label offset={X_LABEL_OFFSET} position="insideBottom">
              {configuration.xAxisKey}
            </Label>
          </XAxis>
          <YAxis>
            <Label offset={20} angle={-90} position="insideLeft">
              {configuration.lineKey}
            </Label>
          </YAxis>
        </LineChart>
      )}
    </div>
  );
}
