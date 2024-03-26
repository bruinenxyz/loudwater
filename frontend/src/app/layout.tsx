"use client";
import "./globals.css";

import React, { useState } from "react";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";

import { PrivateRouteGuard } from "@/guards/route-guard/PrivateRouteGuard";
import { useDarkMode } from "@/stores";
import { BlueprintProvider, Button } from "@blueprintjs/core";
import { ClerkProvider } from "@clerk/clerk-react";

import NavigationBar from "./navigation-bar";

const noLayoutPaths = ["/auth/*"];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const orgId = process.env.NEXT_PUBLIC_ORGANIZATION_ID;
  const useClerk: boolean =
    process.env.NEXT_PUBLIC_USE_AUTH === "true" && !!clerkPubKey && !orgId;
  const [darkMode, setDarkMode] = useDarkMode();
  // const [isCollapseNavMenu, setIsCollapseNavMenu] = useState<boolean>(false);

  const getBodyClassName = () => {
    // console.log("Calling for class", darkMode);
    if (darkMode) {
      return "bp5-dark dark-container";
    } else {
      return "light-container";
    }
  };

  const useRouteGuard = () => {
    if (useClerk && clerkPubKey) {
      return <PrivateRouteGuard>{children}</PrivateRouteGuard>;
    } else {
      return children;
    }
  };

  const useAuth = () => {
    if (useClerk && clerkPubKey) {
      return (
        <ClerkProvider publishableKey={clerkPubKey}>
          {renderChildren()}
        </ClerkProvider>
      );
    } else {
      return renderChildren();
    }
  };

  const renderChildren = () => {
    if (noLayoutPaths.some((p) => path.match(p))) {
      return (
        <body className={getBodyClassName()}>
          <div className="flex h-screen max-h-screen">{useRouteGuard()}</div>
        </body>
      );
    }

    return (
      <BlueprintProvider>
        <body className={getBodyClassName()}>
          <div className="flex flex-col sm:flex-row">
            <div
              className={`w-[200px] hidden sm:block fixed h-screen transition-all duration-200 
              ease-out`}
            >
              <NavigationBar darkMode={darkMode} setDarkMode={setDarkMode} />
            </div>
            <div
              className={
                "w-[calc(100%-200px)] sm:left-[200px] h-[calc(100%-60px)] sm:h-full absolute"
              }
            >
              {useRouteGuard()}
            </div>
          </div>
        </body>
      </BlueprintProvider>
    );
  };

  return (
    <html lang="en">
      <head>
        <title>Bruinen</title>
      </head>
      {useAuth()}
    </html>
  );
}