import { useField } from "@/utils/use-field";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Divider,
  Callout,
  FormGroup,
  InputGroup,
  Spinner,
  SpinnerSize,
  Text,
} from "@blueprintjs/core";
import { useState } from "react";
import { useSWRConfig } from "swr";
import { useDeleteDatabase } from "@/data/use-database";

export default function DeleteDatabase({ database, onClose }: any) {
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isMutating, trigger: deleteDatabase } = useDeleteDatabase(
    database.id,
  );

  const confirmField = useField<string>("");

  async function submitDelete() {
    setIsOpen(false);
    setIsSubmitting(true);
    await deleteDatabase();
    mutate(`/databases`);
    setIsSubmitting(false);
    onClose(false);
    router.push(`/databases`);
  }

  return (
    <>
      <Dialog isOpen={isSubmitting} title="Deleting database...">
        <DialogBody>
          <Spinner size={SpinnerSize.STANDARD} />
        </DialogBody>
      </Dialog>
      <Dialog
        isOpen={isOpen}
        isCloseButtonShown
        title="Delete database"
        onClose={() => {
          onClose(false);
        }}
      >
        <DialogBody>
          <div className="flex flex-row">
            <Text>Name:</Text>
            <Text className="ml-2 bp5-text-muted">{database.name}</Text>
          </div>
          <Divider className="my-2" />
          <Callout
            intent="warning"
            icon="warning-sign"
            title="Database deletion is permanent"
          />
          <Text className="mt-2 text-center">
            To confirm deletion, please type the database name in the field
            below before clicking submit.
          </Text>
          <FormGroup className="mt-2">
            <InputGroup
              id="confirm-input"
              {...confirmField}
              autoFocus={false}
            />
          </FormGroup>
        </DialogBody>
        <DialogFooter
          actions={
            <Button
              intent="danger"
              text="Delete"
              disabled={confirmField.value !== database.name}
              onClick={() => submitDelete()}
            />
          }
        />
      </Dialog>
    </>
  );
}
