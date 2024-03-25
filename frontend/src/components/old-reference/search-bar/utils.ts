import { ISearchFilterState } from "@/stores/utils/search-filter";
import { IconName } from "@blueprintjs/core";

export type FilterTag = {
  title: string;
  icon: IconName;
  color: string;
};

export type SearchFilterValue = {
  collection: string;
  query_by: string[];
};

export const getSearchQueryStringParam = () => {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get("q") || "";
};

export const getFilterValueFromSearchFilterState = (
  state: ISearchFilterState,
) => {
  const { collections } = state;
  const selectedCollection = collections.filter(({ isSelected }) => isSelected);

  const filterValue: SearchFilterValue[] = selectedCollection.map(
    ({ id, fields }) => {
      const selectedFields = fields.filter(({ isSelected }) => isSelected);

      return {
        collection: id,
        query_by: selectedFields.map(({ apiName }) => apiName),
      };
    },
  );

  return filterValue;
};

export const getFilterTagsFromSearchFilterState = (
  state: ISearchFilterState,
) => {
  const { collections } = state;
  const selectedCollection = collections.filter(({ isSelected }) => isSelected);

  let filterTags: FilterTag[] = [];

  if (selectedCollection.length) {
    selectedCollection.forEach(
      ({ name: collectionName, icon, color, fields }) => {
        const selectedFields = fields.filter(({ isSelected }) => isSelected);

        if (
          selectedCollection.length > 1 &&
          selectedCollection.length < collections.length &&
          selectedFields.length === fields.length
        ) {
          filterTags.push({
            title: `is:${collectionName}`,
            icon: (icon || "cube") as IconName,
            color: color || "gray",
          });
        } else if (selectedFields.length < fields.length) {
          filterTags.push(
            ...selectedFields.map(({ name }) => ({
              title: `field:${collectionName}.${name}`,
              icon: (icon || "cube") as IconName,
              color: color || "gray",
            })),
          );
        }
      },
    );
  }

  return filterTags;
};
