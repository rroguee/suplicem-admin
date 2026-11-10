import protectedApi from "./protectedApi";

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'current';
  currency: string;
  routingNumber?: string;
  swiftCode?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateBankAccountPayload {
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  accountType: 'savings' | 'checking' | 'current';
  currency: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface UpdateBankAccountPayload extends Partial<CreateBankAccountPayload> {
  isActive?: boolean;
}

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const response = await protectedApi.get('/bank-accounts');
  return response.data;
};

export const createBankAccount = async (payload: CreateBankAccountPayload): Promise<BankAccount> => {
  const response = await protectedApi.post('/bank-accounts', payload);
  return response.data;
};

export const updateBankAccount = async (
  id: string,
  payload: UpdateBankAccountPayload
): Promise<BankAccount> => {
  const response = await protectedApi.patch(`/bank-accounts/${id}`, payload);
  return response.data;
};

export const deleteBankAccount = async (id: string): Promise<void> => {
  await protectedApi.delete(`/bank-accounts/${id}`);
};
