"use client";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
  ChartIdentifierSchema,
  ChartIdentifier,
} from "@/definitions/displays/charts/charts";
import { InferSchemaOutput, InferSchemaOutputSuccess } from "@/definitions";
import { DisplayConfig } from "@/definitions/displays/displays";
import { DisplayIdentifierEnum } from "@/definitions/displays/enum";
import {
  Button,
  FormGroup,
  InputGroup,
  MenuItem,
  TextArea,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import BarChartCreator from "@/components/old-reference/pipeline-step-managers/step-creators/display/chart-creator/bar-chart/bar-chart-creator";
import ScatterPlotCreator from "@/components/old-reference/pipeline-step-managers/step-creators/display/chart-creator/scatter-plot/scatter-plot-creator";
import LineChartCreator from "@/components/old-reference/pipeline-step-managers/step-creators/display/chart-creator/line-chart/line-chart-creator";
import { useEffect, useState } from "react";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";
import MapCreator from "@/components/old-reference/pipeline-step-managers/step-creators/display/chart-creator/map/map-creator";

export default function ChartEditor({
  branchSchema,
  setDisplayConfig,
  baseDisplayConfig,
}: {
  branchSchema: InferSchemaOutput;
  setDisplayConfig: (displayConfig: DisplayConfig | null) => void;
  baseDisplayConfig: DisplayConfig | null;
}) {
  const titleField = useField<string>(
    baseDisplayConfig ? baseDisplayConfig.title : "",
  );
  const descriptionField = useField<string>(
    baseDisplayConfig ? baseDisplayConfig.description : "",
  );
  const [chartType, setChartType] = useState<ChartIdentifier | null>(null);
  const [chart, setChart] = useState<ChartConfiguration | null>(null);

  useEffect(() => {
    setChartType(null);
    setChart(null);
  }, [branchSchema]);

  useEffect(() => {
    // If chart type is selected and chart is configured, set display config and allow the display to be saved
    // Otherwise, set display config to null and prevent the display from being saved
    if (chart && titleField.value) {
      setDisplayConfig({
        displayType: DisplayIdentifierEnum.Chart,
        title: titleField.value,
        description: descriptionField.value,
        configuration: chart,
      });
    } else {
      setDisplayConfig(null);
    }
  }, [titleField.value, descriptionField.value, chart, setDisplayConfig]);

  // Swap out chart idefinitfier for friendly name in the UI
  function readableChartType(type: ChartIdentifier) {
    switch (type) {
      case ChartIdentifierEnum.BarChart:
        return "Bar Chart";
      case ChartIdentifierEnum.ScatterPlot:
        return "Scatter Plot";
      case ChartIdentifierEnum.LineChart:
        return "Line Chart";
      case ChartIdentifierEnum.Table:
        return "Table";
      case ChartIdentifierEnum.Map:
        return "Map";
    }
  }

  function selectChartType(selection: ChartIdentifier) {
    if (chartType && selection === chartType) {
      setChartType(null);
      setChart(null);
    } else {
      setChartType(selection);
      if (selection === ChartIdentifierEnum.Table) {
        setChart({ chartType: ChartIdentifierEnum.Table });
      } else {
        setChart(null);
      }
    }
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

  function renderChartConfiguration() {
    switch (chartType) {
      case ChartIdentifierEnum.BarChart:
        return (
          <BarChartCreator
            displaySchema={branchSchema as InferSchemaOutputSuccess}
            setChart={setChart}
          />
        );
      case ChartIdentifierEnum.ScatterPlot:
        return (
          <ScatterPlotCreator
            displaySchema={branchSchema as InferSchemaOutputSuccess}
            setChart={setChart}
          />
        );
      case ChartIdentifierEnum.LineChart:
        return (
          <LineChartCreator
            displaySchema={branchSchema as InferSchemaOutputSuccess}
            setChart={setChart}
          />
        );
      case ChartIdentifierEnum.Map:
        return (
          <MapCreator
            displaySchema={branchSchema as InferSchemaOutputSuccess}
            setChart={setChart}
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
        {branchSchema.success && (
          <>
            <Select<ChartIdentifier>
              filterable={false}
              popoverProps={{ position: "bottom" }}
              popoverTargetProps={{ className: "w-fit" }}
              items={_.map(
                ChartIdentifierSchema.enum,
                (value: ChartIdentifier) => {
                  return value;
                },
              )}
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
            {chartType && renderChartConfiguration()}
          </>
        )}
      </div>
    </div>
  );
}
