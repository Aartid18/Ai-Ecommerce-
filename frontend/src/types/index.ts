export type RoleType = 'ADMIN' | 'INVENTORY_MANAGER' | 'ORDER_MANAGER' | 'CUSTOMER';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roles: RoleType[];
  token?: string;
  refreshToken?: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  enabled: boolean;
  roles: string[];
  phone?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  totalOrdersPlaced: number;
  totalSpent: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface ProductSpecification {
  id?: number;
  specKey: string;
  specValue: string;
}

export interface ProductVariant {
  id: number;
  sku: string;
  attributesJson: string;
  priceOverride?: number;
  stock: number;
  weight?: number;
  active: boolean;
}

export type InventoryHealthStatus = 'CRITICAL' | 'LOW_STOCK' | 'HEALTHY' | 'OVERSTOCKED';

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  categoryId?: number;
  categoryName?: string;
  categorySlug?: string;
  brandId?: number;
  brandName?: string;
  price: number;
  costPrice?: number;
  discountPercentage: number;
  finalPrice: number;
  stock: number;
  weight?: number;
  dimensions?: string;
  mainImageUrl: string;
  additionalImages?: string[];
  rating: number;
  reviewCount: number;
  active: boolean;
  inventoryHealthStatus: InventoryHealthStatus;
  inventoryHealthScore: number;
  salesVelocity: number;
  estimatedStockoutDays: number;
  daysSinceLastSale: number;
  reorderPoint: number;
  preOrderEnabled: boolean;
  preOrderExpectedAvailability?: string;
  preOrderCount: number;
  variants: ProductVariant[];
  specifications: ProductSpecification[];
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  mainImageUrl: string;
  variantId?: number;
  variantAttributes?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableStock: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  appliedCouponCode?: string;
  cartInsights: string[];
  amountForFreeDelivery: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURN_REQUESTED' | 'RETURNED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentMethod = 'COD' | 'ONLINE_CARD' | 'UPI';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  variantId?: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatusHistory {
  previousStatus?: OrderStatus;
  newStatus: OrderStatus;
  changedBy: string;
  reason?: string;
  notes?: string;
  timestamp: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  couponCode?: string;
  shippingFee: number;
  taxAmount: number;
  finalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  riskReasons: string[];
  isRiskReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  riskActionNotes?: string;
  estimatedProfit?: number;
  profitMarginPercentage?: number;
  createdAt: string;
  statusHistory?: OrderStatusHistory[];
}

export interface DemandSignal {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  categoryName: string;
  currentPrice: number;
  currentStock: number;
  salesVelocity: number;
  searchCount: number;
  viewCount: number;
  wishlistCount: number;
  priceWatchCount: number;
  cartAddCount: number;
  preOrderInterestCount: number;
  demandScore: number;
  demandTrendPercentage: number;
  status: 'HIGH' | 'MODERATE' | 'LOW';
  targetDemandPriceRange: string;
  recommendedPrice: number;
  recommendedAction: string;
  updatedAt: string;
}

export interface SmartDealRecommendation {
  productId: number;
  productName: string;
  currentPrice: number;
  recommendedPrice: number;
  recommendedDiscountPercentage: number;
  dealReason: string;
  potentialImpact: string;
}

export interface InventoryHealthItem {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  salesVelocity: number;
  estimatedStockoutDays: number;
  reorderPoint: number;
  status: InventoryHealthStatus;
  healthScore: number;
  recommendation: string;
}

export interface DeadStockItem {
  productId: number;
  productName: string;
  sku: string;
  stockQuantity: number;
  unitPrice: number;
  deadStockValue: number;
  daysSinceLastSale: number;
  recommendedAction: string;
}

export interface ReorderRecommendation {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  salesVelocity: number;
  predictedStockoutDays: number;
  recommendedReorderQuantity: number;
  suggestedSupplierId?: number;
  suggestedSupplierName?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  leadTimeDays: number;
  reliabilityScore: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: Supplier;
  product: Product;
  quantity: number;
  unitCost: number;
  status: string;
  expectedDeliveryDate: string;
  receivedAt?: string;
}

export interface InventoryTransaction {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  variantId?: number;
  variantSku?: string;
  quantityBefore: number;
  quantityChange: number;
  quantityAfter: number;
  reason: string;
  notes?: string;
  changedBy: string;
  timestamp: string;
}

export interface PreOrder {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  mainImageUrl: string;
  variantId?: number;
  quantity: number;
  unitPrice: number;
  status: 'PENDING_STOCK' | 'FULFILLED' | 'CANCELLED';
  expectedAvailabilityDate: string;
  createdAt: string;
}

export interface PreOrderDemandSummary {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  totalPreOrdersCount: number;
  expectedRevenue: number;
  recommendedStockQuantity: number;
  recommendedPurchaseQuantity: number;
  expectedAvailabilityDate: string;
  supplierLeadTimeInfo: string;
}

export interface ReturnRequest {
  id: number;
  orderId: number;
  orderNumber: string;
  customerName: string;
  reason: string;
  customNotes?: string;
  evidenceUrl?: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REFUNDED';
  adminDecisionNotes?: string;
  decidedBy?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface PriceWatch {
  id: number;
  product: Product;
  initialPrice: number;
  targetPrice: number;
  isNotified: boolean;
  createdAt: string;
}

export interface Wishlist {
  id: number;
  product: Product;
  createdAt: string;
}

export interface Coupon {
  id: number;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit: number;
  perUserLimit: number;
  timesUsed: number;
  active: boolean;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: number;
  actor: string;
  action: string;
  entityName: string;
  entityId: string;
  beforeStateJson?: string;
  afterStateJson?: string;
  reason?: string;
  timestamp: string;
}

export interface BriefingItem {
  title: string;
  description: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  actionText: string;
  actionPath: string;
}

export interface FinancialSnapshot {
  totalRevenue: number;
  totalCOGS: number;
  totalDiscounts: number;
  totalShippingCosts: number;
  totalReturnsRefunded: number;
  estimatedProfit: number;
  profitMarginPercentage: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface ContributorFactor {
  factorName: string;
  changePercentage: number;
  impactType: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  explanation: string;
}

export interface WhyRevenueChanged {
  periodComparison: string;
  overallChangePercentage: number;
  topContributors: ContributorFactor[];
  primaryRootCause: string;
  aiInsightSummary: string;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  profit: number;
  orders: number;
}

export interface ExecutiveBriefing {
  greeting: string;
  criticalIssues: BriefingItem[];
  opportunities: BriefingItem[];
  financialSnapshot: FinancialSnapshot;
}

export interface CustomerAiRecommendation {
  productId: number;
  productName: string;
  price: number;
  mainImageUrl: string;
  rating: number;
  matchBadge: string;
  whyRecommended: string[];
  tradeOff: string;
  keySpecs: string[];
}

export interface CustomerAiResponse {
  querySummary: string;
  recommendations: CustomerAiRecommendation[];
  aiExplanation: string;
}

export interface SellerActionRecommendation {
  productId?: number;
  productName?: string;
  issueCategory: string;
  recommendationText: string;
  potentialImpact: string;
  actionButtonText: string;
}

export interface SellerAiResponse {
  userQuery: string;
  summaryHeading: string;
  actualDataPoints: string[];
  calculatedMetrics: string[];
  forecasts: string[];
  actionRecommendations: SellerActionRecommendation[];
}

export interface ActivityEvent {
  type: string;
  message: string;
  entityId: string;
  linkUrl: string;
  timestamp: string;
}
