import {
  MOCK_CATEGORIES,
  MOCK_BRANDS,
  MOCK_PRODUCTS,
  MOCK_BRIEFING,
  MOCK_WHY_REVENUE,
  MOCK_SALES_TREND,
  MOCK_DEMAND_SIGNALS,
  MOCK_PREORDER_SUMMARIES,
  MOCK_INVENTORY_HEALTH,
  MOCK_DEAD_STOCK,
  MOCK_REORDERS,
  MOCK_ORDERS,
  MOCK_COUPONS,
  MOCK_AUDIT_LOGS,
  MOCK_USERS,
} from './mockData';

export const getMockResponse = (url: string, method: string = 'get', data?: any): any => {
  const cleanUrl = url.replace(/^\/api/, '').split('?')[0];

  if (cleanUrl === '/products/categories' || cleanUrl === '/categories') {
    return MOCK_CATEGORIES;
  }
  if (cleanUrl === '/products/brands' || cleanUrl === '/brands') {
    return MOCK_BRANDS;
  }
  if (cleanUrl.startsWith('/products/') && cleanUrl !== '/products/search') {
    const id = parseInt(cleanUrl.replace('/products/', ''), 10);
    const prod = MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
    return prod;
  }
  if (cleanUrl === '/products' || cleanUrl === '/products/search') {
    return {
      content: MOCK_PRODUCTS,
      totalPages: 1,
      totalElements: MOCK_PRODUCTS.length,
      size: 12,
      number: 0,
    };
  }
  if (cleanUrl.includes('/analytics/executive-briefing') || cleanUrl.includes('/analytics/briefing')) {
    return MOCK_BRIEFING;
  }
  if (cleanUrl.includes('/analytics/why-revenue-changed')) {
    return MOCK_WHY_REVENUE;
  }
  if (cleanUrl.includes('/analytics/sales-trend') || cleanUrl.includes('/analytics/sales-chart')) {
    return MOCK_SALES_TREND;
  }
  if (cleanUrl.includes('/demand-radar/overview') || cleanUrl.includes('/demand-radar')) {
    return MOCK_DEMAND_SIGNALS;
  }
  if (cleanUrl.includes('/preorders/demand-summary')) {
    return MOCK_PREORDER_SUMMARIES;
  }
  if (cleanUrl.includes('/preorders/all-pending') || cleanUrl.includes('/preorders/my-preorders')) {
    return [];
  }
  if (cleanUrl.includes('/inventory/health-scorecard') || cleanUrl.includes('/inventory/health')) {
    return MOCK_INVENTORY_HEALTH;
  }
  if (cleanUrl.includes('/inventory/dead-stock')) {
    return MOCK_DEAD_STOCK;
  }
  if (cleanUrl.includes('/inventory/reorders') || cleanUrl.includes('/inventory/reorder-recommendations')) {
    return MOCK_REORDERS;
  }
  if (cleanUrl.includes('/orders/manage/high-risk') || cleanUrl.includes('/orders/high-risk')) {
    return [MOCK_ORDERS[1]];
  }
  if (cleanUrl.includes('/orders/manage') || cleanUrl.includes('/orders/my-orders') || cleanUrl === '/orders') {
    return MOCK_ORDERS;
  }
  if (cleanUrl.includes('/coupons')) {
    return MOCK_COUPONS;
  }
  if (cleanUrl.includes('/events/audit-logs') || cleanUrl.includes('/audit-logs')) {
    return MOCK_AUDIT_LOGS;
  }
  if (cleanUrl.includes('/admin/users') || cleanUrl.includes('/users')) {
    return { content: MOCK_USERS, totalPages: 1, totalElements: MOCK_USERS.length };
  }
  if (cleanUrl.includes('/recommendations/personalized')) {
    return MOCK_PRODUCTS.slice(0, 4);
  }
  if (cleanUrl.includes('/recommendations/frequently-bought-together')) {
    return [MOCK_PRODUCTS[4], MOCK_PRODUCTS[6]];
  }
  if (cleanUrl.includes('/cart')) {
    return {
      id: 1,
      items: [],
      totalAmount: 0,
      discountAmount: 0,
      finalAmount: 0,
      cartInsights: ['Add ₹999 or more for FREE express shipping!'],
      amountForFreeDelivery: 999,
    };
  }
  if (cleanUrl.includes('/price-watches') || cleanUrl.includes('/price-watch')) {
    return [];
  }
  if (cleanUrl.includes('/returns/my-returns') || cleanUrl.includes('/returns/manage')) {
    return [];
  }
  if (cleanUrl.includes('/events/notifications') || cleanUrl.includes('/notifications/my') || cleanUrl.includes('/notifications')) {
    return [];
  }
  if (cleanUrl.includes('/ai/customer/recommendations')) {
    return {
      replyText: "Based on your requirements, here are our top AI-matched products with grounded spec trade-offs:",
      recommendations: [
        {
          productId: 1,
          productName: "Lenovo ThinkPad X1 Carbon Gen 11",
          price: 157249.0,
          whyRecommended: ["Ultra-portable 1.12kg body with military-grade durability", "32GB LPDDR5 RAM for heavy multitasking and compilation"],
          tradeOff: "Premium price tier, but unmatched keyboard and Linux/Docker performance.",
          keySpecs: ["Intel Core i7-1365U", "32GB RAM", "1TB Gen4 SSD", "2.8K OLED Display"],
          rating: 4.8,
          inStock: true
        }
      ]
    };
  }
  if (cleanUrl.includes('/ai/seller/analyze')) {
    return {
      query: data?.query || "Operations Analysis",
      summary: "Inventory and sales telemetry indicate positive velocity with 2 critical stockout risks within 5 days.",
      actualDataPoints: [
        "Dell 7-in-1 Hub has 6 units remaining (Velocity: 2.1 units/day).",
        "Keychron Q1 Pro is at 0 units with 8 customer pre-orders waiting."
      ],
      actionRecommendations: [
        "Issue PO for 25 units of Dell Hub to avoid stockout in 3 days.",
        "Expedite supplier delivery for 32 units of Keychron Q1 Pro."
      ]
    };
  }

  return { message: 'Success' };
};
