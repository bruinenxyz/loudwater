import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
} from "@blueprintjs/core";
import {
  useUser,
  useAuth,
  useOrganization,
  useOrganizationList,
} from "@clerk/clerk-react";
import { OrganizationResource } from "@clerk/types";
import * as _ from "lodash";
import { useSWRConfig } from "swr";

export const UserProfileButton = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { organization: activeOrganization, membership } = useOrganization();

  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });

  const { mutate } = useSWRConfig();

  const handleSwitchOrganization = (organization: OrganizationResource) => {
    if (setActive) {
      setActive({ organization });

      // Clear cache, since user may not have permission
      mutate(
        (key) => true, // which cache keys are updated
        undefined, // update cache data to `undefined`
        { revalidate: false }, // do not revalidate
      );
    }
  };

  return (
    <div className="w-full p-1 ">
      <Popover
        className="w-full"
        content={
          <Menu>
            <MenuItem text="Manage account" icon="edit" href="/profile/user" />
            <MenuDivider />
            <MenuItem
              text="Sign Out"
              icon="log-out"
              onClick={() => signOut()}
            />
          </Menu>
        }
      >
        <Button
          minimal
          fill
          alignText="left"
          rightIcon="chevron-right"
          ellipsizeText
          className={isLoaded ? "" : "bp5-skeleton"}
        >
          {user?.fullName}
          <div className="bp5-text-muted">
            {user?.primaryEmailAddress?.emailAddress}
          </div>
        </Button>
      </Popover>
      <Popover
        className="w-full"
        content={
          <Menu>
            <MenuDivider title={activeOrganization?.name} />
            <MenuItem
              text="Manage Organization"
              icon="edit"
              href="/profile/organization"
            ></MenuItem>
            <MenuDivider title="Switch to" />
            {_.map(userMemberships.data, (org) => {
              return (
                <MenuItem
                  text={org.organization.name}
                  icon="circle-arrow-right"
                  onClick={() => handleSwitchOrganization(org.organization)}
                />
              );
            })}
          </Menu>
        }
      >
        <Button
          minimal
          fill
          className={isLoaded ? "" : "bp5-skeleton"}
          alignText="left"
          rightIcon="chevron-right"
          ellipsizeText
        >
          {activeOrganization?.name}
          <div className="bp5-text-muted">{membership?.role}</div>
        </Button>
      </Popover>
    </div>
  );
};
