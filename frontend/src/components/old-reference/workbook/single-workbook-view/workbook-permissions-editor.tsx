"use client";
import { Workbook, WorkbookPermissionsSchema } from "@/definitions";
import {
  Button,
  CardList,
  Dialog,
  DialogBody,
  DialogFooter,
  H6,
  Icon,
  InputGroup,
  NonIdealState,
  Tab,
  Tabs,
  Tag,
  Text,
} from "@blueprintjs/core";
import Loading from "@/app/loading";
import UserPermissionsCard from "@/components/old-reference/pipeline-workbook-permissions/user-permissions-card";
import AddUserPermissions from "@/components/old-reference/pipeline-workbook-permissions/add-user-permissions";
import EditUserPermissions from "@/components/old-reference/pipeline-workbook-permissions/edit-user-permissions";
import { useEffect, useState } from "react";
import { useUpdateWorkbookPermissions } from "@/data/use-workbook";
import * as _ from "lodash";

export enum EditPermissionsTabEnum {
  ADD = "ADD",
  EDIT = "EDIT",
}

export default function WorkbookPermissionsEditor({
  workbook,
  setIsEditingPermissions,
  addedUsers,
  memberships,
}: {
  workbook: Workbook;
  setIsEditingPermissions: (value: boolean) => void;
  addedUsers: any[];
  memberships: any[];
}) {
  const [tempAddedUsers, setTempAddedUsers] = useState<any[]>([...addedUsers]);
  const [userSearch, setUserSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any[]>([...memberships]);
  const [currentSectionTab, setCurrentSectionTab] =
    useState<EditPermissionsTabEnum>(EditPermissionsTabEnum.ADD);
  const [userToAdd, setUserToAdd] = useState<any | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [readUsers, setReadUsers] = useState<string[]>(
    workbook.permissions.read,
  );
  const [updateUsers, setUpdateUsers] = useState<string[]>(
    workbook.permissions.update,
  );
  const [deleteUsers, setDeleteUsers] = useState<string[]>(
    workbook.permissions.delete,
  );
  const { trigger: updatePermissions, isMutating } =
    useUpdateWorkbookPermissions(workbook.id);

  useEffect(() => {
    if (currentSectionTab === EditPermissionsTabEnum.EDIT) {
      setSearchResult([...tempAddedUsers]);
    }
  }, [tempAddedUsers]);

  function isValidPermissionsUpdate() {
    // Check that all users with update permissions also have read permissions
    _.forEach(updateUsers, (userId: string) => {
      if (!_.includes(readUsers, userId)) {
        return false;
      }
    });

    // Check that all users with delete permissions also have read permissions
    _.forEach(deleteUsers, (userId: string) => {
      if (!_.includes(readUsers, userId)) {
        return false;
      }
    });

    // Check that the permissions are valid for the schema
    const result = WorkbookPermissionsSchema.safeParse({
      read: readUsers,
      update: updateUsers,
      delete: deleteUsers,
    });
    return result.success;
  }

  async function updateWorkbookPermissions() {
    const pendingPermissions = {
      read: readUsers,
      update: updateUsers,
      delete: deleteUsers,
    };
    const parsedPermissions =
      WorkbookPermissionsSchema.parse(pendingPermissions);
    await updatePermissions(parsedPermissions);
    setIsEditingPermissions(false);
  }

  function changeTab(tabId: EditPermissionsTabEnum) {
    setUserSearch("");
    setUserToAdd(null);
    setUserToEdit(null);
    if (tabId === EditPermissionsTabEnum.ADD) {
      setSearchResult(memberships);
    } else {
      setSearchResult(tempAddedUsers);
    }
    setCurrentSectionTab(tabId);
  }

  function searchUsers(search: string) {
    const result = _.filter(
      currentSectionTab === EditPermissionsTabEnum.ADD
        ? memberships
        : tempAddedUsers,
      (member: any) => {
        return (
          _.includes(
            member.publicUserData.firstName.toLowerCase() +
              " " +
              member.publicUserData.identifier.toLowerCase(),
            search.toLowerCase(),
          ) ||
          _.includes(
            member.publicUserData.lastName.toLowerCase(),
            search.toLowerCase(),
          )
        );
      },
    );
    switch (currentSectionTab) {
      case EditPermissionsTabEnum.ADD:
        if (search === "") {
          setSearchResult(memberships);
        } else {
          setSearchResult(result);
        }
        break;
      case EditPermissionsTabEnum.EDIT:
        if (search === "") {
          setSearchResult(tempAddedUsers);
        } else {
          setSearchResult(result);
        }
        break;
    }
  }

  function renderDialogTitle() {
    return (
      <div className="flex flex-row items-center">
        <H6 className="w-fit">Manage workbook permissions</H6>
        {!isMutating && (
          <Tabs
            animate
            selectedTabId={currentSectionTab}
            id="section-tabs"
            key="horizontal"
            className="mr-3"
            renderActiveTabPanelOnly={true}
            onChange={(tabId: EditPermissionsTabEnum) => changeTab(tabId)}
          >
            <Tab
              id={EditPermissionsTabEnum.ADD}
              title={
                <Button className="bp5-minimal" icon="add" text="Add users" />
              }
            />
            <Tab
              id={EditPermissionsTabEnum.EDIT}
              title={
                <Button
                  className="bp5-minimal"
                  icon="edit"
                  text="Edit user permissions"
                />
              }
            />
          </Tabs>
        )}
      </div>
    );
  }

  function renderAddResults() {
    if (searchResult.length === 0) {
      return (
        <NonIdealState
          title="No results"
          description="We couldn't find any users that match your query"
          icon="error"
        />
      );
    } else {
      return (
        <CardList>
          {_.map(
            userSearch === "" ? memberships : searchResult,
            (member: any) => {
              const isAlreadyAdded = _.find(
                tempAddedUsers,
                (user) =>
                  user.publicUserData.userId === member.publicUserData.userId,
              );
              const isCreator =
                member.publicUserData.userId === workbook.creator_id;
              if (isAlreadyAdded || isCreator) {
                return (
                  <UserPermissionsCard
                    interactive={false}
                    user={member}
                    className="bg-bluprint-border-gray"
                    rightElement={
                      <Tag>
                        {isCreator ? "Workbook creator" : "User already added"}
                      </Tag>
                    }
                  />
                );
              }
              return (
                <UserPermissionsCard
                  interactive={true}
                  user={member}
                  onClick={() => setUserToAdd(member)}
                />
              );
            },
          )}
        </CardList>
      );
    }
  }

  function renderEditResults() {
    if (tempAddedUsers.length === 0) {
      return (
        <NonIdealState
          title="No users"
          description="You haven&rsquo;t granted permissions to any users yet."
          icon="error"
        />
      );
    } else if (searchResult.length === 0) {
      return (
        <NonIdealState
          title="No results"
          description="We couldn't find any permissioned users that match your query"
          icon="error"
        />
      );
    } else {
      return (
        <CardList>
          {_.map(searchResult, (member: any) => {
            const isCreator =
              member.publicUserData.userId === workbook.creator_id;
            if (isCreator) {
              return (
                <UserPermissionsCard
                  interactive={false}
                  user={member}
                  className="bg-bluprint-border-gray"
                  rightElement={
                    <div className="flex flex-row items-center gap-1">
                      <Tag>Read</Tag>
                      <Tag>Update</Tag>
                      <Tag>Delete</Tag>
                    </div>
                  }
                />
              );
            }
            return (
              <UserPermissionsCard
                interactive={true}
                user={member}
                onClick={() => setUserToEdit(member)}
                rightElement={
                  <div className="flex flex-row items-center gap-1">
                    {_.includes(readUsers, member.publicUserData.userId) && (
                      <Tag>Read</Tag>
                    )}
                    {_.includes(updateUsers, member.publicUserData.userId) && (
                      <Tag>Update</Tag>
                    )}
                    {_.includes(deleteUsers, member.publicUserData.userId) && (
                      <Tag>Delete</Tag>
                    )}
                  </div>
                }
              />
            );
          })}
        </CardList>
      );
    }
  }

  function renderDialogBody() {
    if (userToAdd !== null) {
      return (
        <AddUserPermissions
          userToAdd={userToAdd}
          setUserToAdd={setUserToAdd}
          readUsers={readUsers}
          setReadUsers={setReadUsers}
          updateUsers={updateUsers}
          setUpdateUsers={setUpdateUsers}
          deleteUsers={deleteUsers}
          setDeleteUsers={setDeleteUsers}
          tempAddedUsers={tempAddedUsers}
          setTempAddedUsers={setTempAddedUsers}
        />
      );
    }

    if (userToEdit !== null) {
      return (
        <EditUserPermissions
          userToEdit={userToEdit}
          setUserToEdit={setUserToEdit}
          readUsers={readUsers}
          setReadUsers={setReadUsers}
          updateUsers={updateUsers}
          setUpdateUsers={setUpdateUsers}
          deleteUsers={deleteUsers}
          setDeleteUsers={setDeleteUsers}
          tempAddedUsers={tempAddedUsers}
          setTempAddedUsers={setTempAddedUsers}
        />
      );
    }

    return (
      <DialogBody className="h-full">
        <InputGroup
          value={userSearch}
          leftElement={
            <div className="flex items-center px-2 gap-x-2 !m-0 h-[32px]">
              <Icon icon="search" color="#6b7280" />
            </div>
          }
          placeholder={
            currentSectionTab === EditPermissionsTabEnum.ADD
              ? "Search for users"
              : "Search for permissioned users"
          }
          fill
          onChange={(e) => {
            const search = e.target.value;
            setUserSearch(search);
            searchUsers(search);
          }}
        />
        <div
          className="px-1 pt-2 pb-1 overflow-y-auto"
          style={{ height: "calc(100% - 30px)" }}
        >
          {currentSectionTab === EditPermissionsTabEnum.ADD
            ? renderAddResults()
            : renderEditResults()}
        </div>
      </DialogBody>
    );
  }

  function renderDialogFooter() {
    if (userToAdd === null && userToEdit === null) {
      return (
        <DialogFooter
          actions={
            <Button
              intent="primary"
              text="Save changes"
              disabled={!isValidPermissionsUpdate()}
              onClick={() => updateWorkbookPermissions()}
            />
          }
        />
      );
    }
  }

  function renderDialogContent() {
    if (isMutating) {
      return (
        <div className="flex flex-col items-center justify-center m-3">
          <Loading />
          <Text className="mt-2">Updating permissions...</Text>
        </div>
      );
    }
    return (
      <>
        {renderDialogBody()}
        {renderDialogFooter()}
      </>
    );
  }

  return (
    <Dialog
      className="w-1/2"
      style={{ height: "80vh" }}
      isOpen={true}
      onClose={() => {
        setIsEditingPermissions(false);
      }}
      title={renderDialogTitle()}
    >
      {renderDialogContent()}
    </Dialog>
  );
}
