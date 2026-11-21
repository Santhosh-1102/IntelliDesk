package com.intellidesk.service;

import com.intellidesk.dto.analytics.AdminAnalyticsResponse;
import com.intellidesk.entity.Ticket;
import com.intellidesk.entity.enums.ConversationStatus;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import com.intellidesk.repository.AiConversationRepository;
import com.intellidesk.repository.TicketRepository;
import com.intellidesk.repository.UserRepository;
import com.intellidesk.service.impl.AnalyticsServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.data.domain.Pageable;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class AnalyticsServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private AiConversationRepository conversationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    @Test
    @DisplayName("getAdminAnalytics: calculates ticket totals, resolution time, and deflection rate")
    void testGetAdminAnalytics_Calculations() {
        when(ticketRepository.count()).thenReturn(100L);
        when(ticketRepository.countByStatus(TicketStatus.OPEN)).thenReturn(20L);
        when(ticketRepository.countByStatus(TicketStatus.IN_PROGRESS)).thenReturn(30L);
        when(ticketRepository.countByStatus(TicketStatus.RESOLVED)).thenReturn(40L);
        when(ticketRepository.countByStatus(TicketStatus.CLOSED)).thenReturn(10L);

        when(ticketRepository.countByPriority(TicketPriority.CRITICAL)).thenReturn(10L);
        when(ticketRepository.countByPriority(TicketPriority.HIGH)).thenReturn(30L);
        when(ticketRepository.countByPriority(TicketPriority.MEDIUM)).thenReturn(40L);
        when(ticketRepository.countByPriority(TicketPriority.LOW)).thenReturn(20L);

        // AI Conversations: 60 total, 30 resolved without escalation -> 50% deflection
        when(conversationRepository.count()).thenReturn(60L);
        when(conversationRepository.countByStatus(ConversationStatus.RESOLVED)).thenReturn(30L);
        when(conversationRepository.countByStatus(ConversationStatus.ESCALATED)).thenReturn(15L);
        when(conversationRepository.countByStatus(ConversationStatus.ACTIVE)).thenReturn(15L);

        // Sample resolved ticket for MTTR calculation (resolved in 2 hours)
        Ticket resolvedTicket = new Ticket();
        resolvedTicket.setCreatedAt(Instant.now().minus(Duration.ofHours(2)));
        resolvedTicket.setResolvedAt(Instant.now());
        when(ticketRepository.findResolvedTicketsForMttr()).thenReturn(List.of(resolvedTicket));

        // SLA Telemetry
        when(ticketRepository.countSlaTrackedTickets()).thenReturn(90L);
        when(ticketRepository.countSlaBreachedTickets(any(Instant.class))).thenReturn(5L);
        when(ticketRepository.countNearSlaBreachedTickets(any(Instant.class), any(Instant.class))).thenReturn(10L);

        // Category breakdown
        when(ticketRepository.countTicketsByCategory()).thenReturn(Collections.emptyList());

        // Urgent SLA breaches
        when(ticketRepository.findActiveTicketsBySlaUrgency(any(Pageable.class)))
                .thenReturn(Collections.emptyList());

        // Engineers
        when(userRepository.findByRoles_Name(eq(RoleName.ROLE_SUPPORT_ENGINEER)))
                .thenReturn(Collections.emptyList());

        AdminAnalyticsResponse response = analyticsService.getAdminAnalytics();

        assertThat(response).isNotNull();
        assertThat(response.getTotalTickets()).isEqualTo(100L);
        assertThat(response.getOpenTickets()).isEqualTo(20L);
        assertThat(response.getResolvedTickets()).isEqualTo(40L);
        assertThat(response.getAiDeflectionRate()).isEqualTo(50.0);
        assertThat(response.getMeanTimeToResolveMinutes()).isBetween(110.0, 130.0);
    }

    @Test
    @DisplayName("getAdminAnalytics: safely handles zero counts without division by zero")
    void testGetAdminAnalytics_ZeroCounts() {
        when(ticketRepository.count()).thenReturn(0L);
        when(conversationRepository.count()).thenReturn(0L);
        when(ticketRepository.findResolvedTicketsForMttr()).thenReturn(Collections.emptyList());
        when(ticketRepository.countSlaTrackedTickets()).thenReturn(0L);
        when(ticketRepository.countSlaBreachedTickets(any(Instant.class))).thenReturn(0L);
        when(ticketRepository.countNearSlaBreachedTickets(any(Instant.class), any(Instant.class))).thenReturn(0L);
        when(ticketRepository.countTicketsByCategory()).thenReturn(Collections.emptyList());
        when(ticketRepository.findActiveTicketsBySlaUrgency(any(Pageable.class))).thenReturn(Collections.emptyList());
        when(userRepository.findByRoles_Name(eq(RoleName.ROLE_SUPPORT_ENGINEER))).thenReturn(Collections.emptyList());

        AdminAnalyticsResponse response = analyticsService.getAdminAnalytics();

        assertThat(response).isNotNull();
        assertThat(response.getTotalTickets()).isEqualTo(0L);
        assertThat(response.getAiDeflectionRate()).isEqualTo(0.0);
        assertThat(response.getSlaComplianceRate()).isEqualTo(100.0);
        assertThat(response.getMeanTimeToResolveMinutes()).isEqualTo(0.0);
    }
}
