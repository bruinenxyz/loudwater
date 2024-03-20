"use client";
import {
  ObjectDefinition,
  InferredSchemaRelation,
  Pipeline,
  Workbook,
  PartialPipeline,
  PartialWorkbook,
} from "@/definitions";
import { Drawer, IconName, Spinner, SpinnerSize } from "@blueprintjs/core";
import {
  Cell,
  CellRenderer,
  Column,
  ColumnHeaderCell,
  Table2,
  TruncatedFormat,
  TruncatedPopoverMode,
} from "@blueprintjs/table";
import { ErrorDisplay } from "../../error-display";
import SquareIcon, { SquareIconSize } from "../../icon/square-icon";
import { convertToColumns } from "@/utils/convert-to-columns";
import { useObjectDefinitions } from "@/data/use-object-definition";
import { useValidatePipelineAndWorkbook } from "@/data/use-pipeline";
import { useState } from "react";
import * as _ from "lodash";
import { LargeObjectView } from "../object-view";
import { convertToCSV } from "@/utils/csv-converter";

export default function QueryTableView({
  baseObjectDefinition,
  queryResults,
  pipeline,
}: {
  baseObjectDefinition: ObjectDefinition;
  queryResults: any[];
  pipeline: Pipeline | Workbook | PartialPipeline | PartialWorkbook;
}) {
  const [selectedObject, setSelectedObject] = useState<{
    objectDefinitionId: string;
    id: string;
  } | null>(null);

  const {
    data: schema,
    isLoading: isLoadingSchema,
    error: schemaError,
  } = useValidatePipelineAndWorkbook(pipeline);

  const {
    data: objectDefinitions,
    isLoading: isLoadingObjectDefinitions,
    error: objectDefinitionsError,
  } = useObjectDefinitions();

  if (isLoadingSchema || isLoadingObjectDefinitions) {
    return (
      <div className="flex flex-col items-center justify-center mx-3 mt-4">
        <Spinner size={SpinnerSize.STANDARD} />
      </div>
    );
  }

  if (
    pipeline &&
    (schemaError ||
      !schema ||
      !schema.success ||
      objectDefinitionsError ||
      !objectDefinitions)
  ) {
    return (
      <ErrorDisplay
        title="Unexpected error"
        description={
          schemaError ? schemaError.message : objectDefinitionsError.message
        }
      />
    );
  }
  // Query results converted to columns
  const columnData = convertToColumns(queryResults);
  // Finds the base object blueprint's primary key property if it is in the query results
  const baseObjectColumn = _.find(
    _.keys(columnData),
    (key: string) => key === baseObjectDefinition.primary_key_property,
  );
  // Determines if any related object blueprint's primary key property is in the query results and creates an array of those columns
  const relatedObjectColumns = _.filter(_.keys(columnData), (key: string) => {
    if (!key.includes(".")) {
      return false;
    }
    const { property, relatedObjectDefinition } = getPropertyInfo(key);
    if (
      relatedObjectDefinition &&
      relatedObjectDefinition.primary_key_property === property
    ) {
      return true;
    }
    return false;
  });
  // Array containing the base object column (if base blueprint primary key is present) and all related object columns where primary key is present
  const objectColumns: string[] = baseObjectColumn
    ? [baseObjectColumn, ...relatedObjectColumns]
    : [...relatedObjectColumns];

  // Given a property path, returns the property name, relation path, related object definition the property exists on,
  // and the relation used to pull the related object definition into the query results
  function getPropertyInfo(propertyPath: string) {
    const pathArray = propertyPath.split(".");
    const relationPath = _.slice(pathArray, 0, pathArray.length - 1).join(".");
    const property = pathArray[pathArray.length - 1];
    const targetObjDefId = _.find(
      schema?.data.relations,
      (relation: InferredSchemaRelation) => relation.api_path === relationPath,
    )?.object_definition_id;
    const relatedObjectDefinition = _.find(
      objectDefinitions,
      (objectDefinition: ObjectDefinition) =>
        objectDefinition.id === targetObjDefId,
    );
    const relation = _.find(
      schema?.data.relations,
      (relation: InferredSchemaRelation) => relation.api_path === relationPath,
    );
    return { property, relationPath, relatedObjectDefinition, relation };
  }

  const headerCellRenderer = (index: number) => {
    let name = "";
    if (objectColumns.length && index < objectColumns.length) {
      if (!_.includes(objectColumns[index], ".")) {
        // Base object column
        name = baseObjectDefinition.name;
      } else {
        // Related object column
        const { relatedObjectDefinition, relation } = getPropertyInfo(
          objectColumns[index],
        );
        name = relation!.relation_name
          ? relation!.relation_name
          : relatedObjectDefinition!.name;
      }
    } else {
      // Data column
      name = _.keys(columnData)[index - objectColumns.length];
    }
    return <ColumnHeaderCell name={name} index={index} />;
  };

  const genericCellRenderer = (key: string) => {
    const cellRenderer: CellRenderer = (rowIndex: number) => {
      return (
        <Cell>
          <TruncatedFormat
            detectTruncation={true}
            showPopover={TruncatedPopoverMode.WHEN_TRUNCATED}
          >
            {columnData[key][rowIndex]}
          </TruncatedFormat>
        </Cell>
      );
    };
    return cellRenderer;
  };

  const baseObjectCellRenderer = (rowIndex: number) => {
    return (
      <Cell
        interactive
        intent="primary"
        tooltip="View object details"
        style={{
          cursor: "pointer",
        }}
      >
        <div
          className="flex mt-1 align-middle row"
          onClick={() =>
            setSelectedObject({
              objectDefinitionId: baseObjectDefinition.id,
              id: queryResults[rowIndex][
                baseObjectDefinition?.primary_key_property
              ],
            })
          }
        >
          <SquareIcon
            size={SquareIconSize.SMALL}
            color={baseObjectDefinition.color ?? undefined}
            icon={(baseObjectDefinition.icon as IconName) ?? undefined}
          />
          <div className="ml-1">
            <b>
              {baseObjectDefinition.title_property &&
              queryResults[rowIndex][baseObjectDefinition.title_property]
                ? queryResults[rowIndex][baseObjectDefinition.title_property]
                : queryResults[rowIndex][
                    baseObjectDefinition.primary_key_property
                  ]}
            </b>
          </div>
        </div>
      </Cell>
    );
  };

  function relatedObjectCellRenderer(
    relationPath: string,
    primaryKeyProperty: string,
    objectDefinition: ObjectDefinition,
  ) {
    const cellRenderer: CellRenderer = (rowIndex: number) => {
      return (
        <Cell
          interactive
          tooltip="View object details"
          style={{
            cursor: "pointer",
          }}
        >
          <div
            className="flex mt-1 align-middle row"
            onClick={() =>
              setSelectedObject({
                objectDefinitionId: objectDefinition.id,
                id: queryResults[rowIndex][
                  _.join([relationPath, primaryKeyProperty], ".")
                ],
              })
            }
          >
            <SquareIcon
              size={SquareIconSize.SMALL}
              color={objectDefinition.color || "gray"}
              icon={(objectDefinition.icon as IconName) || ("cube" as IconName)}
            />
            <div className="ml-1">
              <b>
                {queryResults[rowIndex][
                  _.join([relationPath, objectDefinition.title_property], ".")
                ]
                  ? queryResults[rowIndex][
                      _.join(
                        [relationPath, objectDefinition.title_property],
                        ".",
                      )
                    ]
                  : queryResults[rowIndex][
                      _.join([relationPath, primaryKeyProperty], ".")
                    ]}
              </b>
            </div>
          </div>
        </Cell>
      );
    };
    return cellRenderer;
  }

  function renderObjectColumns() {
    return [
      ..._.map(objectColumns, (key: string, index: number) => {
        if (!_.includes(key, ".")) {
          return (
            // Base object column
            <Column
              name={baseObjectDefinition.name}
              key={"baseObject"}
              cellRenderer={baseObjectCellRenderer}
              columnHeaderCellRenderer={headerCellRenderer}
            />
          );
        }
        const {
          property: primaryKeyProperty,
          relationPath,
          relatedObjectDefinition,
          relation,
        } = getPropertyInfo(key);
        return (
          // Related object column
          <Column
            key={
              relation!.relation_name
                ? relation!.relation_name
                : relatedObjectDefinition!.name
            }
            name={
              relation!.relation_name
                ? relation!.relation_name
                : relatedObjectDefinition!.name
            }
            cellRenderer={relatedObjectCellRenderer(
              relationPath,
              primaryKeyProperty,
              relatedObjectDefinition!,
            )}
            columnHeaderCellRenderer={headerCellRenderer}
          />
        );
      }),
    ];
  }

  function renderDataColumns() {
    return [
      ..._.map(columnData, (value, key) => {
        return (
          <Column
            key={key}
            name={key}
            cellRenderer={genericCellRenderer(key)}
            columnHeaderCellRenderer={headerCellRenderer}
          />
        );
      }),
    ];
  }

  function renderTable() {
    return (
      <Table2
        className="w-full h-full"
        numRows={queryResults.length}
        defaultRowHeight={30}
        enableGhostCells={true}
      >
        {renderObjectColumns().concat(renderDataColumns())}
      </Table2>
    );
  }

  return (
    <>
      {renderTable()}
      {selectedObject && (
        // Drawer for viewing object details
        <Drawer
          autoFocus
          isOpen={!!selectedObject}
          onClose={() => setSelectedObject(null)}
        >
          <div className="h-full p-2 overflow-y-auto">
            <LargeObjectView
              objectDefinitionId={selectedObject!.objectDefinitionId}
              id={selectedObject!.id}
              drawer={true}
            />
          </div>
        </Drawer>
      )}
    </>
  );
}
