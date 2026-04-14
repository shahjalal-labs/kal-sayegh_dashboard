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
      <main className="flex-1 ">{children}</main>
    </div>
  );
}
