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
  Text,
  Icon,
} from "@blueprintjs/core";
import React, { useEffect, useState } from "react";
import logo from "@assets/logo.svg";
import darkLogo from "@assets/logo-dark.svg";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { UserProfileButton } from "../components/account-management/user-profile-button";
import { useTables } from "@/data/use-tables";
import DatabaseSelector from "./databases/database-selector";
import { useSelectedDatabase } from "@/stores";
import { useCreateUserQuery, useUserQueries } from "@/data/use-user-query";
import { useRelations } from "@/data/use-relations";
import * as _ from "lodash";
import CreateRelation from "@/components/relation/create-relation";

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

export default function NavigationBar({
  darkMode,
  setDarkMode,
}: NavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedNavigationTab, setSelectedNavigationTab] = useState<
    NavigationTabEnums | undefined
  >();
  const [selectedDatabase, setSelectedDatabase] = useSelectedDatabase();
  const [createRelationToggle, setCreateRelationToggle] =
    useState<boolean>(false);

  const {
    data: tables,
    isLoading: isLoadingTables,
    error: tablesError,
  } = useTables(selectedDatabase.id);

  const {
    data: relations,
    isLoading: isLoadingRelations,
    error: relationsError,
  } = useRelations(selectedDatabase.id);

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
    const useClerk: boolean =
      process.env.NEXT_PUBLIC_USE_AUTH === "true" && !!clerkPubKey && !orgId;

    if (useClerk && clerkPubKey) {
      return <UserProfileButton />;
    }
  }

  return (
    <Card className="flex flex-col h-full pl-1 z-1">
      <Image
        src={darkMode ? darkLogo : logo}
        alt="Bruinen Logo"
        width={110}
        height={110}
        className="pb-2 pl-1 cursor-pointer"
        onClick={() => router.push("/")}
      />
      <div className="flex-1">
        <Menu>
          <DatabaseSelector
            selectedDatabase={selectedDatabase}
            setSelectedDatabase={setSelectedDatabase}
          />
        </Menu>
        {selectedDatabase && (
          <Menu>
            <H5>Tables</H5>
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
            <MenuDivider />
            <H5>Relations</H5>
            <MenuItem
              icon="new-object"
              text="New relation"
              intent="success"
              onClick={() => setCreateRelationToggle(true)}
              popoverProps={{
                usePortal: true,
              }}
            />
            {relations?.map((relation) => {
              const table1 = _.find(tables, { id: relation.table_1_id });
              const table2 = _.find(tables, { id: relation.table_2_id });
              return table1 && table2 ? (
                <MenuItem
                  key={relation.id}
                  text={
                    <>
                      <Text>{`${table1?.name} - ${table2?.name}`}</Text>
                      <Text className="bp5-text-muted" ellipsize>
                        {`${relation.column_1} - ${relation.column_2}`}
                      </Text>
                    </>
                  }
                  // TODO: onClick={() => handlePageChange(`relations/${relation.id}`)}
                />
              ) : null;
            })}
            <CreateRelation
              isOpen={createRelationToggle}
              setIsOpen={setCreateRelationToggle}
            />
            <MenuDivider />
            <H5>Queries</H5>
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
          </Menu>
        )}
      </div>
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
    </Card>
  );
}
