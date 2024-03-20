import Loading from "@/app/loading";
import { ErrorDisplay } from "@/components/error-display";
import { QuerySummaryComponent } from "@/components/old-reference/query-summary";
import {
  usePipelineSummary,
  useValidatePipelineAndWorkbook,
} from "@/data/use-pipeline";
import { Section, SectionCard } from "@blueprintjs/core";
import { Pipeline, PartialPipeline } from "@/definitions/pipeline";
import { Text } from "@blueprintjs/core";

export type PipelineDetailsSectionProps = {
  pipelineId: string;
  pipeline: Pipeline | PartialPipeline;
};

export const PipelineDetailsSection: React.FC<PipelineDetailsSectionProps> = ({
  pipelineId,
  pipeline,
}) => {
  const { data, isLoading, error } = usePipelineSummary(pipelineId);
  const { data: schema, error: schemaError } =
    useValidatePipelineAndWorkbook(pipeline);
  const pipelineError =
    schemaError || (!schema?.success && schema?.error.issues[0]);

  const renderDetails = () => {
    if (error || pipelineError) {
      return (
        <ErrorDisplay
          title="Cannot load Pipeline details"
          description={
            pipelineError ? (
              <div>
                <Text>The pipeline is invalid.</Text>
                <Text>{pipelineError.message}</Text>
              </div>
            ) : (
              error.message
            )
          }
        />
      );
    }

    if (isLoading || !data) {
      return <Loading />;
    }

    return (
      <SectionCard className="overflow-auto">
        <QuerySummaryComponent querySummary={data} />
      </SectionCard>
    );
  };

  return (
    <Section elevation={0} title="Details" className="flex flex-col">
      {renderDetails()}
    </Section>
  );
};
