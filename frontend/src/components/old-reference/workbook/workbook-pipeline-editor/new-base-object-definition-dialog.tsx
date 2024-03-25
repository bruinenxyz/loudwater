"use client";
import { ObjectDefinition, Workbook } from "@/definitions";
import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core";

export default function NewBaseObjectDefinitionDialog({
  newObjectDefinition,
  setNewObjectDefinition,
  setSelectedObjectDefinition,
  workbook,
  setWorkbook,
}: {
  newObjectDefinition: ObjectDefinition;
  setNewObjectDefinition: (objectDefinition: ObjectDefinition | null) => void;
  setSelectedObjectDefinition: (
    objectDefinition: ObjectDefinition | null,
  ) => void;
  workbook: Workbook;
  setWorkbook: (workbook: Workbook) => void;
}) {
  return (
    <Dialog
      isOpen={true}
      isCloseButtonShown
      title="Change base object definition"
      onClose={() => {
        setNewObjectDefinition(null);
      }}
    >
      <DialogBody>
        <Callout
          intent="warning"
          icon="warning-sign"
          title="Change will reset workbook steps"
        >
          Changing this workbook&apos;s base object definition will cause the
          workbook steps to reset.
          <br />
          <br />
          To add new workbook steps using the new object definition, confirm the
          change below then click the &quot;Pipeline steps&quot; button.
          <br />
          <br />
          To cancel the change, click the &quot;X&quot; in the top right corner
          of this dialog.
        </Callout>
      </DialogBody>
      <DialogFooter
        actions={
          <Button
            intent="danger"
            text="Confirm change"
            onClick={() => {
              setSelectedObjectDefinition(newObjectDefinition);
              setWorkbook({
                ...workbook,
                from: newObjectDefinition.id,
                steps: [],
              });
              setNewObjectDefinition(null);
            }}
          />
        }
      />
    </Dialog>
  );
}
