import { useGetAllOfficeAdministratorQuery } from "@/redux/api/admin/estimateApi";
import { useEffect, useState } from "react";
import ReusableTable from "./ReusableTable";

interface Administrator {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

export default function AdministorManagement() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, error } = useGetAllOfficeAdministratorQuery({
    page,
    limit: 20,
    searchTerm,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const columns = [
    { key: "fullName", label: "Administrator Name" },
    { key: "email", label: "Email Address" },
    { key: "role", label: "Role" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  const administrators: Administrator[] = data?.result?.data ?? [];

  return (
    <div className="space-y-7 bg-secondary p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex flex-wrap gap-4">
          <h2 className="text-lg md:text-2xl font-normal">
            Administrator Management
          </h2>
        </div>
      </div>
      <div className="border-t">
        <ReusableTable
          columns={columns}
          data={administrators}
          isLoading={isLoading}
          error={error?.toString?.()}
          page={page}
          totalPages={data?.result?.meta?.totalPages ?? 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
