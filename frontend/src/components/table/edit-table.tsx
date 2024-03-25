import Loading from "@/app/loading";
import ColorPicker from "@/components/color-picker";
import IconPicker from "@/components/icon-picker";
import { useUpdateTable } from "@/data/use-tables";
import { HydratedTable, UpdateTableSchema } from "@/definitions";
import { useField } from "@/utils/use-field";
import {
  Button,
  Dialog,
  DialogBody,
  IconName,
  MenuItem,
  Text,
} from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import _ from "lodash";

export default function EditTable({
  table,
  isOpen,
  setIsOpen,
}: {
  table: HydratedTable;
  isOpen: boolean;
  setIsOpen: (toggle: boolean) => void;
}) {
  const { trigger: updateTable, isMutating: isUpdatingTable } =
    useUpdateTable();

  const primaryKeyField = useField<string | null>(
    table.configuration.primary_key ?? null,
  );
  const titlePropertyField = useField<string | null>(
    table.configuration.title_property ?? null,
  );
  const iconField = useField<IconName>((table.icon as IconName) ?? "cube");
  const colorField = useField<string>(table.color ?? "gray");

  async function handleUpdateTable() {
    let configurationUpdate = {};
    if (primaryKeyField.value) {
      configurationUpdate = {
        primary_key: primaryKeyField.value,
      };
    }
    if (titlePropertyField.value) {
      configurationUpdate = {
        ...configurationUpdate,
        title_property: titlePropertyField.value,
      };
    }

    const tableUpdate = {
      icon: iconField.value,
      color: colorField.value,
      configuration: configurationUpdate,
    };
    const parsedTableUpdate = UpdateTableSchema.parse(tableUpdate);
    await updateTable({ id: table.id, update: parsedTableUpdate });
    setIsOpen(false);
  }

  const renderObjectProperty = (
    item: any,
    // @ts-ignore
    { handleClick, modifiers },
  ) => {
    return (
      <MenuItem
        selected={item === primaryKeyField.value}
        key={item}
        onClick={handleClick}
        text={`${item}`}
      />
    );
  };

  function renderDialogContent() {
    if (isUpdatingTable) {
      return (
        <div className="flex flex-col items-center justify-center m-3">
          <Loading />
          <Text className="mt-2">Updating table...</Text>
        </div>
      );
    } else {
      return (
        <>
          <DialogBody>
            <div className="flex flex-col gap-3">
              <div className="flex flex-row items-center justify-between">
                <Text>Primary key</Text>
                <Select
                  items={_.map(table.external_columns, "name") || []}
                  itemRenderer={renderObjectProperty}
                  onItemSelect={primaryKeyField.onValueChange}
                  filterable={false}
                  popoverProps={{ minimal: true }}
                  noResults={
                    <MenuItem
                      disabled={true}
                      text="Select a Primary Key"
                      roleStructure="listoption"
                    />
                  }
                >
                  <Button
                    fill
                    text={
                      primaryKeyField.value
                        ? `${primaryKeyField.value}`
                        : "Select a primary key"
                    }
                    rightIcon="double-caret-vertical"
                  />
                </Select>
              </div>
              <div className="flex flex-row items-center justify-between">
                <Text>Title property</Text>
                <Select
                  items={_.map(table.external_columns, "name") || []}
                  itemRenderer={renderObjectProperty}
                  onItemSelect={titlePropertyField.onValueChange}
                  filterable={false}
                  popoverProps={{ minimal: true }}
                  noResults={
                    <MenuItem
                      disabled={true}
                      text="Select a title property"
                      roleStructure="listoption"
                    />
                  }
                >
                  <Button
                    fill
                    text={
                      titlePropertyField.value
                        ? `${titlePropertyField.value}`
                        : "Select a title property"
                    }
                    rightIcon="double-caret-vertical"
                  />
                </Select>
              </div>
              <div className="flex flex-row items-center justify-between">
                <Text>Icon</Text>
                <IconPicker {...iconField} />
              </div>
              <div className="flex flex-row items-center justify-between">
                <Text>Color</Text>
                <ColorPicker {...colorField} />
              </div>
              <div className="flex flex-row items-center justify-end gap-2">
                <Button
                  outlined
                  icon="cross"
                  text="Cancel"
                  onClick={() => {
                    setIsOpen(false);
                  }}
                />
                <Button
                  icon="tick"
                  intent="primary"
                  text="Save"
                  onClick={handleUpdateTable}
                />
              </div>
            </div>
          </DialogBody>
        </>
      );
    }
  }

  return (
    <div className="max-h-full">
      <Dialog
        isOpen={isOpen}
        isCloseButtonShown
        title={`Edit table ${table.name}`}
        className="max-h-[90vh]"
        onClose={() => {
          setIsOpen(false);
        }}
        enforceFocus={false}
      >
        {renderDialogContent()}
      </Dialog>
    </div>
  );
}
