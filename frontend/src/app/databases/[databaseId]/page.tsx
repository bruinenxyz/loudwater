"use client";
import {
  Button,
  IconName,
  Menu,
  MenuItem,
  Popover,
  Section,
  Tab,
  Tabs,
  Tooltip,
  H4,
} from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import SquareIcon, { SquareIconSize } from "@/components/icon/square-icon";
import DatabaseDetails from "./database-details";
import React, { useState } from "react";
import * as _ from "lodash";
import DeleteDatabase from "./delete-database";
import { useDatabase } from "@/data/use-database";
import DatabaseRelations from "./database-relations";

enum DatabaseTabEnum {
  DETAILS = "DETAILS",
  RELATIONS = "RELATIONS",
}

export default function Page({ params }: { params: { databaseId: string } }) {
  const [currentTab, setCurrentTab] = useState<DatabaseTabEnum>(
    DatabaseTabEnum.DETAILS,
  );
  const [deleteDatabaseOpen, setDeleteDatabaseOpen] = useState<boolean>(false);
  //const hasPermissionEditOntology = useUserPermission(ONTOLOGY_EDIT_PERMISSION);

  const {
    data: database,
    isLoading: isLoadingDatabase,
    error: databaseError,
  } = useDatabase(params.databaseId);

  if (isLoadingDatabase) {
    return <Loading />;
  }

  if (databaseError || !database) {
    return (
      <ErrorDisplay
        title="Cannot get database details"
        description={databaseError.message}
      />
    );
  }

  function renderRightElement() {
    return (
      <div className="flex flex-row items-center shrink-0">
        <Tabs
          animate
          selectedTabId={currentTab}
          id="section-tabs"
          key="horizontal"
          renderActiveTabPanelOnly={true}
          onChange={(tabId: DatabaseTabEnum) => setCurrentTab(tabId)}
        >
          <Tab
            id={DatabaseTabEnum.DETAILS}
            title={
              <Button
                className="bp5-minimal"
                icon="application"
                text="Details"
              />
            }
          />
          <Tab
            id={DatabaseTabEnum.RELATIONS}
            title={
              <Button
                className="bp5-minimal"
                icon="one-to-many"
                text="Relations"
              />
            }
          />
        </Tabs>
        <Popover
          placement="bottom-start"
          content={
            <Menu className="flex flex-col">
              <MenuItem
                icon="trash"
                text="Delete database"
                onClick={() => setDeleteDatabaseOpen(true)}
              />
            </Menu>
          }
        >
          <Button
            className="ml-3"
            alignText="left"
            rightIcon="caret-down"
            text="Options"
          />
        </Popover>
      </div>
    );
  }

  function renderObjectContent() {
    switch (currentTab) {
      case DatabaseTabEnum.RELATIONS:
        return <DatabaseRelations database={database!} />;
      case DatabaseTabEnum.DETAILS:
      default:
        return <DatabaseDetails database={database!} />;
    }
  }

  return (
    <Section
      className="flex flex-col max-h-full col-span-2"
      icon={
        <SquareIcon
          icon={"database"}
          color={"gray"}
          size={SquareIconSize.LARGE}
        />
      }
      title={<H4 className="m-0">{database!.name}</H4>}
      subtitle={database?.created_at.toString().split("T")[0]}
      rightElement={renderRightElement()}
    >
      {renderObjectContent()}
      {deleteDatabaseOpen && (
        <DeleteDatabase database={database!} onClose={setDeleteDatabaseOpen} />
      )}
    </Section>
  );
}
