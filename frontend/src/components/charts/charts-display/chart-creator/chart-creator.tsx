"use client";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
  ChartIdentifierSchema,
  ChartIdentifier,
  Chart,
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
import BarChartCreator from "./bar-chart/bar-chart-creator";
import LineChartCreator from "./line-chart/line-chart-creator";
import ScatterPlotCreator from "./scatter-plot/scatter-plot-creator";
import { useEffect, useState } from "react";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";

export default function ChartCreator({
  columns,
  setChart,
}: {
  columns: any[];
  setChart: (chartConfig: Chart | null) => void;
}) {
  const [chartType, setChartType] = useState<ChartIdentifier | null>(null);
  const [chartConfig, setChartConfig] = useState<ChartConfiguration | null>(
    null,
  );
  const titleField = useField<string>("");
  const descriptionField = useField<string>("");

  useEffect(() => {
    setChartType(null);
    setChart(null);
  }, [columns]);

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
          <BarChartCreator columns={columns} setChartConfig={setChartConfig} />
        );
      case ChartIdentifierEnum.ScatterPlot:
        return (
          <ScatterPlotCreator columns={columns} setChartConfig={setChartConfig} />
        );
      case ChartIdentifierEnum.LineChart:
        return (
          <LineChartCreator columns={columns} setChartConfig={setChartConfig} />
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
