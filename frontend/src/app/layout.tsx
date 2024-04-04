"use client";
import "./globals.css";

import React from "react";

import { ClerkProvider } from "@clerk/clerk-react";

import { DarkModeProvider } from "@/components/context/dark-mode-context";
import AppBody from "./app-body";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isUsingAuth: boolean = process.env.NEXT_PUBLIC_USE_AUTH === "true";

  const authRoute = () => {
    console.log("isUsingAuth", isUsingAuth, clerkPubKey);
    if (isUsingAuth && clerkPubKey) {
      return (
        <ClerkProvider publishableKey={clerkPubKey}>
          <DarkModeProvider>
            <AppBody isUsingAuth={isUsingAuth} clerkPubKey={clerkPubKey}>
              {children}
            </AppBody>
          </DarkModeProvider>
        </ClerkProvider>
      );
    } else {
      return (
        <DarkModeProvider>
          <AppBody isUsingAuth={isUsingAuth} clerkPubKey={clerkPubKey}>
            {children}
          </AppBody>
        </DarkModeProvider>
      );
    }
  };

  return (
    <html lang="en">
      <head>
        <title>Bruinen</title>
      </head>
      {authRoute()}
    </html>
  );
}
