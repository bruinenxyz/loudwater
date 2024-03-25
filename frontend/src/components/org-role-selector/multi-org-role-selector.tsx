"use client";
import { OrgRole } from "@/definitions";
import { MenuItem, Tag } from "@blueprintjs/core";
import { ItemRenderer, MultiSelect } from "@blueprintjs/select";
import * as _ from "lodash";

export default function MultiOrgRoleSelector({
  className,
  disabled,
  roles,
  selectedRoles,
  setSelectedRoles,
}: {
  className?: string;
  disabled?: boolean;
  roles: OrgRole[];
  selectedRoles: OrgRole[];
  setSelectedRoles: (roles: OrgRole[]) => void;
}) {
  const selectOrgRole = (selection: OrgRole) => {
    if (!_.includes(selectedRoles, selection)) {
      const updatedRoles = [...selectedRoles];
      updatedRoles.splice(_.indexOf(roles, selection), 0, selection);
      setSelectedRoles(updatedRoles);
    } else if (selection !== OrgRole.ADMIN) {
      setSelectedRoles(_.without(selectedRoles, selection));
    }
  };

  const renderOrgRoleMenuItems: ItemRenderer<OrgRole> = (
    orgRole: OrgRole,
    { handleClick, modifiers },
  ) => (
    <MenuItem
      key={orgRole}
      disabled={modifiers.disabled}
      selected={_.includes(selectedRoles, orgRole)}
      onClick={handleClick}
      text={orgRole}
      roleStructure="listoption"
    />
  );

  const filterOrgRoles = (query: string, orgRole: OrgRole) =>
    orgRole.toLowerCase().includes(query.toLowerCase());

  const renderOrgRoleTags = (orgRole: OrgRole) => (
    <div
      key={orgRole}
      className="cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      {orgRole}
    </div>
  );

  return (
    <MultiSelect<OrgRole>
      disabled={disabled}
      className={className}
      items={roles}
      selectedItems={selectedRoles}
      onItemSelect={selectOrgRole}
      onRemove={selectOrgRole}
      itemRenderer={renderOrgRoleMenuItems}
      itemPredicate={filterOrgRoles}
      itemDisabled={(orgRole) => orgRole === OrgRole.ADMIN}
      tagRenderer={renderOrgRoleTags}
      noResults={
        <MenuItem
          disabled={true}
          text="No results."
          roleStructure="listoption"
        />
      }
    />
  );
}
