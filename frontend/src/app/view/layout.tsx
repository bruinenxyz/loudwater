"use client";

import { ReactNode } from "react";

import BreadcrumbsBar from "../../components/breadcrumbs-bar";

const BREADCRUMBS_ROOT = "/view";
const BREADCRUMBS_MIN_LENGTH_TO_SHOW = 2;

type LayoutProps = {
  children: ReactNode;
};

const ViewLayout = ({ children }: LayoutProps) => {
  return (
    <>
      <head>
        <title>Bruinen View</title>
      </head>
      <div className="flex flex-col w-full h-full">
        <div className="flex-grow min-h-0">{children}</div>
      </div>
    </>
  );
};

export default ViewLayout;
