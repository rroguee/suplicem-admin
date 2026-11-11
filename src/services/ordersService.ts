import protectedApi from "./protectedApi";

export interface OrdersQueryParams {
  status?: string;
  deliveryType?: string;
  userId?: string;
  sellerId?: string;
  withoutTrip?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export const getOrders = async (params?: OrdersQueryParams) => {
    const response = await protectedApi.get('/orders', { params });
    return response.data;
  };
  
  export const approveOrder = async (id: string, driverId?: string) => {
    const response = await protectedApi.patch(`/orders/${id}/status`, {
      status: "approved",
      driverId: driverId || undefined,
    });
    return response.data;
  };
  
  export const rejectedOrder = async (id: string, reason: string) => {
    const response = await protectedApi.patch(`/orders/${id}/status`, {
      status: "rejected",
      reason: reason,
    });
    return response.data;
  };
  
  export const getOrdersWithStatus = async (status: string) => {
    const response = await protectedApi.get("/orders", {
      params: { status },
    });
    return response.data;
  };

  export const getOrderTracking = async (orderId: string) => {
  const response = await protectedApi.get(`/orders/${orderId}/tracking`);
  return response.data;
};

export interface CreateOrderPayload {
  userId: string;
  createdBySellerId?: string;
  deliveryType: "domicilio" | "recogida";
  deliveryAddress?: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    additionalInfo?: string;
    recipientName?: string;
    recipientDocument?: string;
    recipientDocumentType?: string;
  };
  deliveries?: {
    productId: string;
    quantity: number;
    unit?: string;
    address?: any;
  }[];
  items: {
    productId: string;
    name?: string;
    quantity: number;
    unit?: string;
  }[];
  paymentMethod?: "transfer" | "credit";
  bankAccountId?: string;
  creditNote?: string;
  comments?: string;
}

export const createOrder = async (orderData: CreateOrderPayload, idempotencyKey?: string) => {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }
  const response = await protectedApi.post("/orders", orderData, { headers });
  return response.data;
};

export const getOrderDetail = async (id: string) => {
  const response = await protectedApi.get(`/orders/${id}`);
  return response.data;
};

export const completePickupOrder = async (id: string) => {
  const response = await protectedApi.patch(`/orders/${id}/status`, {
    status: "completed",
  });
  return response.data;
};

export const updateOrderDeliveries = async (
  id: string,
  deliveryType: string,
  deliveries: any[]
) => {
  const response = await protectedApi.patch(`/orders/${id}/deliveries`, {
    deliveryType,
    deliveries,
  });
  return response.data;
};
