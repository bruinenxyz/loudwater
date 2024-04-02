"use client";
import { Pipeline } from "@/definitions/pipeline";
import { Button, Callout, Divider, Drawer, Tab, Tabs } from "@blueprintjs/core";
import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import QueryHeader from "@/components/query/query-header";
import QueryBuilder from "@/components/query/query-builder/query-builder";
import QueryEditor from "@/components/query/query-editor";
import QueryParameters, {
  Parameter,
} from "@/components/query/query-parameters";
import Table from "@/components/table/table";
import OverwriteSQLDialog from "@/components/query/overwrite-sql-dialog";
import {
  useParsePipeline,
  usePipelineSchema,
  useUpdateUserQuery,
  useUserQuery,
  useUserQueryResults,
} from "@/data/use-user-query";
import { convertToCSV } from "@/utils/csv-converter";
import { toSnakeCase } from "@/utils/strings";
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
  const [sqlQuery, setSqlQuery] = useState<string>("");
  const [pipeline, setPipeline] = useState<Pipeline>({ from: "", steps: [] });
  const [pipelineSQLDivergence, setPipelineSQLDivergence] =
    useState<boolean>(false);
  const {
    data: userQuery,
    isLoading: isLoadingUserQuery,
    error: userQueryError,
  } = useUserQuery(userQueryId);
  // TODO: likely want to refactor this to account for stages changes vs saved changes
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [savedParameters, setSavedParameters] = useState<Parameter[]>([]);

  useEffect(() => {
    setSqlQuery(userQuery?.sql || "");
    setParameters(userQuery?.parameters || []);
  }, [userQuery, setSqlQuery, setParameters]);

  const {
    data: results,
    isLoading: isLoadingResults,
    error: resultsError,
  } = useUserQueryResults(userQueryId, userQuery?.sql, savedParameters);

  const {
    data: pipelineSchema,
    isLoading: isLoadingPipelineSchema,
    error: pipelineSchemaError,
  } = usePipelineSchema(pipeline);

  const handleDownloadCSV = () => {
    const csvData = convertToCSV(results.rows);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = toSnakeCase(userQuery?.name) + ".csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

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
    setSavedParameters(parameters);
    if (tab === QueryTabEnum.SQL) {
      await updateUserQueryTrigger({ sql: sqlQuery, parameters: parameters });
    } else {
      const pipelineSQL = await parsePipelineTrigger(pipeline);
      if (pipelineSQL.sql === sqlQuery) {
        updateUserQueryTrigger({ pipeline: pipeline, parameters: parameters });
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
      <div className="flex flex-row flex-1 overflow-auto ">
        <div className="flex flex-col w-1/2 h-full px-1 pb-[1px]">
          <Divider className="mt-2 mb-0" />
          <div className="flex flex-row items-center justify-between mt-1 mb-2">
            <Tabs
              animate
              selectedTabId={tab}
              id="section-tabs"
              key="horizontal"
              renderActiveTabPanelOnly={true}
              onChange={(tabId: QueryTabEnum) => setTab(tabId)}
            >
              <Tab
                id={QueryTabEnum.SQL}
                title={
                  <Button className="bp5-minimal" icon="code" text="SQL" />
                }
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
            <div className="flex flex-row items-center">
              <Button
                className="mt-1 mr-1 w-fit"
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
          </div>
          {tab === QueryTabEnum.SQL ? (
            <>
              <QueryParameters
                parameters={parameters}
                setParameters={setParameters}
              />
              <QueryEditor value={sqlQuery} onChange={setSqlQuery} />
            </>
          ) : (
            <QueryBuilder
              className="flex flex-col h-full p-2 overflow-y-auto gap-y-2"
              pipeline={pipeline}
              setPipeline={setPipeline}
            />
          )}
        </div>
        <div className="flex flex-col w-1/2 pr-1 pt-2 pb-[1px]">
          <Callout
            className="mb-2"
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
        </div>
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
      <div className="flex flex-row justify-between items-center">
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
        <Button
          className="my-2 w-fit"
          disabled={isLoadingResults || isUpdatingUserQuery}
          onClick={handleDownloadCSV}
        >
          Download as CSV
        </Button>
        <OverwriteSQLDialog
          userQueryId={userQueryId}
          pipeline={pipeline}
          isDivergent={pipelineSQLDivergence}
          setIsDivergent={setPipelineSQLDivergence}
        />
      </div>
    </div>
  );
};

export default Page;
