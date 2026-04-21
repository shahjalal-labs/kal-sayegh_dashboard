import InvoiceDetailsDescription from "@/components/dashboard/Admin/Invoice/InvoiceDetailsDescription";
import InvoiceDetailsTableFormat from "@/components/dashboard/Admin/Invoice/InvoiceDetailsTableFormat";

type InvoiceDetailsPageProps = {
  searchParams?: {
    format?: string;
  };
};

export default function InvoiceDetailsPage({
  searchParams,
}: InvoiceDetailsPageProps) {
  const format = searchParams?.format;

  if (format === "table") {
    return <InvoiceDetailsTableFormat />;
  }

  return <InvoiceDetailsDescription />;
}
