"use client";
import {
  Button,
  Divider,
  H6,
  Icon,
  IconName,
  InputGroup,
  MenuItem,
  Text,
  TextArea,
} from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import ColorPicker from "@/components/color-picker";
import IconPicker from "@/components/icon-picker";
import { useState } from "react";
import { useField } from "@/utils/use-field";
import * as _ from "lodash";
import { CleanDatabase, UpdateDatabaseSchema } from "@/definitions";
import { useUpdateDatabase } from "@/data/use-database";

const DatabaseDetails = ({ database }: { database: CleanDatabase }) => {
  const [editDetails, setEditDetails] = useState<boolean>(false);
  const nameField = useField<string>(database.name);

  const { trigger: updateDatabase, isMutating } = useUpdateDatabase(
    database.id,
  );

  function resetFields() {
    nameField.onValueChange(database.name);
  }

  function isValidDatabaseUpdate() {
    const result = UpdateDatabaseSchema.safeParse({
      name: !nameField.value ? undefined : nameField.value,
    });
    return result.success;
  }

  async function handleUpdateDatabase() {
    const pendingUpdate = {
      name: nameField.value,
    };
    const parsedUpdate = UpdateDatabaseSchema.parse(pendingUpdate);
    await updateDatabase(parsedUpdate);
    setEditDetails(false);
  }

  function renderDatabaseDetails() {
    return (
      <>
        <div className="flex flex-row items-center justify-between mb-2">
          <H6 className="mb-0">Database Details</H6>
          <Button
            small
            minimal
            icon="edit"
            text="Edit"
            onClick={() => setEditDetails(true)}
          />
        </div>
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex flex-row justify-between">
            <Text>Name</Text>
            <Text className="ml-2 bp5-text-muted">{database.name}</Text>
          </div>
        </div>
      </>
    );
  }

  function renderEditableDetails() {
    return (
      <>
        <H6 className="my-1">Database Details</H6>
        {isMutating ? (
          <Loading />
        ) : (
          <div className="flex flex-col gap-3 mt-2">
            <div className="flex flex-row items-center justify-between">
              <Text>Name</Text>
              <InputGroup id="name-input" {...nameField} />
            </div>
            <div className="flex flex-row items-center justify-end gap-2">
              <Button
                small
                outlined
                icon="cross"
                intent="danger"
                text="Cancel"
                onClick={() => {
                  setEditDetails(false);
                  resetFields();
                }}
              />
              <Button
                small
                icon="tick"
                intent="primary"
                text="Save"
                disabled={!isValidDatabaseUpdate()}
                onClick={handleUpdateDatabase}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full p-3 overflow-y-auto">
      {editDetails ? renderEditableDetails() : renderDatabaseDetails()}
    </div>
  );
};

export default DatabaseDetails;
