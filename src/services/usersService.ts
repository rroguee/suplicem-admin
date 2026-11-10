import protectedApi from "./protectedApi";

export interface User {
  uid: string;
  names: string;
  lastNames: string;
  identification: string;
  identificationType: string;
  identificationImage?: string;
  email: string;
  userType: 'client' | 'driver' | 'admin' | 'seller';
  personType?: 'fisica' | 'juridica';
  companyRnc?: string;
  companyName?: string;
  driverCode?: string;
  sellerCode?: string;
  sellerId?: string;
  sellerName?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'pending' | 'rejected' | 'banned';
  createdAt?: string;
  aiRiskFlag?: boolean;
  aiRiskScore?: number;
  aiRiskReason?: string;
  vehicle?: {
    brand?: string;
    model?: string;
    year?: string | number;
    tons?: string | number;
    plateNumber?: string;
  };
  addresses?: {
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

export interface UserQueryParams {
  status?: string;
  userType?: string;
  aiRiskFlag?: boolean;
}

export const getUsers = async (params?: UserQueryParams) => {
    const response = await protectedApi.get("/users", { params });
    return response.data;
  };
  
export const getUserById = async (id: string) => {
    const response = await protectedApi.get(`/users/${id}`);
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

export const assignClientSeller = async (clientUid: string, sellerId: string | null) => {
    const response = await protectedApi.patch("/users/update", {
      uid: clientUid,
      sellerId: sellerId || null,
    });
    return response.data;
  };

export const updateUserAddresses = async (uid: string, addresses: any[]) => {
  const response = await protectedApi.patch("/users/update", {
    uid,
    addresses,
  });
  return response.data;
};

export interface CreateUserPayload {
  names: string;
  lastNames: string;
  email: string;
  password: string;
  identification: string;
  identificationType?: "Cedula" | "Pasaporte";
  phone: string;
  userType: "client" | "driver" | "admin" | "seller";
  sellerId?: string;
  addresses?: {
    description: string;
    placeId: string;
    latitude?: number;
    longitude?: number;
    additionalInfo?: string;
  }[];
  vehicle?: {
    brand: string;
    model: string;
    year: string;
    tons: string;
    plateNumber: string;
  };
}

export const createUserAccount = async (payload: CreateUserPayload) => {
  const response = await protectedApi.post("/users", payload);
  return response.data;
};
