"useClient";
import {
  Button,
  Checkbox,
  DialogBody,
  DialogFooter,
  H6,
  Icon,
  Popover,
  Text,
} from "@blueprintjs/core";
import UserPermissionsCard from "./user-permissions-card";
import { useState } from "react";

export default function AddUserPermissions({
  userToAdd,
  setUserToAdd,
  readUsers,
  setReadUsers,
  updateUsers,
  setUpdateUsers,
  deleteUsers,
  setDeleteUsers,
  tempAddedUsers,
  setTempAddedUsers,
}: {
  userToAdd: any;
  setUserToAdd: (value: any | null) => void;
  readUsers: string[];
  setReadUsers: (value: string[]) => void;
  updateUsers: string[];
  setUpdateUsers: (value: string[]) => void;
  deleteUsers: string[];
  setDeleteUsers: (value: string[]) => void;
  tempAddedUsers: any[];
  setTempAddedUsers: (value: any[]) => void;
}) {
  const [readAccess, setReadAccess] = useState<boolean>(true);
  const [updateAccess, setUpdateAccess] = useState<boolean>(false);
  const [deleteAccess, setDeleteAccess] = useState<boolean>(false);

  function addUserToPipelinePermissions() {
    if (readAccess) {
      setReadUsers([...readUsers, userToAdd.publicUserData.userId]);
    }
    if (updateAccess) {
      setUpdateUsers([...updateUsers, userToAdd.publicUserData.userId]);
    }
    if (deleteAccess) {
      setDeleteUsers([...deleteUsers, userToAdd.publicUserData.userId]);
    }
    setTempAddedUsers([...tempAddedUsers, userToAdd]);
    setUserToAdd(null);
  }

  function changeReadAccess(value: boolean) {
    if (value) {
      setReadAccess(true);
    } else {
      setReadAccess(false);
      setUpdateAccess(false);
      setDeleteAccess(false);
    }
  }

  function changeUpdateAccess(value: boolean) {
    if (value) {
      setReadAccess(true);
      setUpdateAccess(true);
    } else {
      setUpdateAccess(false);
    }
  }

  function changeDeleteAccess(value: boolean) {
    if (value) {
      setReadAccess(true);
      setDeleteAccess(true);
    } else {
      setDeleteAccess(false);
    }
  }

  return (
    <>
      <DialogBody className="h-full">
        <Button
          minimal
          icon="arrow-left"
          text="Back to list"
          onClick={() => setUserToAdd(null)}
        />
        <div className="flex flex-col px-2 mt-3">
          <div className="flex flex-row items-center ">
            <H6>Add user:</H6>
            <UserPermissionsCard
              className="ml-4"
              interactive={false}
              user={userToAdd}
            />
          </div>
          <div className="flex flex-row items-start mt-4">
            <H6>Permissions:</H6>
            <div className="flex flex-col gap-2 ml-4">
              <Checkbox
                className="m-0"
                inline
                checked={readAccess}
                onChange={(e) => changeReadAccess(e.target.checked)}
                label="Read"
              />
              <div className="flex flex-row">
                <Checkbox
                  className="m-0"
                  inline
                  checked={updateAccess}
                  onChange={(e) => changeUpdateAccess(e.target.checked)}
                  label="Update"
                />
                <Popover
                  placement="right"
                  interactionKind="hover"
                  content={
                    <div className="p-2">
                      <Text>
                        Granting update access automatically grants read access
                        as well
                      </Text>
                    </div>
                  }
                >
                  <Icon className="cursor-help" icon="small-info-sign" />
                </Popover>
              </div>
              <div className="flex flex-row">
                <Checkbox
                  className="m-0"
                  inline
                  checked={deleteAccess}
                  onChange={(e) => changeDeleteAccess(e.target.checked)}
                  label="Delete"
                />
                <Popover
                  placement="right"
                  interactionKind="hover"
                  content={
                    <div className="p-2">
                      <Text>
                        Granting delete access automatically grants read access
                        as well
                      </Text>
                    </div>
                  }
                >
                  <Icon className="cursor-help" icon="small-info-sign" />
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogFooter
        actions={
          <Button
            intent="primary"
            text="Add user"
            disabled={readAccess === false}
            onClick={() => addUserToPipelinePermissions()}
          />
        }
      />
    </>
  );
}
