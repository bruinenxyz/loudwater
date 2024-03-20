import React, { FormEventHandler, useCallback, useMemo, useState } from "react";

import { ISearchFilterState } from "@/stores/utils/search-filter";
import {
  Button,
  Checkbox,
  Divider,
  Icon,
  IconName,
  InputGroup,
  Popover,
  Text,
  Tree,
  TreeNodeInfo,
} from "@blueprintjs/core";

export type SearchFilterProps = {
  title?: string;
  searchPlaceHolder?: string;
  state: ISearchFilterState;
  onChange: (state: ISearchFilterState) => void;
};

export const SearchFilter: React.FC<SearchFilterProps> = ({
  title = "Search by object",
  searchPlaceHolder = "Type to search object type...",
  state,
  onChange,
}) => {
  const [searchValue, setSearchValue] = useState<string>("");
  const { isSingleCollection, isAllFiltersSelected, isSomeFiltersSelected } =
    useMemo(() => {
      const isSingleCollection = state.collections.length === 1;
      const isAllFiltersSelected = state.collections.every(
        ({ isSelected }) => isSelected,
      );
      const isSomeFiltersSelected =
        state.collections.some(({ isSelected }) => isSelected) &&
        !isAllFiltersSelected;

      return {
        isSingleCollection,
        isAllFiltersSelected,
        isSomeFiltersSelected,
      };
    }, [state.collections]);

  const handleSelectCollection = useCallback(
    (checked: boolean, collectionId: string) => {
      onChange({
        ...state,
        collections: state.collections.map((collection) => {
          if (collection.id === collectionId) {
            return {
              ...collection,
              isSelected: checked,
              fields: collection.fields.map((field) => ({
                ...field,
                isSelected: checked,
              })),
            };
          }

          return collection;
        }),
      });
    },
    [state],
  );

  const handleSelectField = useCallback(
    (checked: boolean, collectionId: string, fieldName: string) => {
      onChange({
        ...state,
        collections: state.collections.map((collection) => {
          const { fields } = collection;

          if (collection.id === collectionId) {
            return {
              ...collection,
              isSelected: fields.some(
                (field) =>
                  (field.name === fieldName && !field.isSelected) ||
                  (field.name !== fieldName && field.isSelected),
              ),
              fields: fields.map((field) => {
                if (field.name === fieldName) {
                  return {
                    ...field,
                    isSelected: checked,
                  };
                }

                return field;
              }),
            };
          }

          return collection;
        }),
      });
    },
    [state],
  );

  const filterNodes = useMemo(() => {
    const { collections } = state;

    return collections
      .filter(
        (collection) =>
          !searchValue ||
          collection.name.toLowerCase().includes(searchValue.toLowerCase()),
      )
      .map((collection) => {
        const { fields } = collection;
        const selectedFields = fields.filter(({ isSelected }) => isSelected);

        return {
          id: collection.id,
          isExpanded: collection.isExpanded,
          icon: (
            <Checkbox
              className="mb-0"
              checked={collection.isSelected}
              onChange={(event) =>
                handleSelectCollection(
                  event.currentTarget.checked,
                  collection.id,
                )
              }
            />
          ),
          label: (
            <div className="flex items-center justify-between space-x-1">
              <div className="flex items-center">
                <Icon
                  icon={(collection.icon as IconName) || "cube"}
                  color={collection.color || "gray"}
                />
                <Text className="ml-1">{collection.name}</Text>
              </div>
              {selectedFields.length > 0 && (
                <div className="text-xs bg-[#e7e7e7] px-1">
                  {selectedFields.length}
                </div>
              )}
            </div>
          ),
          childNodes: fields.map((field) => ({
            id: field.name,
            icon: (
              <Checkbox
                className="mb-0"
                checked={field.isSelected}
                onChange={(event) =>
                  handleSelectField(
                    event.currentTarget.checked,
                    collection.id,
                    field.name,
                  )
                }
              />
            ),
            label: (
              <div className="flex items-center">
                <Icon
                  icon={(collection.icon as IconName) || "cube"}
                  color={collection.color || "gray"}
                />
                <Text className="ml-1">{field.name}</Text>
              </div>
            ),
          })),
        };
      });
  }, [state, searchValue, handleSelectCollection, handleSelectField]);

  const handleSelectAllFilters: FormEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const { checked } = event.currentTarget;

    onChange({
      ...state,
      collections: state.collections.map((collection) => ({
        ...collection,
        isSelected: checked,
        fields: collection.fields.map((field) => ({
          ...field,
          isSelected: checked,
        })),
      })),
    });
  };

  const handleNodeExpand = (node: TreeNodeInfo) => {
    const { id } = node;
    const { collections } = state;

    onChange({
      ...state,
      collections: collections.map((collection) => {
        if (collection.id === id) {
          return {
            ...collection,
            isExpanded: !collection.isExpanded,
          };
        }

        return collection;
      }),
    });
  };

  const handleSearchValueChange: FormEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setSearchValue(event.currentTarget.value);
  };

  const getFilterButtonText = useCallback(() => {
    if (isSingleCollection) {
      return (
        <div className="flex items-center">
          <Icon
            icon={(state.collections[0].icon as IconName) || "cube"}
            color={state.collections[0].color || "gray"}
          />
          <Text className="ml-1">{state.collections[0].name}</Text>
        </div>
      );
    }

    const selectedCollections = state.collections.filter(
      ({ isSelected }) => isSelected,
    );

    if (isAllFiltersSelected || selectedCollections.length === 0) {
      return "All";
    }

    if (selectedCollections.length === 1) {
      return (
        <div className="flex items-center">
          <Icon
            icon={(selectedCollections[0].icon as IconName) || "cube"}
            color={selectedCollections[0].color || "gray"}
          />
          <Text className="ml-1">{selectedCollections[0].name}</Text>
        </div>
      );
    }

    return "Multiple";
  }, [isAllFiltersSelected, isSingleCollection, state.collections]);

  return (
    <Popover
      content={
        <div className="flex flex-col px-2 py-3 gap-y-1 min-w-[300px]">
          <div className="flex justify-between">
            <span className="font-medium">{title}</span>
            {!isSingleCollection && (
              <Checkbox
                checked={isAllFiltersSelected}
                indeterminate={isSomeFiltersSelected}
                className="m-0 text-[#8b8b8b]"
                alignIndicator="right"
                label="Select all"
                onChange={handleSelectAllFilters}
              />
            )}
          </div>
          {!isSingleCollection && (
            <>
              <Divider className="mx-0" />
              <InputGroup
                leftIcon="search"
                placeholder={searchPlaceHolder}
                value={searchValue}
                onChange={handleSearchValueChange}
              />
            </>
          )}
          <Divider className="mx-0" />
          <Tree
            contents={filterNodes}
            onNodeExpand={handleNodeExpand}
            onNodeCollapse={handleNodeExpand}
          />
        </div>
      }
      placement="bottom-start"
      enforceFocus={false}
    >
      <Button rightIcon="caret-down">{getFilterButtonText()}</Button>
    </Popover>
  );
};
