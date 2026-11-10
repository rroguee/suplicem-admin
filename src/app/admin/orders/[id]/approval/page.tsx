import { OrderApprovalView } from "@/components/orders/approval/OrderApprovalView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderApprovalPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <OrderApprovalView orderId={resolvedParams.id} />;
}
