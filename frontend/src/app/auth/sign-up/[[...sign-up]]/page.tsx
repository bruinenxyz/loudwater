"use client";

import { Colors } from "@blueprintjs/colors";
import { SignUp } from "@clerk/clerk-react";
import { useEffect } from "react";
import Analytics from "@segment/analytics-node";

export default function SignUpPage() {
  useEffect(() => {
    const nodeEnv = process.env.NODE_ENV || "development";

    if (nodeEnv === "development") {
      console.log("Tracking Event: Sign Up");
    } else {
      if (process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY) {
        const analytics = new Analytics({
          writeKey: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
        });

        analytics.track({
          userId: "anonymous",
          event: "Sign Up",
        });
      }
    }
  }, []);

  return (
    <>
      <head>
        <title>Sign up</title>
      </head>
      <div
        className="flex items-center justify-center w-full min-h-screen"
        style={{ background: Colors.DARK_GRAY3 }}
      >
        {process.env.NEXT_PUBLIC_USE_AUTH === "true" && (
          <SignUp routing="hash" />
        )}
      </div>
    </>
  );
}
