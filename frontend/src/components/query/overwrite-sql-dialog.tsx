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
import { PipelineSQLDivergence } from "@/app/queries/[userQueryId]/page";
import { useUpdateUserQuery } from "@/data/use-user-query";
import Loading from "@/app/loading";

interface OverwriteSQLDialogProps {
  userQueryId: string;
  pipeline: Pipeline;
  divergence: PipelineSQLDivergence | null;
  setDivergence: (value: PipelineSQLDivergence | null) => void;
}

export default function OverwriteSQLDialog({
  userQueryId,
  pipeline,
  divergence,
  setDivergence,
}: OverwriteSQLDialogProps) {
  const { trigger: updateUserQueryTrigger, isMutating: isUpdatingUserQuery } =
    useUpdateUserQuery(userQueryId);

  async function handleConfirm() {
    await updateUserQueryTrigger({ pipeline: pipeline });
    setDivergence(null);
  }

  return (
    <Dialog
      isOpen={!!divergence}
      isCloseButtonShown
      title={"Saving this pipeline will overwrite SQL"}
      onClose={() => {
        setDivergence(null);
      }}
    >
      {isUpdatingUserQuery ? (
        <div className="flex flex-col items-center">
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
