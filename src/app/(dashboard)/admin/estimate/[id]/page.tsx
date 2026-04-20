import EstimateDetailsDescription from "@/components/dashboard/Admin/EstimateDetailsDescription";
import EstimateDetilasTableFormat from "@/components/dashboard/Admin/EstimateDetilasTableFormat";

type EstimateDetailsPageProps = {
  searchParams?: {
    format?: string;
  };
};

export default function EstimateDetailsPage({
  searchParams,
}: EstimateDetailsPageProps) {
  const format = searchParams?.format;

  if (format === "table") {
    return <EstimateDetilasTableFormat />;
  }

  return <EstimateDetailsDescription />;
}
