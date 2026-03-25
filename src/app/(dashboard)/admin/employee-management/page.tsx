import EmployeeManagement from "@/components/table/EmployeeManagement";
import { Search } from "lucide-react";

export default function EmployeeManagementPage() {
  return (
    <div className="bg-secondary p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex flex-wrap gap-4">
          <button className="bg-primary hover:bg-primary/90 transition-all flex items-center px-6 md:px-20 py-3 md:py-4 rounded-lg text-secondary">
            Employee
          </button>
          <button className="border border-primary text-primary px-6 md:px-10 py-3 md:py-4 rounded-lg">
            Office Administration
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>

          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-6">
        <EmployeeManagement />
      </div>
    </div>
  );
}
