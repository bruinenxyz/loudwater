"use client";

import { Colors } from "@blueprintjs/colors";
import { CreateOrganization } from "@clerk/clerk-react";

export default function CreateOrganizationPage() {
  return (
    <>
      <head>
        <title>Create Organization</title>
      </head>
      <div
        className="flex items-center justify-center w-full min-h-screen"
        style={{ background: Colors.DARK_GRAY3 }}
      >
        {process.env.NEXT_PUBLIC_USE_AUTH === "true" && (
          <CreateOrganization
            afterCreateOrganizationUrl={"/"}
            routing="virtual"
            path="/auth/create-organization"
          />
        )}
      </div>
    </>
  );
}
