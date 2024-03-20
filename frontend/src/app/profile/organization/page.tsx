"use client";
import React from "react";
import { OrganizationProfile } from "@clerk/clerk-react";

const Page: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      {process.env.NEXT_PUBLIC_USE_AUTH === "true" && (
        <OrganizationProfile path="/profile/organization" routing="virtual" />
      )}
    </div>
  );
};

export default Page;
