package com.commerce.intelligence.service;

import com.commerce.intelligence.dto.CartDTOs.*;
import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;

    @Transactional
    public CartResponse getCartForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = Cart.builder().user(user).build();
                    return cartRepository.save(newCart);
                });

        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        ProductVariant variant = null;
        if (request.getVariantId() != null) {
            variant = variantRepository.findById(request.getVariantId()).orElse(null);
        }

        int availableStock = variant != null ? variant.getStock() : product.getStock();
        if (availableStock < request.getQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + availableStock + ")");
        }

        double unitPrice = variant != null && variant.getPriceOverride() != null ? variant.getPriceOverride() : product.getFinalPrice();

        final ProductVariant selectedVariant = variant;
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()) &&
                        ((selectedVariant == null && item.getVariant() == null) ||
                         (selectedVariant != null && item.getVariant() != null && item.getVariant().getId().equals(selectedVariant.getId()))))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            item.setUnitPrice(unitPrice);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        recalculateCartTotals(cart);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItem(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to user's cart");
        }

        int availableStock = item.getVariant() != null ? item.getVariant().getStock() : item.getProduct().getStock();
        if (availableStock < request.getQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() + ") exceeds available stock (" + availableStock + ")");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        recalculateCartTotals(cart);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse removeCartItem(Long userId, Long itemId) {
        Cart cart = getOrCreateCart(userId);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));
        cartItemRepository.deleteById(itemId);

        recalculateCartTotals(cart);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse applyCoupon(Long userId, String code) {
        Cart cart = getOrCreateCart(userId);
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new BadRequestException("Invalid coupon code: " + code));

        if (!coupon.getActive() || (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(java.time.LocalDate.now()))) {
            throw new BadRequestException("Coupon code " + code + " has expired or is inactive.");
        }

        recalculateCartTotals(cart);

        if (cart.getTotalAmount() < coupon.getMinOrderAmount()) {
            throw new BadRequestException("Minimum order amount for coupon " + code + " is ₹" + coupon.getMinOrderAmount());
        }

        double discount = 0.0;
        if (coupon.getDiscountType() == com.commerce.intelligence.model.enums.DiscountType.PERCENTAGE) {
            discount = cart.getTotalAmount() * (coupon.getDiscountValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null && discount > coupon.getMaxDiscountAmount()) {
                discount = coupon.getMaxDiscountAmount();
            }
        } else {
            discount = coupon.getDiscountValue();
        }

        cart.setDiscountAmount(Math.round(discount * 100.0) / 100.0);
        cart.setAppliedCouponCode(coupon.getCode());
        cart.setFinalAmount(Math.max(0.0, Math.round((cart.getTotalAmount() - cart.getDiscountAmount()) * 100.0) / 100.0));

        cartRepository.save(cart);
        return mapToCartResponse(cart);
    }

    private Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return cartRepository.findByUser(user)
                .orElseGet(() -> cartRepository.save(Cart.builder().user(user).build()));
    }

    private void recalculateCartTotals(Cart cart) {
        double subtotal = cart.getItems().stream()
                .mapToDouble(item -> item.getQuantity() * item.getUnitPrice())
                .sum();

        cart.setTotalAmount(Math.round(subtotal * 100.0) / 100.0);
        if (cart.getAppliedCouponCode() == null) {
            cart.setDiscountAmount(0.0);
            cart.setFinalAmount(cart.getTotalAmount());
        } else {
            cart.setFinalAmount(Math.max(0.0, Math.round((cart.getTotalAmount() - cart.getDiscountAmount()) * 100.0) / 100.0));
        }
        cartRepository.save(cart);
    }

    private CartResponse mapToCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = cart.getItems().stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .productSku(item.getProduct().getSku())
                        .mainImageUrl(item.getProduct().getMainImageUrl())
                        .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                        .variantAttributes(item.getVariant() != null ? item.getVariant().getAttributesJson() : null)
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .totalPrice(Math.round(item.getQuantity() * item.getUnitPrice() * 100.0) / 100.0)
                        .availableStock(item.getVariant() != null ? item.getVariant().getStock() : item.getProduct().getStock())
                        .build())
                .collect(Collectors.toList());

        // Generate non-manipulative cart intelligence messages
        List<String> insights = new ArrayList<>();
        double freeDeliveryThreshold = 999.0;
        double remainingForFreeDelivery = freeDeliveryThreshold - cart.getFinalAmount();

        if (cart.getFinalAmount() > 0 && remainingForFreeDelivery > 0) {
            insights.add("You are ₹" + (int)remainingForFreeDelivery + " away from free delivery.");
        } else if (cart.getFinalAmount() >= freeDeliveryThreshold) {
            insights.add("Congratulations! Your order qualifies for FREE Express Delivery.");
        }

        // Add real stock warning if any item stock < 5
        for (CartItem item : cart.getItems()) {
            int stock = item.getVariant() != null ? item.getVariant().getStock() : item.getProduct().getStock();
            if (stock > 0 && stock <= 5) {
                insights.add("Stock Warning: Only " + stock + " left in stock for " + item.getProduct().getName() + ".");
            }
        }

        return CartResponse.builder()
                .id(cart.getId())
                .items(itemResponses)
                .totalAmount(cart.getTotalAmount())
                .discountAmount(cart.getDiscountAmount())
                .finalAmount(cart.getFinalAmount())
                .appliedCouponCode(cart.getAppliedCouponCode())
                .cartInsights(insights)
                .amountForFreeDelivery(remainingForFreeDelivery > 0 ? remainingForFreeDelivery : 0.0)
                .build();
    }
}
