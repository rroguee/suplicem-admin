export interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Address {
  longitude: number;
  description: string;
  placeId: string;
  latitude: number;
  additionalInfo?: string;
  recipientName?: string;
  recipientDocument?: string;
  recipientDocumentType?: 'Cédula' | 'Pasaporte' | string;
  userUid?: string;
}

export interface OrderDelivery {
  productId: string;
  address: Address;
  quantity: number;
  unit: string;
  status?: 'delivered' | 'pending' | string;
  images?: string[];
  delivered?: boolean;
  availableAddresses?: Address[];
  id: string;
}

export interface ServiceOrder {
  id: string;
  orderNumber: number;
  userId: string;
  deliveryType: string;
  items: OrderItem[];
  comments?: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'cancelled' | 'rejected' | 'on_the_way' | 'completed' | string;
  deliveryAddress?: Address;
  deliveries?: OrderDelivery[];
  tripId?: string;
  userNames: string;
  userLastNames: string;
  userPhone?: string;
  userEmail?: string;
  declineReason?: string;
  rejectionReason?: string;
  totalTons?: number;
  deliveredTons?: number;
  pendingBalance?: number;
  paymentMethod?: 'transfer' | 'credit' | string;
  receiptUrl?: string;
  transferReceipt?: string;
  aiRiskFlag?: boolean;
}

export interface EditableDelivery {
  id: string;
  productId: string;
  address: Address;
  quantity: number;
  unit: string;
  availableAddresses: Address[];
}

export type { AlertConfig } from '@/components/CustomAlert';
