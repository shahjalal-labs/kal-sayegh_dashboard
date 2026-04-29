import EstimateDetailsDescription from "@/components/dashboard/Admin/Estimate/EstimateDetailsDescription";
import EstimateDetilasTableFormat from "@/components/dashboard/Admin/Estimate/EstimateDetilasTableFormat";

type EstimateDetailsPageProps = {
  searchParams: Promise<{
    format?: string;
  }>;
};

export default async function EstimateDetailsPage({
  searchParams,
}: EstimateDetailsPageProps) {
  const params = await searchParams;
  const format = params?.format;

  if (format === "table") {
    return <EstimateDetilasTableFormat />;
  }

  return <EstimateDetailsDescription />;
}
