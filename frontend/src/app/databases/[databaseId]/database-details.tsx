"use client";
import {
  Button,
  Divider,
  H6,
  Icon,
  IconName,
  InputGroup,
  MenuItem,
  Popover,
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
import { useDatabaseSchemas, useUpdateDatabase } from "@/data/use-database";
import { useTables } from "@/data/use-tables";
import { getFormattedDateStrings } from "@/utils/value-format";

const DatabaseDetails = ({ database }: { database: CleanDatabase }) => {
  const [editDetails, setEditDetails] = useState<boolean>(false);
  const nameField = useField<string>(database.name);

  const { trigger: updateDatabase, isMutating } = useUpdateDatabase(
    database.id,
  );

  const {
    data: schemas,
    isLoading: isLoadingSchemas,
    error: schemasError,
  } = useDatabaseSchemas(database.id);

  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(database.id);

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
    const { localString, utcString } = getFormattedDateStrings(
      database.created_at,
    );
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
        <Divider />
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex flex-row justify-between">
            <Text>Name</Text>
            <Text className="ml-2 bp5-text-muted">{database.name}</Text>
          </div>
          <div className="flex flex-row justify-between">
            <Text>External name</Text>
            <Text className="ml-2 bp5-text-muted">
              {database.external_name}
            </Text>
          </div>
          <div className="flex flex-row justify-between">
            <Text>Added on</Text>
            <Popover
              content={
                <div className="p-1">
                  <Text className=" bp5-text-muted">{utcString}</Text>
                </div>
              }
              interactionKind="hover"
              placement="top"
            >
              <Text className="ml-2 bp5-text-muted cursor-help">
                {localString}
              </Text>
            </Popover>
          </div>
          <Divider />
          <div className="flex flex-row justify-between">
            <Text>Schema count</Text>
            <Text className="ml-2 bp5-text-muted">
              {_.keys(schemas).length}
            </Text>
          </div>
          <div className="flex flex-row justify-between">
            <Text>Table count</Text>
            <Text className="ml-2 bp5-text-muted">{tables!.length}</Text>
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

  if (isLoadingSchemas || isLoadingTables) {
    return <Loading />;
  }

  if (schemasError || tablesError) {
    return <ErrorDisplay description={schemasError.message} />;
  }

  return (
    <div className="flex flex-col h-full p-3 overflow-y-auto">
      {editDetails ? renderEditableDetails() : renderDatabaseDetails()}
    </div>
  );
};

export default DatabaseDetails;
