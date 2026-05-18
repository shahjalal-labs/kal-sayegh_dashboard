import InvoiceDetails from "@/components/dashboard/Admin/Invoice/InvoiceDetails";

type InvoiceDetailsPageProps = {
  searchParams: Promise<{
    format?: string;
  }>;
};

export default async function InvoiceDetailsPage({
  searchParams,
}: InvoiceDetailsPageProps) {
  const params = await searchParams;
  return <InvoiceDetails format={params?.format} />;
}
