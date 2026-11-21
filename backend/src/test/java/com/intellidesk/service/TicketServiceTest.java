package com.intellidesk.service;

import com.intellidesk.dto.ticket.CreateTicketRequest;
import com.intellidesk.dto.ticket.TicketResponse;
import com.intellidesk.dto.ticket.UpdateTicketStatusRequest;
import com.intellidesk.entity.*;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import com.intellidesk.repository.*;
import com.intellidesk.service.impl.TicketServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketCategoryRepository categoryRepository;

    @Mock
    private AiConversationRepository conversationRepository;

    @Mock
    private TicketHistoryRepository historyRepository;

    @Mock
    private TicketAssignmentRepository assignmentRepository;

    @Mock
    private TicketMessageRepository messageRepository;

    @Mock
    private TicketFeedbackRepository feedbackRepository;

    @InjectMocks
    private TicketServiceImpl ticketService;

    private User requester;
    private User engineer;
    private TicketCategory vpnCategory;

    @BeforeEach
    void setUp() {
        Role employeeRole = new Role(RoleName.ROLE_EMPLOYEE, "Employee");
        employeeRole.setId(1L);

        requester = new User();
        requester.setId(10L);
        requester.setEmail("employee@company.com");
        requester.setFirstName("Alex");
        requester.setLastName("Morgan");
        requester.setRoles(Set.of(employeeRole));

        Role engineerRole = new Role(RoleName.ROLE_SUPPORT_ENGINEER, "Support Engineer");
        engineerRole.setId(2L);

        engineer = new User();
        engineer.setId(20L);
        engineer.setEmail("engineer@company.com");
        engineer.setFirstName("Sarah");
        engineer.setLastName("Connor");
        engineer.setRoles(Set.of(engineerRole));

        vpnCategory = new TicketCategory();
        vpnCategory.setId(1L);
        vpnCategory.setName("Network & VPN");
    }

    @Test
    @DisplayName("createTicket: persists ticket with OPEN status and logs history")
    void testCreateTicket_Success() {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Production VPN gateway down");
        request.setDescription("All remote employees cannot connect to internal VPC");
        request.setCategoryId(1L);
        request.setPriority(TicketPriority.CRITICAL);

        when(userRepository.findByEmail("employee@company.com")).thenReturn(Optional.of(requester));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(vpnCategory));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(100L);
            return t;
        });

        TicketResponse response = ticketService.createTicket(request, "employee@company.com");

        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Production VPN gateway down");
        assertThat(response.getPriority()).isEqualTo(TicketPriority.CRITICAL);
        assertThat(response.getStatus()).isEqualTo(TicketStatus.OPEN);

        verify(ticketRepository).save(any(Ticket.class));
        verify(historyRepository).save(any(TicketHistory.class));
    }

    @Test
    @DisplayName("updateTicketStatus: engineer moves ticket from ASSIGNED to IN_PROGRESS")
    void testUpdateTicketStatus_ByEngineer() {
        Ticket existingTicket = new Ticket();
        existingTicket.setId(100L);
        existingTicket.setTicketNumber("TCK-20261121-0001");
        existingTicket.setTitle("VPN connection reset");
        existingTicket.setStatus(TicketStatus.ASSIGNED);
        existingTicket.setPriority(TicketPriority.HIGH);
        existingTicket.setRequester(requester);
        existingTicket.setAssignedEngineer(engineer);
        existingTicket.setCreatedAt(Instant.now().minus(Duration.ofHours(1)));

        UpdateTicketStatusRequest request = new UpdateTicketStatusRequest();
        request.setStatus(TicketStatus.IN_PROGRESS);
        request.setComment("Investigating client SSL certificate handshake");

        when(userRepository.findByEmail("engineer@company.com")).thenReturn(Optional.of(engineer));
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(existingTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketResponse response = ticketService.updateTicketStatus(100L, request, "engineer@company.com");

        assertThat(response).isNotNull();
        assertThat(response.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
        verify(historyRepository).save(any(TicketHistory.class));
    }

    @Test
    @DisplayName("updateTicketStatus: resolving ticket sets resolvedAt timestamp")
    void testUpdateTicketStatus_ResolvingTicketSetsResolvedAt() {
        Ticket existingTicket = new Ticket();
        existingTicket.setId(100L);
        existingTicket.setTicketNumber("TCK-20261121-0001");
        existingTicket.setStatus(TicketStatus.IN_PROGRESS);
        existingTicket.setPriority(TicketPriority.MEDIUM);
        existingTicket.setRequester(requester);
        existingTicket.setAssignedEngineer(engineer);

        UpdateTicketStatusRequest request = new UpdateTicketStatusRequest();
        request.setStatus(TicketStatus.RESOLVED);
        request.setResolutionNotes("Re-keyed VPN client certificate and tested connectivity.");

        when(userRepository.findByEmail("engineer@company.com")).thenReturn(Optional.of(engineer));
        when(ticketRepository.findById(100L)).thenReturn(Optional.of(existingTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TicketResponse response = ticketService.updateTicketStatus(100L, request, "engineer@company.com");

        assertThat(response.getStatus()).isEqualTo(TicketStatus.RESOLVED);
        assertThat(response.getResolvedAt()).isNotNull();
        verify(historyRepository).save(any(TicketHistory.class));
    }
}
