"use client";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
  ChartIdentifierSchema,
  ChartIdentifier,
} from "@/definitions/displays/charts/charts";
import { InferSchemaOutputSuccess } from "@/definitions";
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
import BarChartCreator from "./bar-chart/bar-chart-creator";
import LineChartCreator from "./line-chart/line-chart-creator";
import ScatterPlotCreator from "./scatter-plot/scatter-plot-creator";
import { useEffect, useState } from "react";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";
import MapCreator from "./map/map-creator";

export default function ChartCreator({
  displaySchema,
  setDisplayConfig,
}: {
  displaySchema: InferSchemaOutputSuccess;
  setDisplayConfig: (displayConfig: DisplayConfig | null) => void;
}) {
  const [chartType, setChartType] = useState<ChartIdentifier | null>(null);
  const [chart, setChart] = useState<ChartConfiguration | null>(null);
  const titleField = useField<string>("");
  const descriptionField = useField<string>("");

  useEffect(() => {
    setChartType(null);
    setChart(null);
  }, [displaySchema]);

  useEffect(() => {
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
  }, [chart, titleField.value, descriptionField.value, setDisplayConfig]);

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

  function renderChartConfiguration() {
    switch (chartType) {
      case ChartIdentifierEnum.BarChart:
        return (
          <BarChartCreator displaySchema={displaySchema} setChart={setChart} />
        );
      case ChartIdentifierEnum.ScatterPlot:
        return (
          <ScatterPlotCreator
            displaySchema={displaySchema}
            setChart={setChart}
          />
        );
      case ChartIdentifierEnum.LineChart:
        return (
          <LineChartCreator displaySchema={displaySchema} setChart={setChart} />
        );
      case ChartIdentifierEnum.Map:
        return <MapCreator displaySchema={displaySchema} setChart={setChart} />;
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
