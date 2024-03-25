"use client";
import { PartialPipeline, Pipeline } from "@/definitions";
import { Map as MapType } from "@/definitions/displays/charts/charts";
import { Text, Icon, IconSize, Divider } from "@blueprintjs/core";
import ReactMapGL, {
  GeolocateControl,
  NavigationControl,
  Layer,
  Marker,
  Popup,
  Source,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@/data/use-query";
import * as turf from "@turf/turf";
import * as _ from "lodash";

const MAX_DISTANCE_BETWEEN_POINTS = 200;

export default function MapComponent({
  configuration,
  pipeline,
}: {
  configuration: MapType;
  pipeline: Pipeline | PartialPipeline;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number | null>(null);
  const [viewState, setViewState] = useState({
    latitude: 20.0,
    longitude: 0.0,
    zoom: 1.1,
  });
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const { data: data, isLoading: isLoading, error: error } = useQuery(pipeline);

  const handleResize = () => {
    if (chartRef.current) {
      const parentWidth = chartRef.current.clientWidth;
      setChartWidth(parentWidth);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      handleResize();
    }
  }, [isLoading]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorDisplay title="Unexpected error" description={error.message} />
    );
  }

  function renderMarkers() {
    if (configuration.markers !== undefined) {
      return _.map(data, (object: any, index: number) => {
        return (
          <Marker
            key={index}
            latitude={object[configuration.markers!.latitudeKey]}
            longitude={object[configuration.markers!.longitudeKey]}
            anchor="bottom"
            onClick={(e) => setSelectedMarker(object)}
          >
            <Icon
              icon="map-marker"
              className="cursor-pointer"
              color={
                configuration.markers!.color !== undefined
                  ? configuration.markers!.color
                  : "#5ACDDA"
              }
            />
          </Marker>
        );
      });
    }
  }

  // Given an origin and destination, calculate the coordinates of the geodesic line
  function calculateGeodesicLine(origin: number[], destination: number[]) {
    // Calculate geodesic line length
    const lineLength = turf.distance(
      turf.point(origin),
      turf.point(destination),
    );
    // Calculate geodesic line bearing
    const lineBearing = turf.bearing(
      turf.point(origin),
      turf.point(destination),
    );
    // Calculate number of geodesic line points
    const intermediatePointCount = Math.max(
      1,
      Math.ceil(lineLength / MAX_DISTANCE_BETWEEN_POINTS),
    );
    // Calculate the distance between each geodesic line point
    const stepDistance = lineLength / (intermediatePointCount + 1);

    // Add the origin to the array of geodesic line points
    const geodesicLinePoints = [origin];
    // Calculate the coordinates of the intermediate points and add them to the array
    for (let i = 1; i <= intermediatePointCount; i++) {
      const distance = i * stepDistance;
      const intermediatePoint = turf.destination(
        origin as any,
        distance,
        lineBearing,
      );
      geodesicLinePoints.push(intermediatePoint.geometry.coordinates);
    }
    // Add the destination to the array
    geodesicLinePoints.push(destination);

    // Return the array of geodesic line points
    return geodesicLinePoints;
  }

  function renderLines() {
    if (configuration.lines !== undefined) {
      const lines = _.map(data, (object: any) => {
        const origin = [
          object[configuration.lines!.originLongitudeKey],
          object[configuration.lines!.originLatitudeKey],
        ];
        const destination = [
          object[configuration.lines!.destinationLongitudeKey],
          object[configuration.lines!.destinationLatitudeKey],
        ];
        return {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: configuration.lines!.geodesic
              ? calculateGeodesicLine(origin, destination)
              : [origin, destination],
          },
        };
      });
      const linesData = {
        type: "FeatureCollection",
        features: [...lines],
      };
      return (
        <Source id="line" type="geojson" data={linesData as any}>
          <Layer
            id="lineLayer"
            type="line"
            paint={{
              "line-color": configuration.lines!.color
                ? configuration.lines!.color
                : "#5ACDDA",
              "line-width": 2,
            }}
          />
        </Source>
      );
    }
  }

  function renderMarkerPopup() {
    return (
      <Popup
        latitude={selectedMarker[configuration.markers!.latitudeKey]}
        longitude={selectedMarker[configuration.markers!.longitudeKey]}
        closeOnClick={false}
        closeButton={false}
      >
        <div className="flex flex-col max-w-full max-h-full overflow-y-auto">
          <div className="flex flex-row items-center justify-between ">
            <Text className="text-xs bp5-text-muted">{`(${
              selectedMarker[configuration.markers!.latitudeKey]
            }, ${selectedMarker[configuration.markers!.longitudeKey]})`}</Text>
            <Icon
              icon="cross"
              onClick={() => setSelectedMarker(null)}
              className="cursor-pointer"
            />
          </div>
          <Divider className="mb-1" />
          <div className="flex flex-col gap-1 px-2 pb-1">
            {_.map(selectedMarker, (value: any, key: string) => {
              return (
                <div
                  key={key}
                  className="flex flex-row items-center justify-between"
                >
                  <Text className="mr-3 bp5-text-muted">{key}</Text>
                  <Text className="line-clamp-2">{value}</Text>
                </div>
              );
            })}
          </div>
        </div>
      </Popup>
    );
  }

  return (
    <div ref={chartRef} className={`w-full h-[500px]`}>
      {!!chartWidth && (
        <ReactMapGL
          {...viewState}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        >
          {renderMarkers()}
          {renderLines()}
          {selectedMarker ? renderMarkerPopup() : null}
          <GeolocateControl position={"bottom-right"} />
          <NavigationControl position={"bottom-right"} />
        </ReactMapGL>
      )}
    </div>
  );
}
