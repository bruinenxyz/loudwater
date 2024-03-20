"use client";

export default function QueriesViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="h-full p-3 overflow-auto">{children}</div>;
}
