"use client";
import React from "react";
import { UserProfile } from "@clerk/clerk-react";
import { Section } from "@blueprintjs/core";

const Page: React.FC = () => {
  return (
    <div className="flex justify-center h-screen overflow-scroll">
      <div className="my-4">
        {process.env.NEXT_PUBLIC_USE_AUTH === "true" && (
          <UserProfile path="/profile/user" routing="virtual" />
        )}
      </div>
    </div>
  );
};

export default Page;
