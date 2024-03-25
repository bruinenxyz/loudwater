import { Card, Icon, Tag, Text } from "@blueprintjs/core";
import Image from "next/image";

export default function UserPermissionsCard({
  user,
  interactive,
  className,
  onClick,
  rightElement,
}: {
  user: any;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
  rightElement?: JSX.Element;
}) {
  return (
    <Card
      interactive={interactive}
      className={`flex flex-row items-center p-2 justify-between ${className}`}
      onClick={onClick}
    >
      <div className="flex flex-row items-center">
        {user.publicUserData.hasImage ? (
          <Image
            src={user.publicUserData.imageUrl}
            className="rounded-full"
            width={35}
            height={35}
            alt="Picture of the user"
          />
        ) : (
          <Icon icon="user" size={35} />
        )}
        <div className="flex flex-col ml-2">
          <Text className="font-bold">
            {user.publicUserData.firstName + " " + user.publicUserData.lastName}
          </Text>
          <Text className="bp5-text-muted">
            {user.publicUserData.identifier}
          </Text>
        </div>
        <Tag minimal className="ml-3">
          {user.role}
        </Tag>
      </div>
      {rightElement}
    </Card>
  );
}
