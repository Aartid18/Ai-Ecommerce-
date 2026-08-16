package com.commerce.intelligence.controller;

import com.commerce.intelligence.service.UserManagementService;
import com.commerce.intelligence.service.UserManagementService.UserProfileResponse;
import com.commerce.intelligence.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "User Management", description = "Admin user administration, role oversight, and account status management")
public class UserManagementController {

    private final UserManagementService userManagementService;

    @GetMapping
    @Operation(summary = "List Users", description = "Paginated list of system users and customer profiles")
    public ResponseEntity<Page<UserProfileResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "id,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        String sortField = sortParts[0];
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC : Sort.Direction.DESC;

        return ResponseEntity.ok(userManagementService.listUsers(PageRequest.of(page, size, Sort.by(direction, sortField))));
    }

    @PutMapping("/{id}/toggle-status")
    @Operation(summary = "Toggle User Active Status", description = "Enables or disables a user account")
    public ResponseEntity<UserProfileResponse> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        String actor = SecurityUtils.getCurrentUsername();
        return ResponseEntity.ok(userManagementService.setUserEnabled(id, enabled, actor));
    }

    @PutMapping("/{id}/reset-password")
    @Operation(summary = "Admin Password Reset", description = "Resets user password by administrator")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Long id,
            @RequestBody ResetPasswordRequest request) {
        String actor = SecurityUtils.getCurrentUsername();
        userManagementService.resetPassword(id, request.getNewPassword(), actor);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully for user ID " + id));
    }

    @Data
    public static class ResetPasswordRequest {
        private String newPassword;
    }
}
