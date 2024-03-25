"use client";

import { PropsWithChildren } from "react";

import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";

const PUBLIC_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

export const PrivateRouteGuard = ({ children }: PropsWithChildren) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded, user } = useUser();

  if (!isLoaded) {
    return null;
  }

  if (
    isSignedIn &&
    user &&
    user.organizationMemberships.length === 0 &&
    !pathname.includes("/auth/create-organization")
  ) {
    router.push("/auth/create-organization");

    return null;
  }

  if (!isSignedIn && !PUBLIC_ROUTES.includes(pathname)) {
    router.push(`/auth/sign-in?redirect_url=${encodeURIComponent(pathname)}`);

    return null;
  }

  return children;
};
