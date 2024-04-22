import {
  Button,
  HotkeyProps,
  HotkeysTarget2,
  InputGroup,
  Menu,
  MenuDivider,
  MenuItem,
  NumericInput,
  Popover,
} from "@blueprintjs/core";
import { DatePicker3 } from "@blueprintjs/datetime2";
import React, { useEffect, useState } from "react";
import * as _ from "lodash";

interface Props {
  columnType: string;
  cellData: string | boolean | number | null;
  onConfirm: (value: string | boolean | number | null) => void;
  columnEnumValues: string[];
}

const EditableInnerCell: React.FC<Props> = (props) => {
  const { columnType, cellData, onConfirm, columnEnumValues } = props;

  const [editingCell, setEditingCell] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<
    string | boolean | number | null
  >(cellData);

  // Whenever the selected value changes, we should close out the modal if we're using an enum or boolean
  // This is because we don't need to confirm/deny the change with enter/esc
  useEffect(() => {
    if (columnType === "enum" || columnType === "boolean") {
      if (cellData !== selectedValue) {
        onConfirm(selectedValue);
      }
      setEditingCell(false);
    }
  }, [selectedValue, columnType, cellData, onConfirm]);

  useEffect(() => {
    setSelectedValue(cellData);
  }, [cellData]);

  const hotkeys: HotkeyProps[] = [
    {
      combo: "enter",
      allowInInput: true,
      group: "Cell Editing",
      label: "Save",
      disabled: !editingCell,
      onKeyDown: () => {
        // Update the backend if the value has changed
        if (selectedValue !== cellData) {
          onConfirm(selectedValue);
        }
        setEditingCell(false);
      },
    },
    {
      combo: "esc",
      allowInInput: true,
      group: "Cell Editing",
      label: "Cancel",
      disabled: !editingCell,
      onKeyDown: () => {
        setSelectedValue(cellData);
        setEditingCell(false);
      },
    },
  ];

  // Formats an ISO string of format "YYYY-MM-DDTHH:mm:ss.sssZ" to "YYYY-MM-DD"
  function ISOtoDate(inputDate: string): string {
    return inputDate.split("T")[0];
  }

  // Formats an ISO string of format "YYYY-MM-DDTHH:mm:ss.sssZ" to "YYYY-MM-DDTHH:mm:ss.sss"
  function ISOtoDatetime(inputDate: string): string {
    // Does not include milliseconds
    return inputDate.split(".")[0];
  }

  // Formats a date or datetime string to "YYYY-MM-DDTHH:mm:ss.sssZ"
  function dateToISO(dateString: string): string | null {
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      return null;
    }
  }

  function renderCellEditor() {
    switch (columnType) {
      // TODO make the focus and mouse up/down work for menu and enum
      case "enum":
        return (
          <div tabIndex={0}>
            <Menu>
              {_.map(columnEnumValues, (value) => (
                <MenuItem
                  text={value}
                  active={selectedValue === value}
                  shouldDismissPopover={false}
                  onClick={() => {
                    setSelectedValue(value);
                  }}
                />
              ))}
              <MenuDivider />
              <MenuItem
                text="NULL"
                active={selectedValue === null}
                shouldDismissPopover={false}
                onClick={() => {
                  setSelectedValue(null);
                }}
                tabIndex={0}
                autoFocus={true}
              />
            </Menu>
          </div>
        );
      case "boolean":
        return (
          <div tabIndex={0}>
            <Menu tabIndex={0}>
              <MenuItem
                text="true"
                active={selectedValue === true}
                shouldDismissPopover={false}
                onClick={() => {
                  setSelectedValue(true);
                }}
              />
              <MenuItem
                text="false"
                active={selectedValue === false}
                shouldDismissPopover={false}
                onClick={() => {
                  setSelectedValue(false);
                }}
              />
              <MenuDivider />
              <MenuItem
                text="NULL"
                active={selectedValue === null}
                shouldDismissPopover={false}
                onClick={() => {
                  setSelectedValue(null);
                }}
                tabIndex={0}
                autoFocus={true}
              />
            </Menu>
          </div>
        );
      case "number":
        return (
          <div className="flex gap-1" tabIndex={0}>
            <NumericInput
              autoFocus={true}
              allowNumericCharactersOnly={true}
              value={selectedValue !== null ? (selectedValue as number) : ""}
              onValueChange={(newValue: number) => setSelectedValue(newValue)}
              // autoFocus={true}
              // tabIndex={0}
            />
            <Button
              text="Set to NULL"
              onClick={() => {
                setSelectedValue(null);
              }}
              tabIndex={0}
            />
          </div>
        );
      case "float":
        return (
          <div className="flex gap-1" tabIndex={0}>
            <NumericInput
              autoFocus={true}
              value={selectedValue !== null ? (selectedValue as number) : ""}
              onValueChange={(newValue: number) => setSelectedValue(newValue)}
            />
            <Button
              text="Set to NULL"
              onClick={() => {
                setSelectedValue(null);
              }}
              tabIndex={0}
            />
          </div>
        );
      case "date":
        return (
          <div className="flex gap-1" tabIndex={0}>
            <InputGroup
              type="date"
              value={
                selectedValue !== null ? ISOtoDate(selectedValue as string) : ""
              }
              onValueChange={(newValue: string) => {
                const newISO = dateToISO(newValue);
                if (newISO !== null) {
                  setSelectedValue(newISO);
                } else {
                  setSelectedValue(null);
                }
              }}
            />
            <Button
              text="NULL"
              onClick={() => {
                setSelectedValue(null);
              }}
              autoFocus={true}
              tabIndex={0}
            />
          </div>
        );
      case "datetime":
        // TODO we will likely need to deal with timezones here
        // TODO why does this not work
        return (
          <div className="flex gap-1" tabIndex={0}>
            <InputGroup
              type="datetime-local"
              value={
                selectedValue !== null
                  ? ISOtoDatetime(selectedValue as string)
                  : ""
              }
              onValueChange={(newValue: string) => {
                const newISO = dateToISO(newValue);
                if (newISO !== null) {
                  setSelectedValue(newISO);
                } else {
                  setSelectedValue(null);
                }
              }}
            />
            <Button
              text="NULL"
              onClick={() => {
                setSelectedValue(null);
              }}
              autoFocus={true}
              tabIndex={0}
            />
          </div>
        );
      case "string":
      default:
        return (
          <div className="flex gap-1">
            <InputGroup
              id="value-input"
              value={selectedValue !== null ? (selectedValue as string) : ""}
              onValueChange={(newValue: string) => {
                setSelectedValue(newValue);
              }}
              autoFocus={true}
            />
            <Button
              text="NULL"
              onClick={() => {
                setSelectedValue(null);
              }}
              tabIndex={0}
            />
          </div>
        );
    }
  }

  return (
    <HotkeysTarget2 hotkeys={hotkeys}>
      {({ handleKeyDown, handleKeyUp }) => (
        <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
          <Popover
            className={"w-full h-full"}
            isOpen={editingCell}
            content={renderCellEditor()}
            placement="bottom-start"
            onInteraction={(nextOpenState, e) => {
              if (!nextOpenState) {
                // Check if the event was initiated by a child of the popover
                setSelectedValue(cellData);
                setEditingCell(false);
              }
            }}
            shouldReturnFocusOnClose={true}
          >
            <div
              className={
                cellData !== null
                  ? "w-full h-full"
                  : "w-full h-full bp5-text-disabled"
              }
              onDoubleClick={() => setEditingCell(true)}
            >
              {cellData !== null ? _.toString(cellData) : "NULL"}
            </div>
          </Popover>
        </div>
      )}
    </HotkeysTarget2>
  );
};

export default EditableInnerCell;
