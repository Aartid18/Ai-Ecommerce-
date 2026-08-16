package com.commerce.intelligence.controller;

import com.commerce.intelligence.dto.AuthDTOs.*;
import com.commerce.intelligence.service.AuthService;
import com.commerce.intelligence.service.UserManagementService;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user registration, authentication, and token management")
public class AuthController {

    private final AuthService authService;
    private final UserManagementService userManagementService;

    @PostMapping("/login")
    @Operation(summary = "User Login", description = "Authenticates user and returns JWT token and refresh token")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/register")
    @Operation(summary = "User Registration", description = "Registers a new customer or operational user")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(authService.registerUser(registerRequest));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh JWT Token", description = "Provides a new access token using a valid refresh token")
    public ResponseEntity<TokenRefreshResponse> refreshToken(@Valid @RequestBody TokenRefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get Current User Profile", description = "Fetches the profile details of the currently authenticated user")
    public ResponseEntity<UserManagementService.UserProfileResponse> getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(userManagementService.getCurrentUserProfile(userId));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update User Profile", description = "Updates profile details like phone, address, name")
    public ResponseEntity<UserManagementService.UserProfileResponse> updateProfile(
            @RequestBody UserManagementService.UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(userManagementService.updateProfile(userId, request, actor));
    }
}
