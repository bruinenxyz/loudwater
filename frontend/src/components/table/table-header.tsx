import { HydratedTable, UpdateTableSchema } from "@/definitions";
import SquareIcon, { SquareIconSize } from "../icon/square-icon";
import {
  CompoundTag,
  Divider,
  EditableText,
  Button,
  IconName,
} from "@blueprintjs/core";
import { useUpdateTable } from "@/data/use-tables";
import { AppToaster } from "../toaster/toaster";
import { useClipboard } from "use-clipboard-copy";
import EditTable from "@/components/table/edit-table";
import { useState } from "react";

export function TableHeader({ table }: { table: HydratedTable }) {
  const { trigger: updateTable } = useUpdateTable();

  const clipboard = useClipboard();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleTagClick = async () => {
    clipboard.copy(table?.external_name);
    const toaster = await AppToaster;
    toaster.show({
      message: `Copied ${table?.external_name} to clipboard`,
      icon: "clipboard",
    });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center justify-center">
          <SquareIcon
            icon={table!.icon as IconName}
            color={table!.color}
            size={SquareIconSize.LARGE}
            className="mr-2 align-middle"
          />
          <div>
            <EditableText
              className="m-0 text-base font-semibold"
              defaultValue={table!.name}
              placeholder="Add a name..."
              onConfirm={async (value) => {
                if (!value.trim()) {
                  return;
                }
                const updateData = UpdateTableSchema.parse({
                  name: value,
                });
                await updateTable({ id: table!.id, update: updateData });
              }}
            />
            <EditableText
              className="m-0 line-clamp-2"
              defaultValue={table!.description}
              placeholder="Add a description..."
              onConfirm={async (value) => {
                const updateData = UpdateTableSchema.parse({
                  description: value,
                });
                await updateTable({ id: table!.id, update: updateData });
              }}
            />
          </div>
        </div>
        <div>
          <CompoundTag
            className="mx-2"
            interactive={true}
            onClick={handleTagClick}
            leftContent={"table"}
            minimal={true}
          >
            {table!.external_name}
          </CompoundTag>
          <Button onClick={() => setIsOpen(true)}>Edit</Button>
          <EditTable table={table!} isOpen={isOpen} setIsOpen={setIsOpen} />
        </div>
      </div>
      <Divider className="my-2" />
    </>
  );
}
