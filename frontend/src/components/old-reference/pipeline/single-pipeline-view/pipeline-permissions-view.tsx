"use client";
import { OrgRole, Pipeline, PipelineScopeEnum } from "@/definitions";
import {
  Button,
  Card,
  CardList,
  Divider,
  H6,
  Icon,
  InputGroup,
  NonIdealState,
  Tag,
  Text,
  Tooltip,
} from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import UserPermissionsCard from "@/components/old-reference/pipeline-workbook-permissions/user-permissions-card";
import PipelinePermissionsEditor from "./pipeline-permissions-editor";
import { useAuth, useOrganization } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import * as _ from "lodash";

export default function PipelinePermissionsView({
  pipeline,
}: {
  pipeline: Pipeline;
}) {
  // States
  const [isEditingPermissions, setIsEditingPermissions] =
    useState<boolean>(false);
  const [addedUsers, setAddedUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState<string>("");
  const [searchResult, setSearchResult] = useState<any[]>([]);

  // Hooks
  const { userId, orgRole, isLoaded: isUserLoaded } = useAuth();
  const { memberships, isLoaded: isMembershipLoaded } = useOrganization({
    memberships: {
      infinite: true,
      keepPreviousData: true,
    },
  });

  useEffect(() => {
    if (memberships && memberships.data && addedUsers.length === 0) {
      const allAddedUsers = _.filter(memberships.data, (member: any) => {
        return (
          pipeline.permissions.read.includes(member.publicUserData.userId) ||
          pipeline.permissions.update.includes(member.publicUserData.userId) ||
          pipeline.permissions.delete.includes(member.publicUserData.userId) ||
          member.publicUserData.userId === pipeline.creator_id
        );
      });
      setSearchResult(allAddedUsers);
      setAddedUsers(allAddedUsers);
    }
  }, [memberships]);

  useEffect(() => {
    if (memberships && memberships.data) {
      const allAddedUsers = _.filter(memberships.data, (member: any) => {
        return (
          pipeline.permissions.read.includes(member.publicUserData.userId) ||
          pipeline.permissions.update.includes(member.publicUserData.userId) ||
          pipeline.permissions.delete.includes(member.publicUserData.userId) ||
          member.publicUserData.userId === pipeline.creator_id
        );
      });
      setSearchResult(allAddedUsers);
      setUserSearch("");
      setAddedUsers(allAddedUsers);
    }
  }, [pipeline]);

  if (!isUserLoaded || !isMembershipLoaded) {
    return <Loading />;
  }

  if (!memberships || !memberships.data) {
    return <ErrorDisplay title="Unexpected error" />;
  }

  if (memberships.data.length === 0) {
    return <Loading />;
  }

  const hasPermissionEditPipelinePermissions =
    pipeline.creator_id === userId ||
    (pipeline.scope === PipelineScopeEnum.ORGANIZATION &&
      orgRole === OrgRole.ADMIN);

  function searchUsers(search: string) {
    if (search === "") {
      setSearchResult(addedUsers);
    } else {
      const result = _.filter(addedUsers, (member: any) => {
        return (
          _.includes(
            member.publicUserData.firstName.toLowerCase(),
            search.toLowerCase(),
          ) ||
          _.includes(
            member.publicUserData.lastName.toLowerCase(),
            search.toLowerCase(),
          ) ||
          _.includes(
            member.publicUserData.identifier.toLowerCase(),
            search.toLowerCase(),
          )
        );
      });
      setSearchResult(result);
    }
  }

  function renderCreatorAndScope() {
    const creator = _.find(
      memberships!.data,
      (member: any) => member.publicUserData.userId === pipeline.creator_id,
    );

    return (
      <>
        <div className="flex flex-row items-center justify-between ">
          <H6 className="mb-0 whitespace-nowrap">Pipeline Scope</H6>
          <Tooltip
            content={
              pipeline.scope === PipelineScopeEnum.ORGANIZATION
                ? "This pipeline can be viewed by all members of your organization. Update and delete permissions are granted on a per user basis."
                : "Read, update, and delete permissions for this pipeline are granted on a per user basis."
            }
          >
            <Tag
              className="cursor-help"
              icon={
                pipeline.scope === PipelineScopeEnum.ORGANIZATION
                  ? "office"
                  : "user"
              }
            >
              {pipeline.scope === PipelineScopeEnum.ORGANIZATION
                ? "Organization"
                : "Private"}
            </Tag>
          </Tooltip>
        </div>
        <div className="flex flex-row items-center justify-between mt-3">
          <H6 className="mb-0 whitespace-nowrap">Pipeline Creator</H6>
          {!creator ? (
            <Card className="flex flex-row items-center p-2">
              <Icon icon="user" size={35} />
              <Text className="ml-2 font-bold">Unkown User</Text>
            </Card>
          ) : (
            <UserPermissionsCard interactive={false} user={creator} />
          )}
        </div>
      </>
    );
  }

  function renderSearchResults() {
    if (addedUsers.length === 0) {
      return (
        <NonIdealState
          title="No users"
          description="You haven&rsquo;t granted permissions to any users yet."
          icon="error"
          action={
            <Button
              disabled={!hasPermissionEditPipelinePermissions}
              onClick={() => setIsEditingPermissions(true)}
            >
              Grant permissions
            </Button>
          }
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
    }

    return (
      <CardList>
        {_.map(searchResult, (member: any) => {
          const isCreator =
            member.publicUserData.userId === pipeline.creator_id;
          if (isCreator) {
            return (
              <UserPermissionsCard
                interactive={false}
                user={member}
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
              interactive={false}
              user={member}
              rightElement={
                <div className="flex flex-row items-center gap-1">
                  {_.includes(
                    pipeline.permissions.read,
                    member.publicUserData.userId,
                  ) && <Tag>Read</Tag>}
                  {_.includes(
                    pipeline.permissions.update,
                    member.publicUserData.userId,
                  ) && <Tag>Update</Tag>}
                  {_.includes(
                    pipeline.permissions.delete,
                    member.publicUserData.userId,
                  ) && <Tag>Delete</Tag>}
                </div>
              }
            />
          );
        })}
      </CardList>
    );
  }

  function renderPermissions() {
    return (
      <>
        <div className="flex flex-row items-center justify-between mb-2">
          {hasPermissionEditPipelinePermissions ? (
            <>
              <H6 className="mb-0">Pipeline Permissions</H6>
              <Button
                small
                minimal
                icon="edit"
                text="Edit"
                onClick={() => setIsEditingPermissions(true)}
              />
            </>
          ) : (
            <H6 className="my-1">Pipeline Permissions</H6>
          )}
        </div>
        <InputGroup
          value={userSearch}
          leftElement={
            <div className="flex items-center px-2 gap-x-2 !m-0 h-[32px]">
              <Icon icon="search" color="#6b7280" />
            </div>
          }
          placeholder="Search added users"
          fill
          onChange={(e) => {
            const search = e.target.value;
            setUserSearch(search);
            searchUsers(search);
          }}
        />
        <div className="flex flex-col h-[calc(100%-221px)] min-h-[125px] mt-2 overlfow-y-auto">
          {renderSearchResults()}
        </div>
      </>
    );
  }

  return (
    <>
      {renderCreatorAndScope()}
      <Divider className="my-3" />
      {renderPermissions()}
      {isEditingPermissions && (
        <PipelinePermissionsEditor
          pipeline={pipeline}
          setIsEditingPermissions={setIsEditingPermissions}
          addedUsers={addedUsers}
          memberships={memberships.data}
        />
      )}
    </>
  );
}
