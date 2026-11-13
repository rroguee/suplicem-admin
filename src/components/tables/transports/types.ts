export interface OrderItem {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDelivery {
  productId: string;
  address: {
    longitude: number;
    description: string;
    placeId: string;
    latitude: number;
  };
  quantity: number;
  unit: string;
  status: 'delivered' | 'pending' | string;
  imageUrl?: string;
  delivered?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  deliveryType: string;
  items: OrderItem[];
  comments: string;
  createdAt: string;
  status: 'approved' | 'pending' | 'canceled' | string;
  deliveries?: OrderDelivery[];
  userNames: string;
  userLastNames: string;
  userPhone: string;
}

export interface ApprovedOrder extends Order {
  tripId?: string;
}

export interface Driver {
  uid: string;
  names: string;
  lastNames: string;
  phone: string;
}

export interface Trip {
  id: string;
  tripNumber: string;
  orderIds: string[];
  comments: string;
  totalTons: number;
  status:
    | 'available'
    | 'assigned'
    | 'accepted'
    | 'started'
    | 'in_progress'
    | 'completed'
    | 'canceled'
    | 'rejected'
    | null;
  createdAt: string;
  assignedDriverId?: string;
  driver?: Driver;
  orders?: Order[];
}

export type TripFilterStatus =
  | 'Todos'
  | 'available'
  | 'accepted'
  | 'fractional'
  | 'completed'
  | 'canceled';

export type { AlertConfig } from '@/components/CustomAlert';

export const isTripFractional = (tripNumber?: string): boolean => {
  if (!tripNumber) return false;
  return /-\d+$/.test(tripNumber.trim());
};
