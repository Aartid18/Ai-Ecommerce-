package com.commerce.intelligence.config;

import com.commerce.intelligence.model.*;
import com.commerce.intelligence.model.enums.*;
import com.commerce.intelligence.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CustomerProfileRepository profileRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductSpecificationRepository specRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final CouponRepository couponRepository;
    private final DemandSignalRepository demandSignalRepository;
    private final BrowsingEventRepository browsingEventRepository;
    private final WishlistRepository wishlistRepository;
    private final PriceWatchRepository priceWatchRepository;
    private final PreOrderRepository preOrderRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final PaymentRepository paymentRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder encoder;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            log.info("Database already seeded with demo data.");
            return;
        }

        log.info("Seeding initial enterprise dataset for AI Commerce Intelligence Platform...");

        // 1. Seed Users & Roles
        User admin = User.builder()
                .username("admin")
                .email("admin@commerce.ai")
                .password(encoder.encode("admin123"))
                .fullName("System Administrator")
                .enabled(true)
                .roles(Set.of(RoleType.ADMIN, RoleType.INVENTORY_MANAGER, RoleType.ORDER_MANAGER))
                .build();
        userRepository.save(admin);

        User inventoryMgr = User.builder()
                .username("inventory_mgr")
                .email("inventory@commerce.ai")
                .password(encoder.encode("manager123"))
                .fullName("Sarah Chen (Inventory Lead)")
                .enabled(true)
                .roles(Set.of(RoleType.INVENTORY_MANAGER))
                .build();
        userRepository.save(inventoryMgr);

        User orderMgr = User.builder()
                .username("order_mgr")
                .email("orders@commerce.ai")
                .password(encoder.encode("manager123"))
                .fullName("Marcus Vance (Fulfillment Ops)")
                .enabled(true)
                .roles(Set.of(RoleType.ORDER_MANAGER))
                .build();
        userRepository.save(orderMgr);

        User customer1 = User.builder()
                .username("customer1")
                .email("alex.johnson@example.com")
                .password(encoder.encode("customer123"))
                .fullName("Alex Johnson")
                .enabled(true)
                .roles(Set.of(RoleType.CUSTOMER))
                .build();
        userRepository.save(customer1);

        CustomerProfile profile1 = CustomerProfile.builder()
                .user(customer1)
                .phone("+91 98765 43210")
                .addressLine1("42 Tech Park Avenue, Koramangala")
                .city("Bengaluru")
                .state("Karnataka")
                .zipCode("560034")
                .totalOrdersPlaced(4)
                .totalSpent(78490.0)
                .totalReturns(0)
                .build();
        profileRepository.save(profile1);

        User customer2 = User.builder()
                .username("customer2")
                .email("priya.sharma@example.com")
                .password(encoder.encode("customer123"))
                .fullName("Priya Sharma")
                .enabled(true)
                .roles(Set.of(RoleType.CUSTOMER))
                .build();
        userRepository.save(customer2);

        CustomerProfile profile2 = CustomerProfile.builder()
                .user(customer2)
                .phone("+91 98234 56789")
                .addressLine1("12 Sea Breeze Towers, Bandra West")
                .city("Mumbai")
                .state("Maharashtra")
                .zipCode("400050")
                .totalOrdersPlaced(2)
                .totalSpent(34200.0)
                .totalReturns(1)
                .build();
        profileRepository.save(profile2);

        // 2. Seed Categories
        Category catLaptops = categoryRepository.save(Category.builder().name("Laptops & Computers").slug("laptops-computers").description("High-performance developer laptops, ultrabooks, and workstations").build());
        Category catAudio = categoryRepository.save(Category.builder().name("Audio & Headphones").slug("audio-headphones").description("Studio headphones, noise-cancelling earbuds, and DACs").build());
        Category catWearables = categoryRepository.save(Category.builder().name("Smart Wearables").slug("smart-wearables").description("Smartwatches, fitness rings, and health trackers").build());
        Category catAccessories = categoryRepository.save(Category.builder().name("Mobile & PC Accessories").slug("mobile-accessories").description("USB hubs, GaN chargers, cables, and ergonomic stands").build());
        Category catGaming = categoryRepository.save(Category.builder().name("Gaming Gear").slug("gaming-gear").description("Mechanical keyboards, ultra-light mice, and pro controllers").build());
        Category catErgonomics = categoryRepository.save(Category.builder().name("Office Ergonomics").slug("office-ergonomics").description("Ergonomic cushions, footrests, and desk organizers").build());

        // 3. Seed Brands
        Brand brandApple = brandRepository.save(Brand.builder().name("Apple").build());
        Brand brandDell = brandRepository.save(Brand.builder().name("Dell").build());
        Brand brandLenovo = brandRepository.save(Brand.builder().name("Lenovo").build());
        Brand brandSony = brandRepository.save(Brand.builder().name("Sony").build());
        Brand brandBose = brandRepository.save(Brand.builder().name("Bose").build());
        Brand brandLogitech = brandRepository.save(Brand.builder().name("Logitech").build());
        Brand brandRazer = brandRepository.save(Brand.builder().name("Razer").build());
        Brand brandKeychron = brandRepository.save(Brand.builder().name("Keychron").build());

        // 4. Seed Suppliers
        Supplier supTech = supplierRepository.save(Supplier.builder().name("TechSupply Global Ltd").contactPerson("Robert Miller").email("supply@techsupply.com").phone("+1 800 555 0199").leadTimeDays(7).reliabilityScore(98.0).build());
        Supplier supApex = supplierRepository.save(Supplier.builder().name("Apex Electronics Direct").contactPerson("Kavita Rao").email("orders@apexdirect.in").phone("+91 22 6677 8899").leadTimeDays(5).reliabilityScore(96.0).build());
        Supplier supAudio = supplierRepository.save(Supplier.builder().name("AudioWave Components").contactPerson("Hans Gruber").email("hans@audiowave.de").phone("+49 30 123456").leadTimeDays(10).reliabilityScore(99.0).build());

        // 5. Seed Products with Specs, Variants, Stock, Velocity
        // Product 1: Developer Laptop
        Product p1 = Product.builder()
                .name("ThinkPad Ultra X1 Developer Laptop")
                .sku("LAP-THINK-X1")
                .description("Flagship developer workstation featuring 13th Gen Intel Core i7, 16GB LPDDR5 RAM, 1TB NVMe Gen4 SSD, and brilliant 2.8K OLED display. Optimized for Linux and heavy IDE compiling workloads.")
                .category(catLaptops)
                .brand(brandLenovo)
                .price(74999.0)
                .costPrice(48000.0)
                .discountPercentage(9.33)
                .finalPrice(67999.0)
                .stock(22)
                .reorderPoint(15)
                .safetyStock(10)
                .salesVelocity(3.5)
                .estimatedStockoutDays(6)
                .daysSinceLastSale(1)
                .inventoryHealthStatus(InventoryHealthStatus.HEALTHY)
                .inventoryHealthScore(85)
                .rating(4.8)
                .reviewCount(142)
                .mainImageUrl("https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80")
                .additionalImages(List.of("https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"))
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p1);

        specRepository.save(ProductSpecification.builder().product(p1).specKey("RAM").specValue("16GB LPDDR5 6400MHz").build());
        specRepository.save(ProductSpecification.builder().product(p1).specKey("SSD").specValue("1TB PCIe 4.0 NVMe M.2").build());
        specRepository.save(ProductSpecification.builder().product(p1).specKey("CPU").specValue("Intel Core i7-13700H (14 Cores, up to 5.0 GHz)").build());
        specRepository.save(ProductSpecification.builder().product(p1).specKey("Display").specValue("14.0\" 2.8K OLED 90Hz HDR 500").build());
        specRepository.save(ProductSpecification.builder().product(p1).specKey("Battery").specValue("57Wh Fast-Charging (up to 12 hrs)").build());

        // Product 2: MacBook Pro M3
        Product p2 = Product.builder()
                .name("MacBook Pro 16\" M3 Max")
                .sku("LAP-APPL-M3M")
                .description("Unmatched performance for machine learning, 3D rendering, and native development with Apple M3 Max 14-core CPU, 30-core GPU, and Liquid Retina XDR display.")
                .category(catLaptops)
                .brand(brandApple)
                .price(189900.0)
                .costPrice(130000.0)
                .discountPercentage(10.5)
                .finalPrice(169990.0)
                .stock(8)
                .reorderPoint(10)
                .safetyStock(5)
                .salesVelocity(1.2)
                .estimatedStockoutDays(7)
                .daysSinceLastSale(2)
                .inventoryHealthStatus(InventoryHealthStatus.LOW_STOCK)
                .inventoryHealthScore(48)
                .rating(4.9)
                .reviewCount(89)
                .mainImageUrl("https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p2);

        specRepository.save(ProductSpecification.builder().product(p2).specKey("RAM").specValue("36GB Unified Memory").build());
        specRepository.save(ProductSpecification.builder().product(p2).specKey("SSD").specValue("1TB Ultra-fast SSD").build());
        specRepository.save(ProductSpecification.builder().product(p2).specKey("CPU").specValue("Apple M3 Max 14-core").build());
        specRepository.save(ProductSpecification.builder().product(p2).specKey("Display").specValue("16.2\" Liquid Retina XDR 120Hz ProMotion").build());

        // Product 3: Dell XPS 15
        Product p3 = Product.builder()
                .name("Dell XPS 15 InfinityEdge")
                .sku("LAP-DELL-XPS15")
                .description("Sleek aluminum chassis with 13th Gen Intel i7, 16GB RAM, 512GB SSD, NVIDIA RTX 4050 graphics, and 15.6\" FHD+ 500-nit display.")
                .category(catLaptops)
                .brand(brandDell)
                .price(69999.0)
                .costPrice(46000.0)
                .discountPercentage(7.85)
                .finalPrice(64499.0)
                .stock(18)
                .reorderPoint(12)
                .safetyStock(8)
                .salesVelocity(2.1)
                .estimatedStockoutDays(9)
                .daysSinceLastSale(1)
                .inventoryHealthStatus(InventoryHealthStatus.HEALTHY)
                .inventoryHealthScore(82)
                .rating(4.6)
                .reviewCount(118)
                .mainImageUrl("https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p3);

        specRepository.save(ProductSpecification.builder().product(p3).specKey("RAM").specValue("16GB DDR5 4800MHz").build());
        specRepository.save(ProductSpecification.builder().product(p3).specKey("SSD").specValue("512GB PCIe NVMe SSD").build());
        specRepository.save(ProductSpecification.builder().product(p3).specKey("CPU").specValue("Intel Core i7-13620H").build());

        // Product 4: Sony WH-1000XM5
        Product p4 = Product.builder()
                .name("Sony WH-1000XM5 Wireless ANC Headphones")
                .sku("AUD-SONY-XM5")
                .description("Industry-leading active noise cancellation powered by two processors and 8 microphones. Hi-Res Audio wireless, 30-hour battery, and ultra-comfortable lightweight design.")
                .category(catAudio)
                .brand(brandSony)
                .price(34990.0)
                .costPrice(21000.0)
                .discountPercentage(14.29)
                .finalPrice(29990.0)
                .stock(14)
                .reorderPoint(15)
                .safetyStock(8)
                .salesVelocity(4.2)
                .estimatedStockoutDays(4)
                .daysSinceLastSale(1)
                .inventoryHealthStatus(InventoryHealthStatus.LOW_STOCK)
                .inventoryHealthScore(52)
                .rating(4.9)
                .reviewCount(320)
                .mainImageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p4);

        // Product 5: Signature Scenario #1 Headphones (Wireless Studio Headphones - Target of Price Watch)
        Product p5 = Product.builder()
                .name("Wireless Noise-Cancelling Over-Ear Studio Headphones")
                .sku("AUD-BOSE-STUDIO")
                .description("Premium acoustic architecture with customizable ANC modes, plush protein leather earcups, and high-fidelity 40mm dynamic drivers. Highly watched by customers.")
                .category(catAudio)
                .brand(brandBose)
                .price(3699.0)
                .costPrice(1900.0)
                .discountPercentage(13.5)
                .finalPrice(3199.0)
                .stock(83)
                .reorderPoint(25)
                .safetyStock(15)
                .salesVelocity(4.5)
                .estimatedStockoutDays(18)
                .daysSinceLastSale(1)
                .inventoryHealthStatus(InventoryHealthStatus.HEALTHY)
                .inventoryHealthScore(90)
                .rating(4.7)
                .reviewCount(412)
                .mainImageUrl("https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p5);

        // Product 6: Signature Scenario #3 Mouse (Logitech MX Master 3S)
        Product p6 = Product.builder()
                .name("Logitech MX Master 3S Wireless Mouse")
                .sku("ACC-LOGI-MX3S")
                .description("Ergonomic performance mouse with 8K DPI track-on-glass sensor, Quiet Clicks, and MagSpeed electromagnetic scrolling wheel. Connects to 3 devices simultaneously.")
                .category(catAccessories)
                .brand(brandLogitech)
                .price(10995.0)
                .costPrice(5500.0)
                .discountPercentage(13.6)
                .finalPrice(9495.0)
                .stock(150)
                .reorderPoint(20)
                .safetyStock(10)
                .salesVelocity(3.2)
                .estimatedStockoutDays(47)
                .daysSinceLastSale(4)
                .inventoryHealthStatus(InventoryHealthStatus.OVERSTOCKED)
                .inventoryHealthScore(65)
                .rating(4.8)
                .reviewCount(254)
                .mainImageUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p6);

        // Product 7: MX Mechanical Keyboard
        Product p7 = Product.builder()
                .name("Logitech MX Mechanical Wireless Keyboard")
                .sku("GAM-LOGI-MECH")
                .description("Low-profile mechanical keys with tactile quiet switches, smart backlighting, dual-color keycaps, and multi-OS Bluetooth connectivity.")
                .category(catGaming)
                .brand(brandLogitech)
                .price(16995.0)
                .costPrice(9000.0)
                .discountPercentage(11.76)
                .finalPrice(14995.0)
                .stock(35)
                .reorderPoint(15)
                .safetyStock(8)
                .salesVelocity(2.8)
                .estimatedStockoutDays(13)
                .daysSinceLastSale(2)
                .inventoryHealthStatus(InventoryHealthStatus.HEALTHY)
                .inventoryHealthScore(80)
                .rating(4.7)
                .reviewCount(96)
                .mainImageUrl("https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p7);

        // Product 8: Signature Scenario #2 Pre-Order Product (Keychron Q1 Pro)
        Product p8 = Product.builder()
                .name("Keychron Q1 Pro Custom Mechanical Keyboard")
                .sku("GAM-KEYC-Q1PRO")
                .description("Full CNC machined aluminum custom keyboard with hot-swappable switches, double-gasket acoustic design, wireless QMK/VIA support, and south-facing RGB.")
                .category(catGaming)
                .brand(brandKeychron)
                .price(18999.0)
                .costPrice(11000.0)
                .discountPercentage(13.16)
                .finalPrice(16499.0)
                .stock(0) // OUT OF STOCK
                .reorderPoint(25)
                .safetyStock(15)
                .salesVelocity(4.0)
                .estimatedStockoutDays(0)
                .daysSinceLastSale(14)
                .inventoryHealthStatus(InventoryHealthStatus.CRITICAL)
                .inventoryHealthScore(10)
                .rating(4.9)
                .reviewCount(178)
                .mainImageUrl("https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(true)
                .preOrderExpectedAvailability("15 Days")
                .preOrderCount(127)
                .build();
        productRepository.save(p8);

        // Product 9: Critical Stockout Alert Product (USB-C Hub)
        Product p9 = Product.builder()
                .name("Ultra-Fast 7-in-1 USB-C Hub Adapter")
                .sku("ACC-DELL-HUB7")
                .description("Compact 7-in-1 multi-port adapter with 4K 60Hz HDMI, 100W Power Delivery pass-through, SD/TF card slots, Gigabit Ethernet, and 2x USB 3.2 Gen 2 ports.")
                .category(catAccessories)
                .brand(brandDell)
                .price(2499.0)
                .costPrice(1100.0)
                .discountPercentage(24.0)
                .finalPrice(1899.0)
                .stock(6) // Critical stock!
                .reorderPoint(20)
                .safetyStock(10)
                .salesVelocity(3.0)
                .estimatedStockoutDays(2)
                .daysSinceLastSale(1)
                .inventoryHealthStatus(InventoryHealthStatus.CRITICAL)
                .inventoryHealthScore(18)
                .rating(4.7)
                .reviewCount(210)
                .mainImageUrl("https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p9);

        // Product 10: Signature Dead Stock Product (Office Ergonomic Cushion)
        Product p10 = Product.builder()
                .name("Ergonomic Memory Foam Lumbar Support Cushion")
                .sku("ERG-BOSE-CUSHION")
                .description("High-density contoured memory foam lumbar pillow for office chairs. Breathable mesh cover and dual adjustable straps. Currently experiencing slow sales velocity.")
                .category(catErgonomics)
                .brand(brandBose)
                .price(1899.0)
                .costPrice(850.0)
                .discountPercentage(21.06)
                .finalPrice(1499.0)
                .stock(120) // High dead stock
                .reorderPoint(15)
                .safetyStock(10)
                .salesVelocity(0.1)
                .estimatedStockoutDays(1200)
                .daysSinceLastSale(47) // > 45 days dead stock
                .inventoryHealthStatus(InventoryHealthStatus.OVERSTOCKED)
                .inventoryHealthScore(45)
                .rating(4.1)
                .reviewCount(34)
                .mainImageUrl("https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p10);

        // Product 11: Apple Watch Ultra 2
        Product p11 = Product.builder()
                .name("Apple Watch Ultra 2 GPS + Cellular")
                .sku("WEA-APPL-ULTRA2")
                .description("Rugged 49mm titanium case, precision dual-frequency GPS, up to 36-hour battery life, and 3000-nit Always-On Retina display.")
                .category(catWearables)
                .brand(brandApple)
                .price(94900.0)
                .costPrice(65000.0)
                .discountPercentage(5.27)
                .finalPrice(89900.0)
                .stock(12)
                .reorderPoint(10)
                .safetyStock(5)
                .salesVelocity(1.4)
                .estimatedStockoutDays(8)
                .daysSinceLastSale(2)
                .inventoryHealthStatus(InventoryHealthStatus.HEALTHY)
                .inventoryHealthScore(78)
                .rating(4.9)
                .reviewCount(92)
                .mainImageUrl("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p11);

        // Product 12: Razer DeathAdder V3
        Product p12 = Product.builder()
                .name("Razer DeathAdder V3 Pro Gaming Mouse")
                .sku("GAM-RAZR-V3PRO")
                .description("Ultra-lightweight 63g esports wireless mouse with Focus Pro 30K Optical Sensor and Gen-3 Optical Mouse Switches.")
                .category(catGaming)
                .brand(brandRazer)
                .price(13999.0)
                .costPrice(8000.0)
                .discountPercentage(14.28)
                .finalPrice(11999.0)
                .stock(28)
                .reorderPoint(12)
                .safetyStock(8)
                .salesVelocity(1.8)
                .estimatedStockoutDays(15)
                .daysSinceLastSale(1)
                .inventoryHealthStatus(InventoryHealthStatus.HEALTHY)
                .inventoryHealthScore(84)
                .rating(4.8)
                .reviewCount(156)
                .mainImageUrl("https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80")
                .active(true)
                .preOrderEnabled(false)
                .build();
        productRepository.save(p12);

        // 6. Seed Demand Signals & Browsing Events
        DemandSignal sig5 = DemandSignal.builder()
                .product(p5)
                .searchCount(1248)
                .viewCount(2450)
                .wishlistCount(312)
                .priceWatchCount(184)
                .cartAddCount(96)
                .preOrderInterestCount(0)
                .demandScore(88)
                .demandTrendPercentage(24.0)
                .status("HIGH")
                .targetDemandPriceRange("₹2,500 – ₹2,700")
                .recommendedPrice(2699.0)
                .recommendedAction("Consider a ₹2,699 promotion because demand (wishlists: 312, price watches: 184) is high while cart conversion is below historical average.")
                .build();
        demandSignalRepository.save(sig5);

        DemandSignal sig9 = DemandSignal.builder()
                .product(p9)
                .searchCount(890)
                .viewCount(1650)
                .wishlistCount(145)
                .priceWatchCount(68)
                .cartAddCount(120)
                .demandScore(92)
                .demandTrendPercentage(35.5)
                .status("HIGH")
                .targetDemandPriceRange("₹1,750 – ₹1,850")
                .recommendedPrice(1799.0)
                .recommendedAction("High demand (+35.5% trend). Recommended stock increase within 48 hours to prevent imminent stockout.")
                .build();
        demandSignalRepository.save(sig9);

        DemandSignal sig10 = DemandSignal.builder()
                .product(p10)
                .searchCount(120)
                .viewCount(340)
                .wishlistCount(18)
                .priceWatchCount(9)
                .cartAddCount(12)
                .demandScore(25)
                .demandTrendPercentage(-18.0)
                .status("LOW")
                .targetDemandPriceRange("₹1,199 – ₹1,299")
                .recommendedPrice(1299.0)
                .recommendedAction("Demand declining (-18%). Recommend 15% discount or bundle with office furniture to clear ₹1,79,880 tied capital.")
                .build();
        demandSignalRepository.save(sig10);

        // 7. Seed Wishlist & Price Watches for Customer 1 & 2
        wishlistRepository.save(Wishlist.builder().user(customer1).product(p5).build());
        wishlistRepository.save(Wishlist.builder().user(customer1).product(p1).build());
        wishlistRepository.save(Wishlist.builder().user(customer2).product(p4).build());

        priceWatchRepository.save(PriceWatch.builder()
                .user(customer1)
                .product(p5)
                .initialPrice(3199.0)
                .targetPrice(2500.0)
                .isNotified(false)
                .build());

        // 8. Seed Pre-Orders for Keychron Q1 Pro (p8)
        for (int i = 0; i < 5; i++) {
            preOrderRepository.save(PreOrder.builder()
                    .user(i % 2 == 0 ? customer1 : customer2)
                    .product(p8)
                    .quantity(1)
                    .unitPrice(16499.0)
                    .status(PreOrderStatus.PENDING_STOCK)
                    .expectedAvailabilityDate("15 Days")
                    .build());
        }

        // 9. Seed Coupons
        couponRepository.save(Coupon.builder()
                .code("WELCOME10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(10.0)
                .minOrderAmount(999.0)
                .maxDiscountAmount(500.0)
                .startDate(LocalDate.now().minusDays(10))
                .expiryDate(LocalDate.now().plusMonths(3))
                .usageLimit(1000)
                .perUserLimit(1)
                .timesUsed(42)
                .active(true)
                .build());

        couponRepository.save(Coupon.builder()
                .code("SUPERDEAL20")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(20.0)
                .minOrderAmount(2499.0)
                .maxDiscountAmount(1500.0)
                .startDate(LocalDate.now().minusDays(5))
                .expiryDate(LocalDate.now().plusMonths(1))
                .usageLimit(500)
                .perUserLimit(1)
                .timesUsed(18)
                .active(true)
                .build());

        couponRepository.save(Coupon.builder()
                .code("FREESHIP")
                .discountType(DiscountType.FIXED)
                .discountValue(80.0)
                .minOrderAmount(499.0)
                .startDate(LocalDate.now().minusDays(1))
                .expiryDate(LocalDate.now().plusMonths(6))
                .usageLimit(2000)
                .perUserLimit(3)
                .timesUsed(115)
                .active(true)
                .build());

        // 10. Seed Realistic Historical Orders
        // Order 1 (Delivered Normal)
        Order ord1 = Order.builder()
                .orderNumber("ORD-8921-DEL")
                .user(customer1)
                .customerName("Alex Johnson")
                .customerEmail("alex.johnson@example.com")
                .phone("+91 98765 43210")
                .shippingAddress("42 Tech Park Avenue, Bengaluru 560034")
                .totalAmount(67999.0)
                .discountAmount(0.0)
                .shippingFee(0.0)
                .taxAmount(3399.95)
                .finalAmount(71398.95)
                .paymentStatus(PaymentStatus.SUCCESS)
                .paymentMethod(PaymentMethod.ONLINE_CARD)
                .orderStatus(OrderStatus.DELIVERED)
                .riskScore(12)
                .riskLevel(RiskLevel.LOW)
                .isRiskReviewed(true)
                .cogs(48000.0)
                .shippingCost(0.0)
                .estimatedProfit(19999.0)
                .profitMarginPercentage(28.0)
                .createdAt(LocalDateTime.now().minusDays(8))
                .build();
        ord1 = orderRepository.save(ord1);

        OrderItem item1 = orderItemRepository.save(OrderItem.builder()
                .order(ord1)
                .product(p1)
                .productName(p1.getName())
                .sku(p1.getSku())
                .quantity(1)
                .unitPrice(67999.0)
                .unitCost(48000.0)
                .totalPrice(67999.0)
                .build());
        ord1.setItems(List.of(item1));

        statusHistoryRepository.save(OrderStatusHistory.builder().order(ord1).newStatus(OrderStatus.PENDING).changedBy("alex.johnson").reason("Order placed").build());
        statusHistoryRepository.save(OrderStatusHistory.builder().order(ord1).previousStatus(OrderStatus.PENDING).newStatus(OrderStatus.DELIVERED).changedBy("order_mgr").reason("Delivered to customer").build());

        // Order 2 (Shipped Normal)
        Order ord2 = Order.builder()
                .orderNumber("ORD-9042-SHP")
                .user(customer2)
                .customerName("Priya Sharma")
                .customerEmail("priya.sharma@example.com")
                .phone("+91 98234 56789")
                .shippingAddress("12 Sea Breeze Towers, Mumbai 400050")
                .totalAmount(29990.0)
                .discountAmount(0.0)
                .shippingFee(0.0)
                .taxAmount(1499.5)
                .finalAmount(31489.5)
                .paymentStatus(PaymentStatus.SUCCESS)
                .paymentMethod(PaymentMethod.ONLINE_CARD)
                .orderStatus(OrderStatus.SHIPPED)
                .riskScore(18)
                .riskLevel(RiskLevel.LOW)
                .isRiskReviewed(true)
                .cogs(21000.0)
                .shippingCost(0.0)
                .estimatedProfit(8990.0)
                .profitMarginPercentage(28.5)
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();
        ord2 = orderRepository.save(ord2);

        OrderItem item2 = orderItemRepository.save(OrderItem.builder()
                .order(ord2)
                .product(p4)
                .productName(p4.getName())
                .sku(p4.getSku())
                .quantity(1)
                .unitPrice(29990.0)
                .unitCost(21000.0)
                .totalPrice(29990.0)
                .build());
        ord2.setItems(List.of(item2));

        // Order 3 (HIGH RISK FLAGGED - Signature Scenario #5)
        Order ordRisk = Order.builder()
                .orderNumber("ORD-10287-RISK")
                .user(customer2)
                .customerName("Priya Sharma (Unverified Address)")
                .customerEmail("priya.sharma@example.com")
                .phone("+91 98234 56789")
                .shippingAddress("Suite 999 Luxury Penthouse, Goa 403001")
                .totalAmount(89900.0)
                .discountAmount(0.0)
                .shippingFee(0.0)
                .taxAmount(4495.0)
                .finalAmount(94395.0)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMethod(PaymentMethod.COD)
                .orderStatus(OrderStatus.PENDING)
                .riskScore(82)
                .riskLevel(RiskLevel.CRITICAL)
                .riskReasonsJson("[\"4 failed payment attempts before checkout\", \"Unusually high order value (₹94,395 exceeds ₹50,000 threshold)\", \"New delivery destination not matching profile city\"]")
                .isRiskReviewed(false) // Pending manual review
                .cogs(65000.0)
                .shippingCost(0.0)
                .estimatedProfit(24900.0)
                .profitMarginPercentage(26.3)
                .createdAt(LocalDateTime.now().minusHours(2))
                .build();
        ordRisk = orderRepository.save(ordRisk);

        OrderItem itemRisk = orderItemRepository.save(OrderItem.builder()
                .order(ordRisk)
                .product(p11)
                .productName(p11.getName())
                .sku(p11.getSku())
                .quantity(1)
                .unitPrice(89900.0)
                .unitCost(65000.0)
                .totalPrice(89900.0)
                .build());
        ordRisk.setItems(List.of(itemRisk));

        statusHistoryRepository.save(OrderStatusHistory.builder().order(ordRisk).newStatus(OrderStatus.PENDING).changedBy("SYSTEM").reason("Flagged by Order Risk Engine (Score 82/100)").build());

        // 11. Seed Inventory Transactions
        transactionRepository.save(InventoryTransaction.builder()
                .product(p1)
                .quantityBefore(25)
                .quantityChange(-3)
                .quantityAfter(22)
                .reason(InventoryTransactionReason.ORDER)
                .notes("Order fulfillment")
                .changedBy("SYSTEM")
                .timestamp(LocalDateTime.now().minusDays(2))
                .build());

        transactionRepository.save(InventoryTransaction.builder()
                .product(p9)
                .quantityBefore(30)
                .quantityChange(-24)
                .quantityAfter(6)
                .reason(InventoryTransactionReason.ORDER)
                .notes("Surge in peripheral purchases")
                .changedBy("SYSTEM")
                .timestamp(LocalDateTime.now().minusHours(18))
                .build());

        // 12. Seed Purchase Order for Low Stock
        purchaseOrderRepository.save(PurchaseOrder.builder()
                .poNumber("PO-8942-SUP")
                .supplier(supTech)
                .product(p9)
                .quantity(50)
                .unitCost(1100.0)
                .status("ORDERED")
                .expectedDeliveryDate(LocalDate.now().plusDays(7))
                .build());

        // 13. Seed In-App Notifications
        notificationRepository.save(Notification.builder()
                .user(customer1)
                .title("Welcome to AI Commerce Intelligence")
                .message("Explore smart features: Track product prices with Price Watch & pre-order upcoming gear.")
                .type("SYSTEM")
                .linkUrl("/customer/products")
                .isRead(false)
                .build());

        // 14. Seed Initial Audit Logs
        auditLogRepository.save(AuditLog.builder()
                .actor("SYSTEM")
                .action("SYSTEM_INITIALIZATION")
                .entityName("Platform")
                .entityId("ROOT")
                .afterStateJson("All 28 entities initialized successfully with seed dataset")
                .reason("Platform startup")
                .build());

        log.info("Successfully seeded database with complete AI Commerce Intelligence demo data!");
    }
}
