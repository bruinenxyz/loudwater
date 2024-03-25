import { useObject } from "@/data/use-object";
import { useObjectDefinition } from "@/data/use-object-definition";
import { usePipeline } from "@/data/use-pipeline";
import { useWorkbook } from "@/data/use-workbook";
import { Breadcrumb, BreadcrumbProps, Breadcrumbs } from "@blueprintjs/core";
import { upperFirst } from "lodash";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_MIN_LENGTH_TO_SHOW,
  ObjectPath,
  PATH_MAP,
  PipelinePath,
  WorkbookPath,
} from "./constants";

type BreadcrumbsBarProps = {
  className?: string;
  root?: string;
  minLengthToShow?: number;
};

const BreadcrumbsBar: React.FC<BreadcrumbsBarProps> = ({
  className,
  root = "/",
  minLengthToShow = DEFAULT_MIN_LENGTH_TO_SHOW,
}) => {
  const path = usePathname();
  const router = useRouter();

  const [objectDefinitionId, setObjectDefinitionId] = useState<string>();
  const [objectId, setObjectId] = useState<string>();
  const [pipelineId, setPipelineId] = useState<string>();
  const [workbookId, setWorkbookId] = useState<string>();

  // Fetch data only triggered when ids are set
  const { data: objectDefinition } = useObjectDefinition(objectDefinitionId);
  const { data: object } = useObject(objectDefinitionId, objectId);
  const { data: pipeline } = usePipeline(pipelineId);
  const { data: workbook } = useWorkbook(workbookId);

  // Extract necessary ids from path by matching with regex
  useEffect(() => {
    const objectDefinitionMatch = path.match(ObjectPath.DEFINITION);

    if (objectDefinitionMatch) {
      const [, objectDefinitionId] = objectDefinitionMatch;
      setObjectDefinitionId(objectDefinitionId);

      return;
    }

    const objectMatch = path.match(ObjectPath.DETAIL);
    if (objectMatch) {
      const [, objectDefinitionId, objectId] = objectMatch;
      setObjectDefinitionId(objectDefinitionId);
      setObjectId(objectId);

      return;
    }

    const pipelineMatch = path.match(PipelinePath.DETAIL);
    if (pipelineMatch) {
      const [, pipelineId] = pipelineMatch;
      setPipelineId(pipelineId);

      return;
    }

    const workbookMatch = path.match(WorkbookPath.DETAIL);
    if (workbookMatch) {
      const [, workbookId] = workbookMatch;
      setWorkbookId(workbookId);

      return;
    }
  }, [path]);

  const breadcrumbs = useMemo(() => {
    const parts = path
      .slice(root.length)
      .split("/")
      .filter((part) => part !== "");

    const breadcrumbs: BreadcrumbProps[] = [];

    let currentPath = root;
    for (const part of parts) {
      currentPath += `/${part}`;

      let text: string | undefined = PATH_MAP[currentPath];

      if (currentPath.match(ObjectPath.DEFINITION)) {
        text = objectDefinition?.name;
      } else if (currentPath.match(ObjectPath.DETAIL)) {
        text = object?.[objectDefinition?.primary_key_property || "id"];
      } else if (currentPath.match(ObjectPath.UPDATE)) {
        text = `Update Object`;
      } else if (currentPath.match(ObjectPath.DELETE)) {
        text = `Delete Object`;
      } else if (currentPath.match(PipelinePath.DETAIL)) {
        text = pipeline?.name;
      } else if (currentPath.match(WorkbookPath.DETAIL)) {
        text = workbook?.name;
      }

      if (!text) {
        text = upperFirst(part);
      }

      if (
        !(
          (path.match(ObjectPath.DETAIL) ||
            path.match(ObjectPath.UPDATE) ||
            path.match(ObjectPath.DELETE)) &&
          part === "object"
        )
      ) {
        breadcrumbs.push({
          text,
          href: currentPath,
        });
      }
    }

    return breadcrumbs;
  }, [
    object,
    objectDefinition?.name,
    objectDefinition?.primary_key_property,
    path,
    pipeline?.name,
    root,
    workbook?.name,
  ]);

  if (breadcrumbs.length < minLengthToShow) {
    return null;
  }

  const handleBreadcrumbClick = (href: string) => {
    router.replace(href);
  };

  return (
    <Breadcrumbs
      className={`m-3 mb-0 ${className || ""}`}
      items={breadcrumbs}
      breadcrumbRenderer={({ text, href, ...others }) => (
        <Breadcrumb
          {...others}
          onClick={() => href && handleBreadcrumbClick(href)}
          className={
            href === path ? "bp5-breadcrumb-current" : "bp5-breadcrumb"
          }
        >
          {text}
        </Breadcrumb>
      )}
    />
  );
};

export default BreadcrumbsBar;
