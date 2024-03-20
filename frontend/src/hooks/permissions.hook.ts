import { useUser, useAuth } from "@clerk/clerk-react";
import * as _ from "lodash";

export const useUserPermission = (requiredPermission: string): boolean => {
  const { user } = useUser();
  const { has } = useAuth();

  if (!user) {
    return false;
  }
  if (has && has({ permission: requiredPermission })) {
    return true;
  }
  return false;
};
