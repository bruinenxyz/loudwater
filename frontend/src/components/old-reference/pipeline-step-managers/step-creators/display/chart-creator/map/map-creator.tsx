"use client";
import {
  InferSchemaOutputSuccess,
  InferredSchemaProperty,
  ObjectPropertyTypeEnum,
} from "@/definitions";
import {
  ChartConfiguration,
  ChartIdentifierEnum,
  MapMarkersSchema,
  MapLinesSchema,
} from "@/definitions/displays/charts/charts";
import { Button, Text, Checkbox } from "@blueprintjs/core";
import { SinglePropertySelector } from "@/components/old-reference/property-selectors";
import ColorPicker from "@/components/color-picker";
import { useEffect, useState } from "react";
import * as _ from "lodash";

export default function MapCreator({
  displaySchema,
  setChart,
}: {
  displaySchema: InferSchemaOutputSuccess;
  setChart: (chart: ChartConfiguration | null) => void;
}) {
  const [markerLatitudeKey, setMarkerLatitudeKey] =
    useState<InferredSchemaProperty | null>(null);
  const [markerLongitudeKey, setMarkerLongitudeKey] =
    useState<InferredSchemaProperty | null>(null);
  const [markerColor, setMarkerColor] = useState<string>("#5ACDDA");
  const [originLatitudeKey, setOriginLatitudeKey] =
    useState<InferredSchemaProperty | null>(null);
  const [originLongitudeKey, setOriginLongitudeKey] =
    useState<InferredSchemaProperty | null>(null);
  const [destinationLatitudeKey, setDestinationLatitudeKey] =
    useState<InferredSchemaProperty | null>(null);
  const [destinationLongitudeKey, setDestinationLongitudeKey] =
    useState<InferredSchemaProperty | null>(null);
  const [lineColor, setLineColor] = useState<string>("#5ACDDA");
  const [geodesic, setGeodesic] = useState<boolean>(true);

  function isValidMapConfig() {
    const hasValidMarkerKeys =
      (markerLatitudeKey && markerLongitudeKey) ||
      (!markerLatitudeKey && !markerLongitudeKey);
    const hasValidLineKeys =
      (originLatitudeKey &&
        originLongitudeKey &&
        destinationLatitudeKey &&
        destinationLongitudeKey) ||
      (!originLatitudeKey &&
        !originLongitudeKey &&
        !destinationLatitudeKey &&
        !destinationLongitudeKey);

    return hasValidMarkerKeys && hasValidLineKeys;
  }

  useEffect(() => {
    if (isValidMapConfig()) {
      const markers = {
        latitudeKey: markerLatitudeKey?.api_path,
        longitudeKey: markerLongitudeKey?.api_path,
        color: markerColor,
      };
      const lines = {
        originLatitudeKey: originLatitudeKey?.api_path,
        originLongitudeKey: originLongitudeKey?.api_path,
        destinationLatitudeKey: destinationLatitudeKey?.api_path,
        destinationLongitudeKey: destinationLongitudeKey?.api_path,
        color: lineColor,
        geodesic: geodesic,
      };
      const parsedMarkers = MapMarkersSchema.safeParse(markers);
      const parsedLines = MapLinesSchema.safeParse(lines);
      setChart({
        chartType: ChartIdentifierEnum.Map,
        markers: parsedMarkers.success ? parsedMarkers.data : undefined,
        lines: parsedLines.success ? parsedLines.data : undefined,
      });
    } else {
      setChart(null);
    }
  }, [
    markerLatitudeKey,
    markerLongitudeKey,
    markerColor,
    originLatitudeKey,
    originLongitudeKey,
    destinationLatitudeKey,
    destinationLongitudeKey,
    lineColor,
    geodesic,
  ]);

  function renderMarkersConfiguration() {
    return (
      <div className="flex flex-col gap-2 mt-3">
        <div className="flex flex-row items-center gap-2">
          <Text className="font-bold text-md">Markers</Text>
          <Button
            minimal
            outlined
            small
            icon="reset"
            text="Reset"
            onClick={() => {
              setMarkerLatitudeKey(null);
              setMarkerLongitudeKey(null);
              setMarkerColor("#5ACDDA");
            }}
          />
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-row items-center">
            <Text className="text-md">Latitude:</Text>
            <SinglePropertySelector
              className="ml-2"
              selectedProperty={markerLatitudeKey}
              setSelectedProperty={setMarkerLatitudeKey}
              items={_.filter(
                displaySchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.type === ObjectPropertyTypeEnum.number ||
                  property.type === ObjectPropertyTypeEnum.float,
              )}
              popoverTargetProps={{ className: "w-fit" }}
            />
          </div>
          <div className="flex flex-row items-center">
            <Text className="text-md">Longitude:</Text>
            <SinglePropertySelector
              className="ml-2"
              selectedProperty={markerLongitudeKey}
              setSelectedProperty={setMarkerLongitudeKey}
              items={_.filter(
                displaySchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.type === ObjectPropertyTypeEnum.number ||
                  property.type === ObjectPropertyTypeEnum.float,
              )}
              popoverTargetProps={{ className: "w-fit" }}
            />
          </div>
          <div className="flex flex-row items-center">
            <Text className="text-md">Icon Color</Text>
            <ColorPicker
              className="ml-2"
              value={markerColor}
              onValueChange={setMarkerColor}
            />
          </div>
        </div>
      </div>
    );
  }

  function renderLinesConfiguration() {
    return (
      <div className="flex flex-col gap-2 mt-3">
        <div className="flex flex-row items-center gap-2">
          <Text className="font-bold text-md">Lines</Text>
          <Button
            minimal
            small
            outlined
            icon="reset"
            text="Reset"
            onClick={() => {
              setOriginLatitudeKey(null);
              setOriginLongitudeKey(null);
              setDestinationLatitudeKey(null);
              setDestinationLongitudeKey(null);
              setGeodesic(true);
              setLineColor("#5ACDDA");
            }}
          />
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-row items-center">
            <Text className="text-md">Origin Latitude:</Text>
            <SinglePropertySelector
              className="ml-2"
              selectedProperty={originLatitudeKey}
              setSelectedProperty={setOriginLatitudeKey}
              items={_.filter(
                displaySchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.type === ObjectPropertyTypeEnum.number ||
                  property.type === ObjectPropertyTypeEnum.float,
              )}
              popoverTargetProps={{ className: "w-fit" }}
            />
          </div>
          <div className="flex flex-row items-center">
            <Text className="text-md">Origin Longitude:</Text>
            <SinglePropertySelector
              className="ml-2"
              selectedProperty={originLongitudeKey}
              setSelectedProperty={setOriginLongitudeKey}
              items={_.filter(
                displaySchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.type === ObjectPropertyTypeEnum.number ||
                  property.type === ObjectPropertyTypeEnum.float,
              )}
              popoverTargetProps={{ className: "w-fit" }}
            />
          </div>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-row items-center">
            <Text className="text-md">Destination Latitude:</Text>
            <SinglePropertySelector
              className="ml-2"
              selectedProperty={destinationLatitudeKey}
              setSelectedProperty={setDestinationLatitudeKey}
              items={_.filter(
                displaySchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.type === ObjectPropertyTypeEnum.number ||
                  property.type === ObjectPropertyTypeEnum.float,
              )}
              popoverTargetProps={{ className: "w-fit" }}
            />
          </div>
          <div className="flex flex-row items-center">
            <Text className="text-md">Destination Longitude:</Text>
            <SinglePropertySelector
              className="ml-2"
              selectedProperty={destinationLongitudeKey}
              setSelectedProperty={setDestinationLongitudeKey}
              items={_.filter(
                displaySchema.data.properties,
                (property: InferredSchemaProperty) =>
                  property.type === ObjectPropertyTypeEnum.number ||
                  property.type === ObjectPropertyTypeEnum.float,
              )}
              popoverTargetProps={{ className: "w-fit" }}
            />
          </div>
        </div>
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-row items-center">
            <Text className="text-md">Line Color:</Text>
            <ColorPicker
              className="ml-2"
              value={lineColor}
              onValueChange={setLineColor}
            />
          </div>
          <div className="flex flex-row items-center">
            <Text className="text-md">Geodesic Lines:</Text>
            <Checkbox
              className="mb-0 ml-1"
              inline
              checked={geodesic}
              onClick={() => setGeodesic(!geodesic)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderMarkersConfiguration()}
      {renderLinesConfiguration()}
    </>
  );
}
