package com.commerce.intelligence.service;

import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.*;
import com.commerce.intelligence.model.enums.EventType;
import com.commerce.intelligence.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistAndPriceWatchService {

    private final WishlistRepository wishlistRepository;
    private final PriceWatchRepository priceWatchRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final DemandRadarService demandRadarService;
    private final NotificationService notificationService;

    @Transactional
    public boolean toggleWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            wishlistRepository.deleteByUserIdAndProductId(userId, productId);
            return false; // removed
        } else {
            Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
            wishlistRepository.save(wishlist);
            demandRadarService.trackEvent(userId, null, product, EventType.WISHLIST_ADD, null);
            return true; // added
        }
    }

    @Transactional(readOnly = true)
    public List<Wishlist> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }

    @Transactional
    public PriceWatch setPriceWatch(Long userId, Long productId, Double targetPrice) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        PriceWatch watch = priceWatchRepository.findByUserIdAndProductId(userId, productId)
                .orElse(PriceWatch.builder()
                        .user(user)
                        .product(product)
                        .initialPrice(product.getFinalPrice())
                        .build());

        watch.setTargetPrice(targetPrice);
        watch.setIsNotified(false);
        PriceWatch savedWatch = priceWatchRepository.save(watch);

        demandRadarService.trackEvent(userId, null, product, EventType.PRICE_WATCH, null);

        notificationService.sendNotification(user, "Price Watch Set",
                "We will notify you when " + product.getName() + " drops to ₹" + targetPrice.intValue(),
                "PRICE_DROP", "/customer/price-watches");

        return savedWatch;
    }

    @Transactional(readOnly = true)
    public List<PriceWatch> getUserPriceWatches(Long userId) {
        return priceWatchRepository.findByUserId(userId);
    }

    @Transactional
    public void checkAndTriggerPriceAlerts(Product product) {
        List<PriceWatch> triggered = priceWatchRepository.findTriggeredWatches(product.getId(), product.getFinalPrice());
        for (PriceWatch watch : triggered) {
            watch.setIsNotified(true);
            priceWatchRepository.save(watch);

            notificationService.sendNotification(watch.getUser(), "Price Alert: Price Dropped!",
                    "Great news! " + product.getName() + " dropped to ₹" + product.getFinalPrice().intValue() + " (Target: ₹" + watch.getTargetPrice().intValue() + ")",
                    "PRICE_DROP", "/customer/products");
        }
    }
}
