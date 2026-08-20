import protectedApi from "./protectedApi";

export const getOrders = async () => {
    const response = await protectedApi.get('/orders');
    return response.data;
  };
  
  export const approveOrder = async (id: string) => {
    const response = await protectedApi.patch(`/orders/${id}/status`, {
      status: "approved",
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