"use client";
import { Pipeline } from "@/definitions";
import {
  Button,
  Callout,
  Dialog,
  DialogBody,
  DialogFooter,
  Text,
} from "@blueprintjs/core";
import { useUpdateUserQuery } from "@/data/use-user-query";
import Loading from "@/app/loading";

interface OverwriteSQLDialogProps {
  userQueryId: string;
  pipeline: Pipeline;
  isDivergent: boolean;
  setIsDivergent: (value: boolean) => void;
}

export default function OverwriteSQLDialog({
  userQueryId,
  pipeline,
  isDivergent,
  setIsDivergent,
}: OverwriteSQLDialogProps) {
  const { trigger: updateUserQueryTrigger, isMutating: isUpdatingUserQuery } =
    useUpdateUserQuery(userQueryId);

  async function handleConfirm() {
    await updateUserQueryTrigger({ pipeline: pipeline });
    setIsDivergent(false);
  }

  return (
    <Dialog
      isOpen={isDivergent}
      isCloseButtonShown
      title={"Saving this pipeline will overwrite SQL"}
      onClose={() => {
        setIsDivergent(false);
      }}
    >
      {isUpdatingUserQuery ? (
        <div className="flex flex-col items-center my-2">
          <Loading />
          <Text>Updating query...</Text>
        </div>
      ) : (
        <>
          <DialogBody>
            <Callout
              intent="warning"
              icon="warning-sign"
              title="The pipeline and SQL are out of sync"
            >
              Saving the pipeline created in the query builder will overwrite
              the existing SQL associated with this query.
              <br />
              <br />
              To confirm, click the &quot;Confirm save&quot; button.
              <br />
              <br />
              To cancel, click the &quot;X&quot; in the top right corner of this
              dialog.
            </Callout>
          </DialogBody>
          <DialogFooter
            actions={
              <Button
                intent="primary"
                text="Confirm save"
                onClick={handleConfirm}
              />
            }
          />
        </>
      )}
    </Dialog>
  );
}
