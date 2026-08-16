package com.commerce.intelligence.service;

import com.commerce.intelligence.exception.BadRequestException;
import com.commerce.intelligence.exception.ResourceNotFoundException;
import com.commerce.intelligence.model.CustomerProfile;
import com.commerce.intelligence.model.User;
import com.commerce.intelligence.model.enums.RoleType;
import com.commerce.intelligence.repository.CustomerProfileRepository;
import com.commerce.intelligence.repository.UserRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final CustomerProfileRepository customerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        CustomerProfile profile = customerProfileRepository.findByUserId(userId).orElse(null);
        return mapToProfile(user, profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request, String actor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        userRepository.save(user);

        CustomerProfile profile = customerProfileRepository.findByUserId(userId)
                .orElse(CustomerProfile.builder().user(user).build());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAddressLine1() != null) profile.setAddressLine1(request.getAddressLine1());
        if (request.getCity() != null) profile.setCity(request.getCity());
        if (request.getState() != null) profile.setState(request.getState());
        if (request.getPostalCode() != null) profile.setZipCode(request.getPostalCode());
        customerProfileRepository.save(profile);

        auditService.logAction(actor, "PROFILE_UPDATED", "User", userId.toString(), null, null, null);
        return mapToProfile(user, profile);
    }

    @Transactional(readOnly = true)
    public Page<UserProfileResponse> listUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(u ->
                mapToProfile(u, customerProfileRepository.findByUserId(u.getId()).orElse(null)));
    }

    @Transactional
    public UserProfileResponse setUserEnabled(Long userId, boolean enabled, String actor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEnabled(enabled);
        userRepository.save(user);
        auditService.logAction(actor, enabled ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                "User", userId.toString(), null, String.valueOf(enabled), null);
        return mapToProfile(user, customerProfileRepository.findByUserId(userId).orElse(null));
    }

    @Transactional
    public void resetPassword(Long userId, String newPassword, String actor) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        auditService.logAction(actor, "PASSWORD_RESET", "User", userId.toString(), null, null, "Admin reset");
    }

    private UserProfileResponse mapToProfile(User user, CustomerProfile profile) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .enabled(user.getEnabled())
                .roles(user.getRoles().stream().map(Enum::name).collect(Collectors.toSet()))
                .phone(profile != null ? profile.getPhone() : null)
                .addressLine1(profile != null ? profile.getAddressLine1() : null)
                .city(profile != null ? profile.getCity() : null)
                .state(profile != null ? profile.getState() : null)
                .postalCode(profile != null ? profile.getZipCode() : null)
                .totalOrdersPlaced(profile != null ? profile.getTotalOrdersPlaced() : 0)
                .totalSpent(profile != null ? profile.getTotalSpent() : 0.0)
                .build();
    }

    @Data
    @Builder
    public static class UserProfileResponse {
        private Long id;
        private String username;
        private String email;
        private String fullName;
        private Boolean enabled;
        private Set<String> roles;
        private String phone;
        private String addressLine1;
        private String city;
        private String state;
        private String postalCode;
        private Integer totalOrdersPlaced;
        private Double totalSpent;
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private String email;
        private String phone;
        private String addressLine1;
        private String city;
        private String state;
        private String postalCode;
    }
}
