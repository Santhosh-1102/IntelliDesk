package com.intellidesk.controller;

import com.intellidesk.dto.admin.UpdateUserRoleRequest;
import com.intellidesk.dto.admin.UserManagementResponse;
import com.intellidesk.dto.analytics.AdminAnalyticsResponse;
import com.intellidesk.dto.analytics.SlaBreachTicketDto;
import com.intellidesk.dto.knowledge.KnowledgeGapResponse;
import com.intellidesk.entity.AiConversation;
import com.intellidesk.entity.Role;
import com.intellidesk.entity.Ticket;
import com.intellidesk.entity.User;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.exception.ResourceNotFoundException;
import com.intellidesk.repository.AiConversationRepository;
import com.intellidesk.repository.RoleRepository;
import com.intellidesk.repository.TicketRepository;
import com.intellidesk.repository.UserRepository;
import com.intellidesk.service.AnalyticsService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AiConversationRepository conversationRepository;
    private final TicketRepository ticketRepository;
    private final AnalyticsService analyticsService;

    public AdminController(
            UserRepository userRepository,
            RoleRepository roleRepository,
            AiConversationRepository conversationRepository,
            TicketRepository ticketRepository,
            AnalyticsService analyticsService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.conversationRepository = conversationRepository;
        this.ticketRepository = ticketRepository;
        this.analyticsService = analyticsService;
    }

    /**
     * Real-time IT governance and executive BI analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(analyticsService.getAdminAnalytics());
    }

    /**
     * Real-time SLA breach radar and urgency tracker
     */
    @GetMapping("/analytics/sla-breaches")
    public ResponseEntity<List<SlaBreachTicketDto>> getSlaBreaches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(analyticsService.getSlaBreaches(page, size));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserManagementResponse>> getAllUsers() {
        List<UserManagementResponse> users = userRepository.findAll().stream()
                .map(UserManagementResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<UserManagementResponse> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateUserRoleRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String roleStr = request.getRole().toUpperCase().trim();
        if (!roleStr.startsWith("ROLE_")) {
            roleStr = "ROLE_" + roleStr;
        }

        RoleName roleName;
        try {
            roleName = RoleName.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role", "name", roleName));

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(UserManagementResponse.fromEntity(savedUser));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<UserManagementResponse> toggleUserStatus(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setActive(!user.isActive());
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(UserManagementResponse.fromEntity(savedUser));
    }

    /**
     * Detect queries that failed self-service or lacked matching corporate SOPs,
     * highlighting knowledge gaps for IT governance.
     */
    @GetMapping("/knowledge-gaps")
    public ResponseEntity<List<KnowledgeGapResponse>> getKnowledgeGaps(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<AiConversation> gapPage = conversationRepository.findByKnowledgeGapTrueOrderByStartedAtDesc(PageRequest.of(page, size));
        List<KnowledgeGapResponse> list = gapPage.getContent().stream()
                .map(c -> {
                    Optional<Ticket> t = ticketRepository.findBySourceConversationId(c.getId());
                    return new KnowledgeGapResponse(
                            c.getId(),
                            c.getSessionId(),
                            c.getInitialQuery(),
                            c.getIdentifiedCategory(),
                            c.getStartedAt(),
                            c.getStatus().name(),
                            t.map(Ticket::getTicketNumber).orElse(null),
                            "Draft SOP for category [" + c.getIdentifiedCategory() + "] regarding: " + c.getInitialQuery()
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }
}
