import InvoiceDetailsDescription from "@/components/dashboard/Admin/Invoice/InvoiceDetailsDescription";
import InvoiceDetailsTableFormat from "@/components/dashboard/Admin/Invoice/InvoiceDetailsTableFormat";

type InvoiceDetailsPageProps = {
  searchParams: Promise<{
    format?: string;
  }>;
};

export default async function InvoiceDetailsPage({
  searchParams,
}: InvoiceDetailsPageProps) {
  const params = await searchParams;
  const format = params?.format;

  if (format === "table") {
    return <InvoiceDetailsTableFormat />;
  }

  return <InvoiceDetailsDescription />;
}
