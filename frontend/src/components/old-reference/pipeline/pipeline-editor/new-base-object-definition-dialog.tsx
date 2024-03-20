"use client";
import { ObjectDefinition } from "@/definitions";
import { Pipeline } from "@/definitions/pipeline";
import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
} from "@blueprintjs/core";
import _ from "lodash";

export default function NewBaseObjectDefinitionDialog({
  newObjectDefinition,
  setNewObjectDefinition,
  setSelectedObjectDefinition,
  pipeline,
  setPipeline,
}: {
  newObjectDefinition: ObjectDefinition;
  setNewObjectDefinition: (objectDefinition: ObjectDefinition | null) => void;
  setSelectedObjectDefinition: (
    objectDefinition: ObjectDefinition | null,
  ) => void;
  pipeline: Pipeline;
  setPipeline: (pipeline: Pipeline) => void;
}) {
  return (
    <Dialog
      isOpen={true}
      isCloseButtonShown
      title="Change base blueprint"
      onClose={() => {
        setNewObjectDefinition(null);
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
          below then click the &quot;Pipeline steps&quot; button.
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
              setPipeline({
                ...pipeline,
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
