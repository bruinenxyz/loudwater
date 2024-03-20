"use client";
import { ObjectDefinition, PartialWorkbook, Workbook } from "@/definitions";
import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core";
import * as _ from "lodash";

export default function NewBaseObjectDefinitionDialog({
  newObjectDefinition,
  setPipeline,
  setAddStepToggle,
  setIsEditing,
}: {
  newObjectDefinition: ObjectDefinition;
  setPipeline: (pipeline: Workbook | PartialWorkbook) => void;
  setAddStepToggle: (toggle: boolean) => void;
  setIsEditing: (toggle: boolean) => void;
}) {
  return (
    <Dialog
      isOpen={true}
      isCloseButtonShown
      title="Change base blueprint"
      onClose={() => {
        setAddStepToggle(false);
      }}
    >
      <DialogBody>
        <Callout
          intent="warning"
          icon="warning-sign"
          title="Change will reset pipeline steps"
        >
          Changing this pipeline&apos;s base blueprint will cause the pipeline
          steps to reset.
          <br />
          <br />
          To add new pipeline steps using the new blueprint, confirm the change
          below.
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
              setAddStepToggle(false);
              setPipeline({
                from: newObjectDefinition.id,
                steps: [],
              });
              setIsEditing(false);
            }}
          />
        }
      />
    </Dialog>
  );
}
