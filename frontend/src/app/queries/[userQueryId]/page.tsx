"use client";
import { Pipeline } from "@/definitions/pipeline";
import { Button, Callout, Drawer, Tab, Tabs } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import QueryBuilder from "@/components/query/query-builder/query-builder";
import QueryEditor from "@/components/query/query-editor";
import { QueryHeader } from "@/components/query/query-header";
import Table from "@/components/table/table";
import OverwriteSQLDialog from "@/components/query/overwrite-sql-dialog";
import {
  useParsePipeline,
  usePipelineSchema,
  useUpdateUserQuery,
  useUserQuery,
  useUserQueryResults,
} from "@/data/use-user-query";
import React, { useEffect, useState } from "react";
import * as _ from "lodash";

interface UserQueryPageProps {
  params: {
    userQueryId: string;
  };
}

enum QueryTabEnum {
  SQL = "sql",
  PIPELINE = "pipeline",
}

const Page: React.FC<UserQueryPageProps> = ({ params: { userQueryId } }) => {
  const [tab, setTab] = useState<QueryTabEnum>(QueryTabEnum.SQL);
  const [drawerToggle, setDrawerToggle] = useState<boolean>(false);
  const [sqlQuery, setSqlQuery] = useState<string>("");
  const [pipeline, setPipeline] = useState<Pipeline>({ from: "", steps: [] });
  const [pipelineSQLDivergence, setPipelineSQLDivergence] =
    useState<boolean>(false);
  const {
    data: userQuery,
    isLoading: isLoadingUserQuery,
    error: userQueryError,
  } = useUserQuery(userQueryId);

  const {
    data: results,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useUserQueryResults(userQueryId, userQuery?.sql);

  const {
    data: pipelineSchema,
    isLoading: isLoadingPipelineSchema,
    error: pipelineSchemaError,
  } = usePipelineSchema(pipeline);

  const { trigger: updateUserQueryTrigger, isMutating: isUpdatingUserQuery } =
    useUpdateUserQuery(userQueryId);

  const { trigger: parsePipelineTrigger, isMutating: isParsingPipeline } =
    useParsePipeline();

  useEffect(() => {
    if (userQuery) {
      setSqlQuery(userQuery?.sql || "");
      if (userQuery.pipeline) {
        setPipeline(userQuery.pipeline);
      }
    }
  }, [userQuery, setSqlQuery, setPipeline]);

  async function handleSaveQuery() {
    if (tab === QueryTabEnum.SQL) {
      await updateUserQueryTrigger({ sql: sqlQuery });
    } else {
      const pipelineSQL = await parsePipelineTrigger(pipeline);
      if (pipelineSQL.sql === sqlQuery) {
        updateUserQueryTrigger({ pipeline: pipeline });
      } else {
        setPipelineSQLDivergence(true);
      }
    }
  }

  if (isLoadingUserQuery || isLoadingPipelineSchema) {
    return <Loading />;
  }

  if (userQueryError || pipelineSchemaError) {
    return (
      <ErrorDisplay
        title="An unexpected error occurred"
        description={userQueryError || pipelineSchemaError}
      />
    );
  }

  let resultsErrorMessage;
  if (resultsError) {
    // If the backend sent back a specific error message, use that instead of the generic error
    if (resultsError && resultsError.response && resultsError.response.data) {
      const errorData = JSON.parse(resultsError.response.data);
      if (errorData.message) {
        resultsErrorMessage = _.capitalize(errorData.message);
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <QueryHeader query={userQuery} />
      <div className="flex flex-row items-center justify-between mb-2">
        <Tabs
          animate
          selectedTabId={tab}
          id="section-tabs"
          key="horizontal"
          renderActiveTabPanelOnly={true}
          onChange={(tabId: QueryTabEnum) => {
            if (tabId === QueryTabEnum.SQL) {
              setDrawerToggle(false);
            }
            setTab(tabId);
          }}
        >
          <Tab
            id={QueryTabEnum.SQL}
            title={<Button className="bp5-minimal" icon="code" text="SQL" />}
          />
          <Tab
            id={QueryTabEnum.PIPELINE}
            title={
              <Button
                className="bp5-minimal"
                icon="form"
                text="Query Builder"
              />
            }
          />
        </Tabs>
        {tab === QueryTabEnum.PIPELINE && (
          <Button
            className="mt-1"
            icon="drawer-left"
            onClick={() => setDrawerToggle(true)}
          >
            Open in drawer
          </Button>
        )}
      </div>
      {tab === QueryTabEnum.SQL ? (
        <QueryEditor value={sqlQuery} onChange={setSqlQuery} />
      ) : (
        <QueryBuilder
          className="overflow-y-auto h-[400px] flex flex-col p-3 gap-y-2"
          pipeline={pipeline}
          setPipeline={setPipeline}
        />
      )}
      <div className="flex flex-row items-center">
        <Button
          className="my-2 mr-2 w-fit "
          loading={isUpdatingUserQuery}
          disabled={
            isLoadingResults ||
            isUpdatingUserQuery ||
            (tab === QueryTabEnum.PIPELINE && !pipelineSchema!.success)
          }
          onClick={handleSaveQuery}
        >
          Save and run
        </Button>
        <OverwriteSQLDialog
          userQueryId={userQueryId}
          pipeline={pipeline}
          isDivergent={pipelineSQLDivergence}
          setIsDivergent={setPipelineSQLDivergence}
        />
      </div>
      <Callout
        className="my-2"
        intent="danger"
        title="Error running query"
        hidden={resultsError === undefined}
      >
        {resultsErrorMessage || resultsError?.message}
      </Callout>
      <Table
        results={results}
        isLoadingResults={isLoadingResults}
        resultsError={undefined}
      />
      <Drawer isOpen={drawerToggle} onClose={() => setDrawerToggle(false)}>
        <QueryBuilder
          className="flex flex-col h-full p-3 overflow-y-auto gap-y-2"
          pipeline={pipeline}
          setPipeline={setPipeline}
        />
      </Drawer>
    </div>
  );
};

export default Page;
