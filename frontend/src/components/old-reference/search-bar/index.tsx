"use client";

import {
  ChangeEventHandler,
  HtmlHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { usePathname, useRouter } from "next/navigation";

import { ISearchFilterState } from "@/stores/utils/search-filter";
import {
  Button,
  ControlGroup,
  Icon,
  InputGroup,
  Popover,
  Tag,
  Tooltip,
  useHotkeys,
} from "@blueprintjs/core";

import { isEqual } from "lodash";
import { SearchFilter } from "./components/search-filter";
import {
  getFilterTagsFromSearchFilterState,
  getFilterValueFromSearchFilterState,
  getSearchQueryStringParam,
} from "./utils";

const MAX_DISPLAY_FILTER_TAGS = 4;

export type SearchValue = {
  filterState: ISearchFilterState;
  q: string;
};

export type SearchBarProps = HtmlHTMLAttributes<HTMLDivElement> & {
  searchFilterState?: ISearchFilterState;
  onSearch?: (value: SearchValue) => void;
  disabled?: boolean;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  searchFilterState,
  onSearch,
  disabled = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [filterState, setFilterState] = useState<
    ISearchFilterState | undefined
  >(searchFilterState);
  const [searchInputValue, setSearchInputValue] = useState<string>(
    getSearchQueryStringParam(),
  );

  useEffect(() => {
    setFilterState(searchFilterState);
  }, [searchFilterState]);

  useEffect(() => {
    router.replace(
      `${pathname}${searchInputValue ? `?q=${searchInputValue}` : ""}`,
    );
  }, [pathname, router, searchInputValue]);

  const filterTags = useMemo(() => {
    if (filterState) {
      return getFilterTagsFromSearchFilterState(filterState);
    }

    return [];
  }, [filterState]);

  const onSearchSubmit = useCallback(() => {
    if (onSearch && filterState) {
      onSearch({
        filterState,
        q: searchInputValue,
      });
    }
  }, [onSearch, searchInputValue, filterState]);

  const handleFilterStateChange = useCallback(
    (state: ISearchFilterState) => {
      if (
        onSearch &&
        filterState &&
        !isEqual(
          getFilterValueFromSearchFilterState(state),
          getFilterValueFromSearchFilterState(filterState),
        )
      ) {
        onSearch({
          filterState: state,
          q: searchInputValue,
        });
      }
      setFilterState(state);
    },
    [filterState, onSearch, searchInputValue],
  );

  // important: hotkeys array must be memoized to avoid infinitely re-binding hotkeys
  const hotkeys = useMemo(
    () => [
      {
        combo: "enter",
        global: false,
        label: "Refresh data",
        allowInInput: true,
        onKeyDown: onSearchSubmit,
      },
    ],
    [onSearchSubmit],
  );
  const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys);

  const onSearchInputValueChange: ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    setSearchInputValue(event.currentTarget.value);
  };

  return (
    <ControlGroup
      className={`flex items-center h-[32px] relative ${className}`}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {filterState && (
        <SearchFilter state={filterState} onChange={handleFilterStateChange} />
      )}
      <Tooltip
        className="h-full grow"
        content={
          disabled ? "You must index this blueprint before searching" : ""
        }
        fill={true}
      >
        <InputGroup
          value={searchInputValue}
          className="h-full"
          inputClassName="h-full"
          disabled={disabled}
          leftElement={
            <div className="flex items-center px-2 gap-x-2 !m-0 h-[32px]">
              <Icon icon="search" color="#6b7280" />
              {!!filterTags.length && (
                <div className="flex-auto flex flex-nowrap gap-x-1 h-fit">
                  {filterTags
                    ?.slice(0, MAX_DISPLAY_FILTER_TAGS)
                    .map(({ title, icon, color }) => (
                      <Tag
                        key={title}
                        className="!m-0 py-[3px]"
                        style={{ background: color }}
                        icon={<Icon icon={icon} size={14} />}
                      >
                        {title}
                      </Tag>
                    ))}
                  {filterTags.length > MAX_DISPLAY_FILTER_TAGS && (
                    <Tooltip
                      content={filterTags
                        .slice(MAX_DISPLAY_FILTER_TAGS)
                        .map(({ title }) => title)
                        .join(", ")}
                    >
                      <Tag className="!m-0 py-[3px]">
                        +{filterTags.length - MAX_DISPLAY_FILTER_TAGS}
                      </Tag>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          }
          placeholder="Search your ontology"
          fill={true}
          onChange={onSearchInputValueChange}
        />
      </Tooltip>
      <Button className="h-full" type="submit" onClick={onSearchSubmit}>
        Search
      </Button>
    </ControlGroup>
  );
};
