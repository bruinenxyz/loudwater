"use client";
import { CleanDatabase, CreateDatabaseSchema } from "@/definitions";
import { SOURCE_EDIT_PERMISSION } from "@/constants/permissions";
import {
  Button,
  Dialog,
  Text,
  DialogBody,
  Tooltip,
  FormGroup,
  InputGroup,
  Icon,
  DialogFooter,
  Checkbox,
} from "@blueprintjs/core";
import Loading from "../loading";
import { useUserPermission } from "@/hooks/permissions.hook";
import { useCreateDatabase } from "@/data/use-database";
import { useSelectedDatabase } from "@/stores";
import { useState } from "react";
import { useField } from "@/utils/use-field";

export default function AddDatabase({
  mutateDatabases,
  databases,
  isOpen,
  setIsOpen,
  displayButton,
}: {
  mutateDatabases: (databases: CleanDatabase[]) => void;
  databases: CleanDatabase[];
  isOpen: boolean;
  setIsOpen: (toggle: boolean) => void;
  displayButton: boolean;
}) {
  const { trigger: createDatabase, isMutating: isCreatingDatabase } =
    useCreateDatabase();
  const [selectedDatabase, setSelectedDatabase] = useSelectedDatabase();
  const nameField = useField<string>("");
  const urlField = useField<string>("");
  const schemaField = useField<string>("");
  const [requireSsl, setRequireSsl] = useState<boolean>(true);
  const hasPermissionConnectDatabase =
    process.env.NEXT_PUBLIC_USE_AUTH === "true"
      ? useUserPermission(SOURCE_EDIT_PERMISSION)
      : true;

  async function submitDatabase() {
    const databaseConfig = {
      name: nameField.value,
      connection_url: urlField.value,
      schema: schemaField.value || undefined,
      require_ssl: requireSsl,
    };
    const data = CreateDatabaseSchema.parse(databaseConfig);
    const newDatabase = await createDatabase(data);
    mutateDatabases(
      [...databases, newDatabase].sort((a, b) => (a.name <= b.name ? -1 : 1)),
    );
    setSelectedDatabase(data);
    setIsOpen(false);
  }

  function canSubmit() {
    const databaseConfig = {
      name: nameField.value || undefined,
      connection_url: urlField.value || undefined,
      schema: schemaField.value || undefined,
      require_ssl: requireSsl,
    };
    return CreateDatabaseSchema.safeParse(databaseConfig).success;
  }

  function resetFields() {
    nameField.onValueChange("");
    urlField.onValueChange("");
    schemaField.onValueChange("");
    setRequireSsl(true);
  }

  function renderDialogContent() {
    if (isCreatingDatabase) {
      return (
        <div className="flex flex-col items-center justify-center m-3">
          <Loading />
          <Text className="mt-2">Connecting to database...</Text>
        </div>
      );
    } else {
      return (
        <>
          <DialogBody>
            <div className="max-h-[75vh] p-3 overflow-y-auto">
              <div>
                <FormGroup
                  label="Name"
                  labelFor="text-input"
                  labelInfo="(required)"
                >
                  <InputGroup
                    id="text-input"
                    {...nameField}
                    autoFocus={false}
                  />
                </FormGroup>
                <FormGroup
                  label="Postgres URL"
                  labelFor="url-input"
                  labelInfo="(required)"
                >
                  <InputGroup id="url-input" {...urlField} autoFocus={false} />
                </FormGroup>
                <FormGroup
                  label={
                    <div className="flex flex-row items-center">
                      <Text>Schema</Text>
                      <Tooltip content="Optional. Defaults to 'public'">
                        <Icon className="ml-1" icon="small-info-sign" />
                      </Tooltip>
                    </div>
                  }
                  labelFor="schema-input"
                >
                  <InputGroup
                    id="schema-input"
                    {...schemaField}
                    autoFocus={false}
                  />
                </FormGroup>

                <div className="flex flex-row">
                  <FormGroup label="Require SSL" />
                  <Checkbox
                    className="m-0 ml-2"
                    inline
                    checked={requireSsl}
                    onChange={(e) => setRequireSsl(e.target.checked)}
                  />
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter
            actions={
              <Button
                intent="primary"
                text="Connect Database"
                disabled={!canSubmit()}
                onClick={submitDatabase}
              />
            }
          />
        </>
      );
    }
  }

  return (
    <div className="max-h-full">
      {displayButton && (
        <Tooltip
          disabled={hasPermissionConnectDatabase}
          content={"You do not have permission to connect new databases"}
        >
          <Button
            disabled={!hasPermissionConnectDatabase}
            onClick={() => setIsOpen(true)}
          >
            New database
          </Button>
        </Tooltip>
      )}
      <Dialog
        isOpen={isOpen}
        isCloseButtonShown
        title="Connect a new PostgreSQL database"
        className="max-h-[90vh]"
        onClose={() => {
          resetFields();
          setIsOpen(false);
        }}
      >
        {renderDialogContent()}
      </Dialog>
    </div>
  );
}
