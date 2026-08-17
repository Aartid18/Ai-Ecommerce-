package com.commerce.intelligence;

import com.commerce.intelligence.dto.AuthDTOs.LoginRequest;
import com.commerce.intelligence.dto.AuthDTOs.RegisterRequest;
import com.commerce.intelligence.dto.CartDTOs.AddToCartRequest;
import com.commerce.intelligence.dto.DemandDTOs.ApplyPromotionRequest;
import com.commerce.intelligence.dto.OrderDTOs.CheckoutRequest;
import com.commerce.intelligence.model.Product;
import com.commerce.intelligence.model.enums.InventoryTransactionReason;
import com.commerce.intelligence.model.enums.PaymentMethod;
import com.commerce.intelligence.model.enums.RoleType;
import com.commerce.intelligence.repository.ProductRepository;
import com.commerce.intelligence.repository.UserRepository;
import com.commerce.intelligence.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class CommerceIntelligenceTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private InventoryService inventoryService;

    @Autowired
    private DemandRadarService demandRadarService;

    @Autowired
    private CartService cartService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private PreOrderService preOrderService;

    @Autowired
    private CustomerAiService customerAiService;

    @Autowired
    private SellerAiService sellerAiService;

    @Autowired
    private CouponService couponService;

    @Test
    @DisplayName("1. User Registration & Authentication Flow")
    void testUserAuthFlow() throws Exception {
        RegisterRequest register = new RegisterRequest();
        register.setUsername("testuser99");
        register.setEmail("testuser99@example.com");
        register.setPassword("Password@123");
        register.setFullName("Test User 99");
        register.setRoles(Set.of(RoleType.CUSTOMER));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("successfully")));

        LoginRequest login = new LoginRequest("testuser99", "Password@123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.username", is("testuser99")));
    }

    @Test
    @DisplayName("2. Product Search & Catalog Filtering")
    void testProductFiltering() throws Exception {
        mockMvc.perform(get("/api/products")
                        .param("search", "ThinkPad")
                        .param("minPrice", "50000")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.content[0].name", containsString("ThinkPad")));
    }

    @Test
    @DisplayName("3. Inventory Health & Stockout Calculation")
    void testInventoryHealthMetrics() {
        Product p = productRepository.findBySku("ACC-DELL-HUB7").orElseThrow();
        assertEquals(6, p.getStock());
        assertTrue(p.getEstimatedStockoutDays() <= 3);

        inventoryService.recordStockChange(p, null, 10, InventoryTransactionReason.MANUAL_ADJUSTMENT, "Stock added for test", "ADMIN");

        Product updated = productRepository.findById(p.getId()).orElseThrow();
        assertEquals(16, updated.getStock());
    }

    @Test
    @DisplayName("4. Demand Radar & Smart Deal Engine")
    void testDemandRadarAndPromotion() {
        Product headphones = productRepository.findBySku("AUD-BOSE-STUDIO").orElseThrow();
        double originalPrice = headphones.getFinalPrice();

        ApplyPromotionRequest promo = new ApplyPromotionRequest(headphones.getId(), 2599.0, null, "Test promotion");
        Product promoted = demandRadarService.applySmartDealPromotion(promo, "ADMIN");

        assertEquals(2599.0, promoted.getFinalPrice());
        assertTrue(promoted.getFinalPrice() < originalPrice);
    }

    @Test
    @DisplayName("5. Cart Intelligence & Order Checkout with Risk Calculation")
    void testCartAndCheckoutFlow() {
        var user = userRepository.findByUsername("customer1").orElseThrow();
        Product product = productRepository.findBySku("LAP-THINK-X1").orElseThrow();

        AddToCartRequest addReq = new AddToCartRequest(product.getId(), null, 1);
        var cartResp = cartService.addToCart(user.getId(), addReq);

        assertNotNull(cartResp);
        assertEquals(1, cartResp.getItems().size());
        assertTrue(cartResp.getFinalAmount() > 0);

        CheckoutRequest checkout = new CheckoutRequest();
        checkout.setCustomerName("Alex Johnson");
        checkout.setCustomerEmail("alex.johnson@example.com");
        checkout.setPhone("+91 98765 43210");
        checkout.setShippingAddress("42 Tech Park Avenue, Bengaluru");
        checkout.setPaymentMethod(PaymentMethod.COD);
        checkout.setFailedPaymentAttempts(0);

        var order = orderService.createOrderFromCart(user.getId(), checkout);
        assertNotNull(order);
        assertNotNull(order.getOrderNumber());
        assertTrue(order.getEstimatedProfit() > 0);
        assertNotNull(order.getRiskScore());
    }

    @Test
    @DisplayName("6. Smart Pre-Order Demand Allocation & Buffer Calculation")
    void testPreOrderDemandCalculationAndFulfillment() {
        Product keyboard = productRepository.findBySku("GAM-KEYC-Q1PRO").orElseThrow();
        var summary = preOrderService.getPreOrderDemandSummary(keyboard.getId());

        assertNotNull(summary);
        assertEquals(keyboard.getId(), summary.getProductId());
        assertTrue(summary.getRecommendedPurchaseQuantity() > 0);
        assertTrue(summary.getRecommendedStockQuantity() >= summary.getTotalPreOrdersCount());

        // Test bulk summary retrieval
        var allSummaries = preOrderService.getAllPreOrderDemandSummaries();
        assertFalse(allSummaries.isEmpty());
    }

    @Test
    @DisplayName("7. Dead Stock Detection & Tied Capital Calculation")
    void testDeadStockDetection() {
        var deadStockList = inventoryService.getDeadStockAnalytics(30);
        assertNotNull(deadStockList);
        assertFalse(deadStockList.isEmpty());
        assertTrue(deadStockList.stream().anyMatch(d -> d.getSku().equals("ERG-BOSE-CUSHION")));
    }

    @Test
    @DisplayName("8. High-Risk Order Detection and Manual Review Flow")
    void testHighRiskOrderFlaggingAndReview() {
        var user = userRepository.findByUsername("customer2").orElseThrow();
        Product product = productRepository.findBySku("WEA-APPL-ULTRA2").orElseThrow();

        cartService.addToCart(user.getId(), new AddToCartRequest(product.getId(), null, 1));

        CheckoutRequest highRiskCheckout = new CheckoutRequest();
        highRiskCheckout.setCustomerName("Priya Sharma");
        highRiskCheckout.setCustomerEmail("priya.sharma@example.com");
        highRiskCheckout.setPhone("+91 98234 56789");
        highRiskCheckout.setShippingAddress("Unknown Remote Island Suite 404");
        highRiskCheckout.setPaymentMethod(PaymentMethod.COD);
        highRiskCheckout.setFailedPaymentAttempts(4); // Trigger high risk

        var order = orderService.createOrderFromCart(user.getId(), highRiskCheckout);
        assertNotNull(order);
        assertTrue(order.getRiskScore() >= 50);

        var highRiskList = orderService.getHighRiskOrders();
        assertFalse(highRiskList.isEmpty());

        // Perform manual review
        var reviewReq = new com.commerce.intelligence.dto.OrderDTOs.RiskReviewRequest(
                "APPROVE", "Verified customer identity via phone"
        );
        var reviewedOrder = orderService.reviewOrderRisk(order.getId(), reviewReq, "order_mgr");
        assertTrue(reviewedOrder.getIsRiskReviewed());
        assertEquals("order_mgr", reviewedOrder.getReviewedBy());
    }

    @Test
    @DisplayName("9. Customer AI Copilot Grounded Spec Recommendations")
    void testCustomerAiCopilotGroundedRecommendations() {
        var req = new com.commerce.intelligence.dto.AiDTOs.CustomerAiQueryRequest(
                "I need a laptop for coding under ₹70,000 with good RAM",
                70000.0,
                null
        );
        var response = customerAiService.getShoppingRecommendations(req);

        assertNotNull(response);
        assertFalse(response.getRecommendations().isEmpty());
        assertTrue(response.getRecommendations().get(0).getPrice() <= 70000.0);
        assertNotNull(response.getRecommendations().get(0).getTradeOff());
    }

    @Test
    @DisplayName("10. Seller AI Copilot Operational Insights")
    void testSellerAiCopilotOperationalQueries() {
        var req = new com.commerce.intelligence.dto.AiDTOs.SellerAiQueryRequest(
                "Which products are at risk of stockout next week?"
        );
        var response = sellerAiService.analyzeSellerQuery(req);

        assertNotNull(response);
        assertFalse(response.getActualDataPoints().isEmpty());
        assertFalse(response.getActionRecommendations().isEmpty());
    }

    @Test
    @DisplayName("11. Coupon Validation and Usage Rules")
    void testCouponValidationAndApplication() {
        var coupon = couponService.validateCoupon("WELCOME10", 1L, 2000.0);
        assertNotNull(coupon);
        assertTrue(coupon.getValid());
        assertEquals(200.0, coupon.getCalculatedDiscountAmount()); // 10% of 2000
    }
}
