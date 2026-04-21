import EstimateDetailsDescription from "@/components/dashboard/Admin/Estimate/EstimateDetailsDescription";
import EstimateDetilasTableFormat from "@/components/dashboard/Admin/Estimate/EstimateDetilasTableFormat";

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
