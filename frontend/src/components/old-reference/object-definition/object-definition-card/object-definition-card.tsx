"use client";
import * as _ from "lodash";
import { BaseCard } from "@/components/old-reference/cards";
import { ObjectDefinitionPropertyTag } from "@/components/old-reference/properties";
import RealtimeBadge from "@/components/old-reference/badges/realtime-badge";
import { ObjectDefinition, ObjectProperty } from "@/definitions";
import SquareIcon, { SquareIconSize } from "../../../icon/square-icon";
import { IconName, Text } from "@blueprintjs/core";
import { useEffect, useRef, useState } from "react";
import { useObjectDefinitionActionsAllowed } from "@/data/use-object-definition";

export default function ObjectDefinitionCard({
  size,
  objectDefinition,
  rightElement,
  rightAlert,
  action,
  actionButtonTitle,
  interactive,
}: {
  size: "large" | "small";
  objectDefinition: ObjectDefinition;
  rightElement?: React.ReactElement;
  rightAlert?: React.ReactElement;
  action?: () => void;
  actionButtonTitle?: string;
  interactive?: boolean;
}) {
  const [bottomPanelOverflowIndex, setBottomPanelOverflowIndex] = useState<
    number | null
  >(null);
  const [listPanelOverflowIndex, setListPanelOverflowIndex] = useState<
    number | null
  >(null);
  const bottomPanelRef = useRef(null);
  const listPanelRef = useRef(null);

  const { data: allowsActions, isLoading: isLoadingAllowsActions } =
    useObjectDefinitionActionsAllowed(objectDefinition.id);

  useEffect(() => {
    // Check if the bottom panel or list panel tags are overflowing and identify the index of the last visible tag
    function checkOverflow() {
      const bottomPanel = bottomPanelRef.current;
      // Check if the bottom panel is overflowing
      if (bottomPanel && bottomPanel.scrollHeight > bottomPanel.clientHeight) {
        const children = bottomPanel.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          // Check if the child is overflowing
          if (
            child.offsetTop + child.offsetHeight >=
            bottomPanel.offsetTop + bottomPanel.clientHeight
          ) {
            // Set the index of the last visible tag
            setBottomPanelOverflowIndex(i > 1 ? i - 1 : null);
            break;
          }
        }
      } else {
        setBottomPanelOverflowIndex(null);
      }

      const listPanel = listPanelRef.current;
      // Check if the list panel is overflowing
      if (listPanel && listPanel.scrollHeight > listPanel.clientHeight) {
        const children = listPanel.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          // Check if the child is overflowing
          if (
            child.offsetTop + child.offsetHeight >=
            listPanel.offsetTop + listPanel.clientHeight
          ) {
            // Set the index of the last visible tag
            setListPanelOverflowIndex(!!(i - 1) ? i - 1 : 1);
            break;
          }
        }
      } else {
        setListPanelOverflowIndex(null);
      }
    }

    checkOverflow();

    // Add an event listener to check for overflow when the window is resized
    window.addEventListener("resize", checkOverflow);

    // Set a timeout to check for overflow after the component is rendered (otherwise the elipsis occasionally renders in the wrong place)
    const timeout = setTimeout(checkOverflow, 10);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener("resize", checkOverflow);
      clearTimeout(timeout);
    };
  }, []);

  function renderBottomPanel() {
    const properties = _.map(
      objectDefinition.properties,
      (property: ObjectProperty, index: number) => {
        return (
          <ObjectDefinitionPropertyTag
            key={index}
            objectDefinition={objectDefinition}
            property={property}
          />
        );
      },
    );
    return (
      <div
        className="flex flex-row flex-wrap flex-grow gap-2 mt-1 overflow-hidden"
        style={{ maxHeight: "calc(28px * 2)" }}
        ref={bottomPanelRef}
      >
        {bottomPanelOverflowIndex !== null
          ? [
              ...properties.slice(0, bottomPanelOverflowIndex),
              <Text key="ellipsis">
                +{properties.length - bottomPanelOverflowIndex}
              </Text>,
              ...properties.slice(bottomPanelOverflowIndex),
            ]
          : properties}
      </div>
    );
  }

  function renderListPanel() {
    const properties = _.map(
      objectDefinition.properties,
      (property: ObjectProperty, index: number) => {
        return (
          <ObjectDefinitionPropertyTag
            key={index}
            objectDefinition={objectDefinition}
            property={property}
          />
        );
      },
    );
    return (
      <div
        className="flex flex-row flex-wrap items-center gap-2 mt-2 overflow-hidden grow h-fit"
        style={{ maxHeight: "calc(28px * 2)" }}
        ref={listPanelRef}
      >
        {listPanelOverflowIndex !== null
          ? [
              ...properties.slice(0, listPanelOverflowIndex),
              <Text key="ellipsis">
                +{properties.length - listPanelOverflowIndex}
              </Text>,
              ...properties.slice(listPanelOverflowIndex),
            ]
          : properties}
      </div>
    );
  }

  return (
    <BaseCard
      size={size}
      title={objectDefinition.name}
      subtitle={
        objectDefinition.description ? objectDefinition.description : undefined
      }
      leftIcon={
        <SquareIcon
          icon={(objectDefinition.icon as IconName) ?? "cube"}
          color={objectDefinition.color ?? "gray"}
          size={SquareIconSize.STANDARD}
        />
      }
      bottomPanel={renderBottomPanel()}
      listPanel={renderListPanel()}
      rightElement={rightElement}
      rightAlert={
        rightAlert ? rightAlert : allowsActions ? <RealtimeBadge /> : undefined
      }
      action={action}
      actionButtonTitle={actionButtonTitle}
      interactive={interactive}
    />
  );
}
