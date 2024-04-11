"use client";
import {
  Card,
  SwitchCard,
  FormGroup,
  H5,
  Menu,
  MenuItem,
  MenuDivider,
  IconName,
  Icon,
  Collapse,
} from "@blueprintjs/core";
import logo from "@assets/logo.svg";
import darkLogo from "@assets/logo-dark.svg";
import Image from "next/image";
import DatabaseSelector from "./databases/database-selector";
import { usePathname, useRouter } from "next/navigation";
import { UserProfileButton } from "../components/account-management/user-profile-button";
import { useTables } from "@/data/use-tables";
import { useSelectedDatabase } from "@/stores";
import { useCreateUserQuery, useUserQueries } from "@/data/use-user-query";
import { useDarkModeContext } from "@/components/context/dark-mode-context";
import React, { useEffect, useState } from "react";
import * as _ from "lodash";

export enum NavigationTabEnums {
  SOURCES = "sources",
  ONTOLOGY = "ontology",
  VIEW_TABLES = "tables",
  VIEW_QUERIES = "queries",
}

export type NavigationBarProps = {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
};

export default function NavigationBar({}) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedNavigationTab, setSelectedNavigationTab] = useState<
    NavigationTabEnums | undefined
  >();
  const [selectedDatabase, setSelectedDatabase] = useSelectedDatabase();
  const [selectedSchema, setSelectedSchema] = useState<string | undefined>(
    undefined,
  );
  const { darkMode, setDarkMode } = useDarkModeContext();
  const [tablesToggle, setTablesToggle] = useState<boolean>(true);
  const [queriesToggle, setQueriesToggle] = useState<boolean>(true);

  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id, selectedSchema);

  const handlePageChange = (id: string) => {
    router.push(`/${id}`);
  };
  const { trigger: triggerNewQuery, isMutating: isLoadingNewQuery } =
    useCreateUserQuery();

  const handleNewQuery = async () => {
    const newUserQuery = await triggerNewQuery();
    handlePageChange(`queries/${newUserQuery.id}`);
  };

  const {
    data: userQueries,
    isLoading,
    error,
  } = useUserQueries(selectedDatabase.id);

  useEffect(() => {
    if (pathname.includes(NavigationTabEnums.SOURCES)) {
      setSelectedNavigationTab(NavigationTabEnums.SOURCES);
    } else if (pathname.includes(NavigationTabEnums.VIEW_TABLES)) {
      setSelectedNavigationTab(NavigationTabEnums.VIEW_TABLES);
    } else if (pathname.includes(NavigationTabEnums.VIEW_QUERIES)) {
      setSelectedNavigationTab(NavigationTabEnums.VIEW_QUERIES);
    }
  }, [pathname]);

  function renderClerkProfile() {
    const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const orgId = process.env.NEXT_PUBLIC_ORGANIZATION_ID;
    const useClerk: boolean = process.env.NEXT_PUBLIC_USE_AUTH === "true";

    if (useClerk && clerkPubKey) {
      return <UserProfileButton />;
    }
  }

  return (
    <Card className="flex flex-col h-full pl-1 pr-2 z-1">
      <Image
        src={darkMode ? darkLogo : logo}
        alt="Bruinen Logo"
        width={110}
        height={110}
        className="pb-2 pl-1 cursor-pointer"
        onClick={() => router.push("/")}
      />
      <div className="flex-none">
        <Menu>
          <DatabaseSelector
            selectedDatabase={selectedDatabase}
            setSelectedDatabase={setSelectedDatabase}
            selectedSchema={selectedSchema}
            setSelectedSchema={setSelectedSchema}
          />
        </Menu>
      </div>
      <div className="flex-1 w-full my-1 overflow-x-hidden overflow-y-auto">
        {selectedDatabase && (
          <Menu>
            <div
              className="flex flex-row items-center gap-1 mb-1 cursor-default"
              onClick={() => setTablesToggle(!tablesToggle)}
            >
              <H5 className="mb-0">Tables</H5>
              <Icon
                icon={tablesToggle ? "chevron-down" : "chevron-right"}
                color="gray"
              />
            </div>
            <Collapse isOpen={tablesToggle} keepChildrenMounted={true}>
              {tables?.map((table) => (
                <MenuItem
                  key={table.id}
                  text={table.name}
                  icon={
                    <Icon icon={table.icon as IconName} color={table.color} />
                  }
                  onClick={() => handlePageChange(`tables/${table.id}`)}
                />
              ))}
            </Collapse>
            <MenuDivider />
            <div
              className="flex flex-row items-center gap-1 mt-2 mb-1 cursor-default"
              onClick={() => setQueriesToggle(!queriesToggle)}
            >
              <H5 className="mb-0">Queries</H5>
              <Icon
                icon={queriesToggle ? "chevron-down" : "chevron-right"}
                color="gray"
              />
            </div>
            <Collapse isOpen={queriesToggle} keepChildrenMounted={true}>
              <>
                <MenuItem
                  icon="new-object"
                  text="New query"
                  intent="success"
                  onClick={handleNewQuery}
                  popoverProps={{
                    usePortal: true,
                  }}
                />
                {userQueries?.map((query) => (
                  <MenuItem
                    key={query.id}
                    text={query.name}
                    onClick={() => handlePageChange(`queries/${query.id}`)}
                  />
                ))}
              </>
            </Collapse>
          </Menu>
        )}
      </div>
      <div className="flex flex-col flex-none">
        {renderClerkProfile() ? <UserProfileButton /> : null}
        <FormGroup className="p-2 mb-0">
          <SwitchCard
            onChange={() => setDarkMode(!darkMode)}
            checked={darkMode}
            compact
            showAsSelectedWhenChecked={false}
            className="border-none outline-none"
          >
            Dark mode
          </SwitchCard>
        </FormGroup>
      </div>
    </Card>
  );
}
