"use client";
import { HydratedTable } from "@/definitions";
import { Pipeline } from "@/definitions/pipeline";
import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  IconName,
  MenuItem,
  Section,
  Text,
} from "@blueprintjs/core";
import { ItemRenderer, Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import { NewStepSelection } from "../query-builder";
import { useTables } from "@/data/use-tables";
import { useSelectedDatabase } from "@/stores";
import { useEffect, useState } from "react";

interface FromStepProps {
  pipeline: Pipeline;
  setPipeline: (value: Pipeline) => void;
  editStepIndex: number | null;
  setEditStepIndex: (value: number | null) => void;
  newStepType: NewStepSelection | null;
}

export default function FromStepComponent({
  pipeline,
  setPipeline,
  editStepIndex,
  setEditStepIndex,
  newStepType,
}: FromStepProps) {
  const [selectedDatabase, setSelectedDatabase] = useSelectedDatabase();
  const [confirmationToggle, setConfirmationToggle] = useState<boolean>(false);
  const [selected, setSelected] = useState<HydratedTable | null>(null);
  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id);

  useEffect(() => {
    if (tables && pipeline.from) {
      setSelected(tables.find((table) => table.id === pipeline.from) || null);
    }
  }, [tables]);

  const renderTable: ItemRenderer<HydratedTable> = (
    table: HydratedTable,
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        key={table.id}
        roleStructure="listoption"
        icon={
          <SquareIcon
            icon={table.icon as IconName}
            color={table.color}
            size={SquareIconSize.SMALL}
          />
        }
        selected={!!selected && selected.id === table.id}
        shouldDismissPopover={true}
        text={table.name}
        onClick={handleClick}
      />
    );
  };

  function selectTable(table: HydratedTable) {
    if (table.id === selected?.id) {
      setSelected(null);
    } else {
      setSelected(table);
    }
  }

  function renderContent() {
    if (isLoadingTables) {
      return <Loading />;
    } else if (tablesError || !tables) {
      return <ErrorDisplay description={tablesError?.message} />;
    } else {
      const fromTable = tables.find((table) => table.id === pipeline.from);
      if (editStepIndex === -1 || !fromTable) {
        return (
          <div className="flex flex-row items-center">
            <Text className="mr-3 text-xl">From:</Text>
            <Select<HydratedTable>
              items={tables!}
              itemRenderer={renderTable}
              onItemSelect={selectTable}
            >
              <Button
                rightIcon="double-caret-vertical"
                text={
                  selected ? (
                    <div className="flex flex-row items-center">
                      <SquareIcon
                        icon={selected.icon as IconName}
                        color={selected.color}
                        size={SquareIconSize.SMALL}
                      />
                      <Text className="ml-1">{selected.name}</Text>
                    </div>
                  ) : (
                    "Select table"
                  )
                }
              />
            </Select>
          </div>
        );
      } else {
        return (
          <div className="flex flex-row items-center">
            <Text className="text-xl">From:</Text>
            <Button className="ml-2 bg-white border border-bluprint-border-gray">
              <div className="flex flex-row items-center">
                <SquareIcon
                  icon={fromTable.icon as IconName}
                  color={fromTable.color}
                  size={SquareIconSize.SMALL}
                />
                <div className="flex flex-row items-center ml-2">
                  <Text className="text-md">{fromTable.name}</Text>
                </div>
              </div>
            </Button>
          </div>
        );
      }
    }
  }

  function renderConfirmationDialog() {
    return (
      <Dialog
        isOpen={confirmationToggle}
        isCloseButtonShown
        onClose={() => setConfirmationToggle(false)}
        title="Change base table"
      >
        <DialogBody>
          <Callout
            intent="warning"
            icon="warning-sign"
            title="Change will reset pipeline steps"
          >
            Changing this pipeline&apos;s base table will cause the pipeline
            steps to reset.
            <br />
            <br />
            To add new pipeline steps using the new base table, confirm the
            change below.
            <br />
            <br />
            To cancel the change, click the &quot;X&quot; in the top right
            corner of this dialog.
          </Callout>
        </DialogBody>
        <DialogFooter
          actions={
            <Button
              intent="danger"
              text="Confirm change"
              onClick={() => {
                setPipeline({
                  from: selected!.id,
                  steps: [],
                });
                setEditStepIndex(null);
                setConfirmationToggle(false);
              }}
            />
          }
        />
      </Dialog>
    );
  }

  return (
    <>
      <Section
        className="flex-none w-full rounded-sm"
        title={renderContent()}
        rightElement={
          <div className="flex flex-row">
            {editStepIndex === -1 ? (
              <Button
                alignText="left"
                disabled={!selected}
                text="Confirm step"
                onClick={() => {
                  if (
                    pipeline.steps.length > 0 &&
                    selected!.id !== pipeline.from
                  ) {
                    setConfirmationToggle(true);
                  } else {
                    setPipeline({ from: selected!.id, steps: [] });
                    setEditStepIndex(null);
                  }
                }}
              />
            ) : (
              <Button
                alignText="left"
                disabled={editStepIndex !== null || newStepType !== null}
                text="Edit step"
                onClick={() => setEditStepIndex(-1)}
              />
            )}
          </div>
        }
      />
      {renderConfirmationDialog()}
    </>
  );
}
