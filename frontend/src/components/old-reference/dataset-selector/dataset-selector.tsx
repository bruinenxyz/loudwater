"use client";
import Loading from "@/app/loading";
import { useDatasets } from "@/data/use-dataset";
import { Dataset } from "@/definitions";
import { Button, MenuItem } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import { ErrorDisplay } from "../../error-display";

export default function DatasetSelector({
  className,
  selectedDataset,
  selectDataset,
}: {
  className?: string;
  selectedDataset: Dataset | null;
  selectDataset: (dataset: Dataset) => void;
}) {
  const { data: datasets, isLoading: isLoadingDatasets, error } = useDatasets();

  // @ts-ignore
  const renderDataset = (dataset: Dataset, { handleClick, modifiers }) => {
    return (
      <MenuItem
        key={dataset.id}
        label={dataset.id}
        onClick={handleClick}
        active={modifiers.active}
        selected={selectedDataset?.id === dataset.id}
        roleStructure="listoption"
        text={`${dataset.name} - ${dataset.source_name}`}
      />
    );
  };

  if (isLoadingDatasets) {
    return <Loading />;
  }

  if (error || !datasets) {
    return (
      <ErrorDisplay title="Unexpected error" description={error?.message} />
    );
  }

  return (
    <Select<Dataset>
      className={className}
      items={datasets}
      itemRenderer={renderDataset}
      onItemSelect={(item) => selectDataset(item)}
      filterable={false}
      popoverProps={{ minimal: true, matchTargetWidth: true }}
      noResults={
        <MenuItem
          disabled={true}
          text="Add a dataset first."
          roleStructure="listoption"
        />
      }
    >
      <Button
        className={className}
        text={
          selectedDataset
            ? `${selectedDataset.name} - ${selectedDataset.source_name}`
            : "Select a dataset"
        }
        rightIcon="double-caret-vertical"
        placeholder="Select a dataset"
      />
    </Select>
  );
}
