"use client";
import {
  Button,
  Card,
  Checkbox,
  DialogBody,
  DialogFooter,
  H6,
  Icon,
  Popover,
  Tag,
  Text,
} from "@blueprintjs/core";
import Image from "next/image";
import { useState } from "react";
import * as _ from "lodash";
import UserPermissionsCard from "./user-permissions-card";

export default function EditUserPermissions({
  userToEdit,
  setUserToEdit,
  readUsers,
  setReadUsers,
  updateUsers,
  setUpdateUsers,
  deleteUsers,
  setDeleteUsers,
  tempAddedUsers,
  setTempAddedUsers,
}: {
  userToEdit: any;
  setUserToEdit: (value: any | null) => void;
  readUsers: string[];
  setReadUsers: (value: string[]) => void;
  updateUsers: string[];
  setUpdateUsers: (value: string[]) => void;
  deleteUsers: string[];
  setDeleteUsers: (value: string[]) => void;
  tempAddedUsers: any[];
  setTempAddedUsers: (value: any[]) => void;
}) {
  const [readAccess, setReadAccess] = useState<boolean>(
    _.includes(readUsers, userToEdit.publicUserData.userId),
  );
  const [updateAccess, setUpdateAccess] = useState<boolean>(
    _.includes(updateUsers, userToEdit.publicUserData.userId),
  );
  const [deleteAccess, setDeleteAccess] = useState<boolean>(
    _.includes(deleteUsers, userToEdit.publicUserData.userId),
  );

  // TODO: Fix this
  function changeUserPipelinePermissions() {
    if (readAccess) {
      // If readAccess is granted and the user is not already in the readUsers array, add them
      if (!_.includes(readUsers, userToEdit.publicUserData.userId)) {
        setReadUsers([...readUsers, userToEdit.publicUserData.userId]);
      }
    } else {
      // If readAccess is revoked and the user is in the readUsers array, remove them
      setReadUsers(
        _.filter(
          readUsers,
          (userId) => userId !== userToEdit.publicUserData.userId,
        ),
      );
    }

    if (updateAccess) {
      // If updateAccess is granted and the user is not already in the updateUsers array, add them
      if (!_.includes(updateUsers, userToEdit.publicUserData.userId)) {
        setUpdateUsers([...updateUsers, userToEdit.publicUserData.userId]);
      }
    } else {
      // If updateAccess is revoked and the user is in the updateUsers array, remove them
      setUpdateUsers(
        _.filter(
          updateUsers,
          (userId) => userId !== userToEdit.publicUserData.userId,
        ),
      );
    }

    if (deleteAccess) {
      // If deleteAccess is granted and the user is not already in the deleteUsers array, add them
      if (!_.includes(deleteUsers, userToEdit.publicUserData.userId)) {
        setDeleteUsers([...deleteUsers, userToEdit.publicUserData.userId]);
      }
    } else {
      // If deleteAccess is revoked and the user is in the deleteUsers array, remove them
      setDeleteUsers(
        _.filter(
          deleteUsers,
          (userId) => userId !== userToEdit.publicUserData.userId,
        ),
      );
    }

    // Return to the list of permissioned users
    setUserToEdit(null);
  }

  function revokeAllPermissions() {
    // Remove the user from all permission arrays
    setReadUsers(
      _.filter(
        readUsers,
        (userId) => userId !== userToEdit.publicUserData.userId,
      ),
    );
    setUpdateUsers(
      _.filter(
        updateUsers,
        (userId) => userId !== userToEdit.publicUserData.userId,
      ),
    );
    setDeleteUsers(
      _.filter(
        deleteUsers,
        (userId) => userId !== userToEdit.publicUserData.userId,
      ),
    );
    setTempAddedUsers(
      _.filter(
        tempAddedUsers,
        (user) =>
          user.publicUserData.userId !== userToEdit.publicUserData.userId,
      ),
    );

    // Return to the list of permissioned users
    setUserToEdit(null);
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
          onClick={() => setUserToEdit(null)}
        />
        <div className="flex flex-col px-2 mt-3">
          <div className="flex flex-row items-center ">
            <H6>Editing permissions for:</H6>
            <UserPermissionsCard
              className="ml-4"
              interactive={false}
              user={userToEdit}
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
          <div>
            <Button
              outlined
              intent="danger"
              text="Revoke all permissions"
              onClick={() => revokeAllPermissions()}
            />
            <Button
              intent="primary"
              text="Update permissions"
              disabled={!readAccess}
              onClick={() => changeUserPipelinePermissions()}
            />
          </div>
        }
      />
    </>
  );
}
