"use client";

import { useParams } from "next/navigation";

export default function RoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const role = params.role as string;

  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto  p-6">{children}</main>
    </div>
  );
}
