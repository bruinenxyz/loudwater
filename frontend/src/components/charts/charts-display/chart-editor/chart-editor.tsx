"use client";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
  ChartIdentifierSchema,
  ChartIdentifier,
  Chart,
  BarChart,
  ScatterPlot,
  LineChart,
} from "@/definitions/displays/charts/charts";
import { InferSchemaOutputSuccess } from "@/definitions";
import { DisplayIdentifierEnum } from "@/definitions/displays/enum";
import {
  Button,
  FormGroup,
  InputGroup,
  MenuItem,
  TextArea,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import BarChartEditor from "./bar-chart/bar-chart-editor";
import LineChartEditor from "./line-chart/line-chart-editor";
import ScatterPlotEditor from "./scatter-plot/scatter-plot-editor";
import { useEffect, useState } from "react";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";

export default function ChartEditor({
  columns,
  chart,
  setChart,
}: {
  columns: any[];
  chart: Chart | null;
  setChart: (chartConfig: Chart | null) => void;
}) {
  const [chartType, setChartType] = useState<ChartIdentifier | null>(
    chart?.configuration.chartType ?? null,
  );
  const [chartConfig, setChartConfig] = useState<ChartConfiguration | null>(
    chart?.configuration ?? null,
  );
  const titleField = useField<string>(chart?.title ?? "");
  const descriptionField = useField<string>(chart?.description ?? "");

  useEffect(() => {
    if (chartConfig && titleField.value) {
      setChart({
        displayType: DisplayIdentifierEnum.Chart,
        title: titleField.value,
        description: descriptionField.value,
        configuration: chartConfig,
      });
    } else {
      setChart(null);
    }
  }, [chartConfig, titleField.value, descriptionField.value, setChart]);

  // Makes chart types more readable by replacing underscores with spaces and capitalizing each word
  function readableChartType(type: ChartIdentifier) {
    return _.map(_.split(type, "_"), (part: string) => _.capitalize(part)).join(
      " ",
    );
  }

  const renderChartType: ItemRenderer<ChartIdentifier> = (
    type: ChartIdentifier,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={type}
        roleStructure="listoption"
        selected={type === chartType}
        text={readableChartType(type)}
        onClick={handleClick}
      />
    );
  };

  function selectChartType(selection: ChartIdentifier) {
    if (chartType && selection === chartType) {
      setChartType(null);
    } else {
      setChartType(selection);
    }
    setChart(null);
  }

  function renderChartConfiguration() {
    switch (chartType) {
      case ChartIdentifierEnum.BarChart:
        return (
          <BarChartEditor
            columns={columns}
            setChartConfig={setChartConfig}
            chartConfig={chartConfig as BarChart}
          />
        );
      case ChartIdentifierEnum.ScatterPlot:
        return (
          <ScatterPlotEditor
            columns={columns}
            setChartConfig={setChartConfig}
            chartConfig={chartConfig as ScatterPlot}
          />
        );
      case ChartIdentifierEnum.LineChart:
        return (
          <LineChartEditor
            columns={columns}
            setChartConfig={setChartConfig}
            chartConfig={chartConfig as LineChart}
          />
        );
      default:
        return <></>;
    }
  }

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-col">
          <FormGroup
            label="Title"
            labelFor="title-input"
            labelInfo="(required)"
          >
            <InputGroup id="title-input" {...titleField} autoFocus={false} />
          </FormGroup>
          <FormGroup label="Description" labelFor="description-input">
            <TextArea
              id="description-input"
              value={descriptionField.value}
              onChange={(e) => descriptionField.onValueChange(e.target.value)}
              autoFocus={false}
              fill={true}
              autoResize={true}
            />
          </FormGroup>
        </div>
        <Select<ChartIdentifier>
          filterable={false}
          popoverProps={{ position: "bottom" }}
          popoverTargetProps={{ className: "w-fit" }}
          items={_.map(ChartIdentifierSchema.enum, (value: ChartIdentifier) => {
            return value;
          })}
          itemRenderer={renderChartType}
          onItemSelect={selectChartType}
        >
          <Button
            rightIcon="double-caret-vertical"
            text={
              chartType ? readableChartType(chartType) : "Select chart type"
            }
          />
        </Select>
      </div>

      {chartType && renderChartConfiguration()}
    </div>
  );
}
