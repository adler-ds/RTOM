export interface GeniusTransaction {
  transactionId: string;
  storeId: string;
  terminalId: string;
  timestamp: string;
  customerId?: string;
  customerPhone?: string;
  customerEmail?: string;
  totalAmount: number;
  subtotal: number;
  tax: number;
  tip?: number;
  discount?: number;
  paymentMethod: string;
  items: GeniusLineItem[];
  status: 'completed' | 'voided' | 'refunded';
}

export interface GeniusLineItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  categoryId?: string;
  categoryName?: string;
  modifiers?: GeniusModifier[];
}

export interface GeniusModifier {
  modifierId: string;
  modifierName: string;
  price: number;
}

export interface GeniusCustomer {
  customerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  loyaltyNumber?: string;
}

export interface GeniusWebhookPayload {
  eventType: 'transaction.created' | 'transaction.updated' | 'transaction.voided';
  eventId: string;
  timestamp: string;
  data: GeniusTransaction;
}
