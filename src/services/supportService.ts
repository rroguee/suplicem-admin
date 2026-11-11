import protectedApi from "./protectedApi";

export interface SupportConfig {
  whatsapp: string;
  whatsappMessage: string;
  phone: string;
  email: string;
  scheduleWeekday: string;
  scheduleSaturday: string;
  scheduleSunday: string;
  updatedAt?: string;
  updatedBy?: string;
}

export const getSupportConfig = async (): Promise<SupportConfig> => {
  const response = await protectedApi.get("/config/support");
  return response.data?.data;
};

export const updateSupportConfig = async (
  payload: Omit<SupportConfig, "updatedAt" | "updatedBy">
): Promise<void> => {
  await protectedApi.put("/config/support", payload);
};
