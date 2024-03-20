"use client";
import {
  InferSchemaOutput,
  ObjectDefinition,
  Step,
  PartialWorkbook,
} from "@/definitions";
import {
  Button,
  Text,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  Drawer,
} from "@blueprintjs/core";
import { useState } from "react";
import InvalidStepPopover from "./invalid-step-popover";
import BranchPipelineEditor from "@/components/old-reference/pipeline-step-managers/branch-pipeline/branch-pipeline-editor";
import * as _ from "lodash";

export default function BranchStepManager({
  objectDefinition,
  index,
  firstInvalidStepIndex,
  inputPipeline,
  displayPipeline,
  displaySchema,
  setDisplayPipeline,
  branchSteps,
  setBranchSteps,
}: {
  objectDefinition: ObjectDefinition;
  index: number;
  firstInvalidStepIndex: number | null;
  inputPipeline: PartialWorkbook;
  displayPipeline: PartialWorkbook;
  displaySchema: InferSchemaOutput;
  setDisplayPipeline: (pipeline: PartialWorkbook) => void;
  branchSteps: Step[];
  setBranchSteps: (steps: Step[]) => void;
}) {
  const [editStepsToggle, setEditStepsToggle] = useState<boolean>(false);
  const [saveStepsToggle, setSaveStepsToggle] = useState<boolean>(false);

  return (
    <div className="flex flex-row items-center">
      <Button text="Manage steps" onClick={() => setEditStepsToggle(true)} />
      {!displaySchema.success &&
      firstInvalidStepIndex !== null &&
      firstInvalidStepIndex >= index ? (
        <InvalidStepPopover errors={displaySchema!.error.issues} />
      ) : null}
      <Drawer
        isOpen={editStepsToggle}
        onClose={() => {
          setBranchSteps(
            _.slice(
              displayPipeline.steps,
              index,
              displayPipeline.steps.length,
            ) as Step[],
          );
          setEditStepsToggle(false);
        }}
        canOutsideClickClose={false}
        title={
          <div className="flex flex-row justify-between w-full">
            <Text>Manage display steps</Text>
            <Button
              className="mr-2"
              intent="primary"
              text="Save steps"
              onClick={() => setSaveStepsToggle(true)}
            />
          </div>
        }
      >
        <div className="h-full p-3 overflow-y-auto">
          <BranchPipelineEditor
            objectDefinition={objectDefinition}
            branchSteps={branchSteps}
            setBranchSteps={setBranchSteps}
            inputPipeline={inputPipeline}
          />
        </div>
        <Dialog
          isOpen={saveStepsToggle}
          isCloseButtonShown
          title="Update display steps"
          onClose={() => {
            setSaveStepsToggle(false);
          }}
        >
          <DialogBody>
            <Callout
              intent="warning"
              icon="warning-sign"
              title="Changes to display steps will reset chart configuration"
            >
              <br />
              Changing this Display&apos;s steps will reset your chart
              configuration.
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
                  setSaveStepsToggle(false);
                  setEditStepsToggle(false);
                  setDisplayPipeline({
                    ...inputPipeline,
                    steps: [...inputPipeline.steps, ...branchSteps],
                  });
                }}
              />
            }
          />
        </Dialog>
      </Drawer>
    </div>
  );
}
