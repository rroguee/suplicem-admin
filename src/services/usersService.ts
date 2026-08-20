import protectedApi from "./protectedApi";

export interface User {
  uid: string;
  names: string;
  lastNames: string;
  identification: string;
  identificationType: string;
  email: string;
  userType: 'client' | 'driver' | 'admin';
  addresses: {
    description: string;
    placeId: string;
    latitude: number;
    longitude: number;
    recipientName?: string;
    recipientDocument?: string;
    recipientDocumentType?: string;
    additionalInfo?: string;
    userUid?: string;
  }[];
}

export const getUsers = async () => {
    const response = await protectedApi.get("/users");
    return response.data;
  };
  
  export const activeOrInactiveUser = async (uid: string, status: string) => {
    const response = await protectedApi.patch("/users/status", {
      uid,
      status,
    });
    console.log("BODY:", response);
    return response.data;
  };