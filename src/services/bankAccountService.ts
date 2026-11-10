import protectedApi from "./protectedApi";

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  beneficiaryName: string;
  rnc?: string;
  currency?: string;
  isActive?: boolean;
}

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const response = await protectedApi.get("/bank-accounts");
  return Array.isArray(response.data) ? response.data : (response.data?.bankAccounts || []);
};
