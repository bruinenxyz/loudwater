"use client";
import { UpdateUserQuerySchema, UserQuery } from "@/definitions";
import { EditableText } from "@blueprintjs/core";
import { useUpdateUserQuery } from "@/data/use-user-query";

export default function QueryHeader({ query }: { query?: UserQuery }) {
  const { trigger: updateQuery } = useUpdateUserQuery(query!.id);

  return (
    <div className="flex-none">
      <div className="flex items-center justify-between">
        <div className="flex flex-row items-center justify-center">
          <div>
            <EditableText
              className="m-0 text-base font-semibold"
              defaultValue={query?.name}
              placeholder="Add a name..."
              onConfirm={async (value) => {
                if (!value.trim()) {
                  return;
                }
                const updateData = UpdateUserQuerySchema.parse({
                  name: value,
                });
                await updateQuery(updateData);
              }}
            />
            <EditableText
              className="m-0 line-clamp-2"
              defaultValue={query?.description}
              placeholder="Add a description..."
              onConfirm={async (value) => {
                const updateData = UpdateUserQuerySchema.parse({
                  description: value,
                });
                await updateQuery(updateData);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
