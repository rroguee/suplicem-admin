import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ search?: string }>;
}

export default async function OrdersRedirectPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.search ? `?search=${encodeURIComponent(params.search)}` : "";
  redirect(`/admin/basic-tables${query}`);
}
