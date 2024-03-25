"use client";
import {
  Button,
  CardList,
  Navbar,
  Section,
  Spinner,
  SpinnerSize,
  Text,
} from "@blueprintjs/core";
import { BaseCard } from ".";
import {
  LoadingType,
  MAX_SKELETON_LOADER_ITEMS,
  ViewType,
} from "@/utils/constants";
import * as _ from "lodash";

export default function CardSection({
  title,
  cards,
  className,
  rightElement,
  dislayViewTypes = [ViewType.GRID, ViewType.LIST],
  viewType = ViewType.GRID,
  setViewType,
  emptyElement = <></>,
  bounded,
  loadingType = LoadingType.SKELETON,
  isLoading,
}: {
  title: string | React.ReactElement;
  cards: React.ReactElement[] | React.ReactElement;
  className?: string;
  rightElement?: React.ReactElement;
  dislayViewTypes?: ViewType[];
  viewType?: ViewType;
  setViewType?: (value: ViewType) => void;
  emptyElement?: React.ReactElement;
  bounded?: boolean; // If undefined, default to true and render a Section
  loadingType?: LoadingType;
  isLoading?: boolean;
}) {
  if (isLoading) {
    if (loadingType === LoadingType.SPINNER) {
      return (
        <div className="flex items-center justify-center w-full h-full">
          <Spinner size={SpinnerSize.STANDARD} />
        </div>
      );
    }

    return renderContentSkeleton();
  }

  function renderViewToggle() {
    // If setViewType is provided, we want to render the view toggle, otherwise we don't
    if (!!setViewType && viewType !== undefined) {
      return (
        <div
          className={`flex flex-row items-center ${rightElement ? "mr-3" : ""}`}
        >
          {dislayViewTypes.map((item, index) => {
            switch (item) {
              case ViewType.GRID:
                return (
                  <>
                    <Button
                      className="bp5-minimal"
                      active={viewType === ViewType.GRID}
                      icon="grid-view"
                      onClick={() => setViewType(ViewType.GRID)}
                    />
                    {index < dislayViewTypes.length - 1 && <Navbar.Divider />}
                  </>
                );
              case ViewType.LIST:
                return (
                  <>
                    <Button
                      className="bp5-minimal"
                      active={viewType === ViewType.LIST}
                      icon="list"
                      onClick={() => setViewType(ViewType.LIST)}
                    />
                    {index < dislayViewTypes.length - 1 && <Navbar.Divider />}
                  </>
                );
              case ViewType.TABLE:
                return (
                  <>
                    <Button
                      className="bp5-minimal"
                      active={viewType === ViewType.TABLE}
                      icon="th"
                      onClick={() => setViewType(ViewType.TABLE)}
                    />
                    {index < dislayViewTypes.length - 1 && <Navbar.Divider />}
                  </>
                );
            }
          })}
        </div>
      );
    }
    return null;
  }

  function renderContent() {
    switch (viewType) {
      case ViewType.LIST:
        return (
          <CardList
            className={`overflow-y-auto ${bounded === false ? "mt-2" : ""}`}
            style={{
              maxHeight: `calc(100% - ${bounded === false ? "40px" : "50px"})`,
            }}
            bordered={false}
          >
            {cards}
          </CardList>
        );
      case ViewType.GRID:
        return (
          <div
            className={`grid grid-cols-3 gap-3 overflow-y-auto ${
              bounded === false ? "mt-2 p-1" : "p-3 "
            }`}
            style={{
              maxHeight: `calc(100% - ${bounded === false ? "45px" : "50px"})`,
            }}
          >
            {cards}
          </div>
        );
      case ViewType.TABLE:
        return (
          <div
            className={bounded === false ? "mt-2" : ""}
            style={{
              maxHeight: `calc(100% - ${bounded === false ? "40px" : "50px"})`,
            }}
          >
            {cards}
          </div>
        );
    }
  }

  function renderContentSkeleton() {
    switch (viewType) {
      case ViewType.LIST:
      case ViewType.TABLE:
        return (
          <CardList
            className={`overflow-y-auto ${bounded === false ? "mt-2" : ""}`}
            style={{
              maxHeight: `calc(100% - ${bounded === false ? "40px" : "50px"})`,
            }}
            bordered={false}
          >
            {Array.from({ length: MAX_SKELETON_LOADER_ITEMS }).map(
              (_, index) => (
                <BaseCard key={index} isLoading title="" size="small" />
              ),
            )}
          </CardList>
        );
      case ViewType.GRID:
        return (
          <div
            className={`grid grid-cols-3 gap-3 overflow-y-auto ${
              bounded === false ? "mt-2 p-1" : "p-3 "
            }`}
            style={{
              maxHeight: `calc(100% - ${bounded === false ? "45px" : "50px"})`,
            }}
          >
            {Array.from({ length: MAX_SKELETON_LOADER_ITEMS }).map(
              (_, index) => (
                <BaseCard key={index} isLoading title="" size="large" />
              ),
            )}
          </div>
        );
    }
  }

  // If bounded is undefined, default to true and render a Section
  if (bounded === false) {
    return (
      <div className={className}>
        <div className="flex flex-row items-center justify-between h-[35px]">
          <Text className="text-lg bp5-heading bp5-section-header-title">
            {title}
          </Text>
          <div className="flex flex-row items-center">
            {renderViewToggle()}
            {rightElement}
          </div>
        </div>
        {Array.isArray(cards) && cards.length == 0
          ? emptyElement
          : renderContent()}
      </div>
    );
  } else {
    return (
      <Section
        title={title}
        className={className}
        rightElement={
          <div className="flex flex-row items-center">
            {renderViewToggle()}
            {rightElement}
          </div>
        }
      >
        {Array.isArray(cards) && cards.length == 0
          ? emptyElement
          : renderContent()}
      </Section>
    );
  }
}
