"use client";
import { H3 } from "@blueprintjs/core";
import DatabasesList from "./databases-list";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <head>
        <title>Bruinen Databases</title>
      </head> */}
      <div className="mt-3 ml-3 mr-3">
        <H3>Databases</H3>
        <div className="bp5-text-large">Add, edit, and remove databases</div>
      </div>
      <div className="grid grid-cols-3 gap-3 p-3 h-[calc(100%-79px)]">
        <DatabasesList />
        {children}
      </div>
    </>
  );
}
