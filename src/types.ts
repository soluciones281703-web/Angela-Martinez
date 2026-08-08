export type ProductCategory = 'perfumes' | 'splash' | 'cremas' | 'lociones' | string;

export interface ScentNotes {
  top?: string;
  heart?: string;
  base?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  description: string;
  volume: string; // e.g. '100 ml', '250 ml', '8.4 oz'
  scentNotes?: ScentNotes;
  image: string;
  additionalImages?: string[];
  inStock: boolean;
  stockCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  badgeText?: string;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type DeliveryZone = string;

export interface DeliveryZoneOption {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface CategoryOption {
  id: string;
  label: string;
  icon?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  province: string;
  district: string;
  address: string;
  deliveryZone: DeliveryZone;
  notes?: string;
}

export type OrderStatus = 'pending' | 'verified' | 'shipped' | 'completed' | 'cancelled';

export interface YappyTransaction {
  id: string; // e.g. ORD-83921
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  yappyPhone: string;
  transactionRef: string; // Yappy reference number entered by user
  receiptImage?: string; // image proof base64 or URL
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface StoreConfig {
  storeName: string;
  storeTitle?: string;
  storeSubtitle?: string;
  logoUrl?: string;
  bannerMessage: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl: string;
  
  // Yappy Container Options
  showYappyContainer?: boolean;
  yappyContainerTitle?: string;
  yappyContainerBox1Title?: string;
  yappyContainerBox1Text?: string;
  yappyContainerBox2Title?: string;
  yappyContainerBox2Text?: string;
  yappyContainerBox3Title?: string;
  yappyContainerBox3Text?: string;

  // Yappy details
  yappyPhone: string;
  yappyName: string;
  yappyQrUrl?: string;
  whatsappNumber: string;
  currencySymbol: string;

  // Delivery Zones Config
  deliveryZones?: DeliveryZoneOption[];
  deliveryRates: Record<string, number>;

  // Custom Categories Config
  categoryOptions?: CategoryOption[];

  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export interface AdminSession {
  isAuthenticated: boolean;
  username: string;
  token?: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  sender: 'customer' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface ChatThread {
  id: string;
  customerName: string;
  customerPhone?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCountAdmin: number;
  unreadCountCustomer: number;
  status: 'active' | 'closed';
  createdAt: string;
}

