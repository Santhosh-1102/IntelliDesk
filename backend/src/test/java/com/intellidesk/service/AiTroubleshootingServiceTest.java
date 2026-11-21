package com.intellidesk.service;

import com.intellidesk.dto.ai.AiChatResponse;
import com.intellidesk.dto.ai.EscalateSessionRequest;
import com.intellidesk.dto.ai.StepFeedbackRequest;
import com.intellidesk.entity.*;
import com.intellidesk.entity.enums.ConversationStatus;
import com.intellidesk.entity.enums.StepStatus;
import com.intellidesk.repository.*;
import com.intellidesk.service.impl.AiTroubleshootingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiTroubleshootingServiceTest {

    @Mock
    private AiConversationRepository conversationRepository;

    @Mock
    private AiMessageRepository messageRepository;

    @Mock
    private TroubleshootingStepRepository stepRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketCategoryRepository categoryRepository;

    @Mock
    private TicketHistoryRepository historyRepository;

    @Mock
    private ObjectProvider<?> chatClientProvider;

    @Mock
    private KnowledgeDocumentService knowledgeDocumentService;

    @InjectMocks
    private AiTroubleshootingServiceImpl aiService;

    private User employee;
    private AiConversation conversation;
    private TroubleshootingStep step;

    @BeforeEach
    void setUp() {
        employee = new User();
        employee.setId(10L);
        employee.setEmail("dev@company.com");
        employee.setFirstName("Dev");
        employee.setLastName("User");

        conversation = new AiConversation();
        conversation.setId(50L);
        conversation.setSessionId("SESSION-12345678");
        conversation.setUser(employee);
        conversation.setStatus(ConversationStatus.ACTIVE);
        conversation.setInitialQuery("Cannot reach internal DB from home VPN");
        conversation.setIdentifiedCategory("Network & VPN");

        step = new TroubleshootingStep();
        step.setId(1L);
        step.setConversation(conversation);
        step.setStepNumber(1);
        step.setStepTitle("Flush DNS Cache");
        step.setInstructions("Run ipconfig /flushdns in elevated PowerShell");
        step.setStatus(StepStatus.PENDING);
    }

    @Test
    @DisplayName("submitStepFeedback: marking step as worked resolves conversation")
    void testSubmitStepFeedback_Success_Worked() {
        StepFeedbackRequest request = new StepFeedbackRequest();
        request.setStepId(1L);
        request.setWorked(true);
        request.setUserNotes("Internet started working immediately!");

        when(stepRepository.findById(1L)).thenReturn(Optional.of(step));
        when(stepRepository.findByConversationIdOrderByStepNumberAsc(50L))
                .thenReturn(List.of(step));

        AiChatResponse response = aiService.submitStepFeedback(10L, request);

        assertThat(response).isNotNull();
        assertThat(step.getStatus()).isEqualTo(StepStatus.SUCCEEDED);
        assertThat(conversation.getStatus()).isEqualTo(ConversationStatus.RESOLVED);
        assertThat(conversation.getEndedAt()).isNotNull();

        verify(stepRepository).save(step);
        verify(conversationRepository).save(conversation);
        verify(messageRepository).save(any(AiMessage.class));
    }

    @Test
    @DisplayName("escalateSession: escalates AI conversation to formal support ticket")
    void testEscalateSession_Success() {
        EscalateSessionRequest request = new EscalateSessionRequest();
        request.setSessionId("SESSION-12345678");
        request.setPriority("HIGH");
        request.setAdditionalNotes("Cannot reach internal DB from home VPN");

        TicketCategory category = new TicketCategory();
        category.setId(2L);
        category.setName("Network & VPN");

        when(conversationRepository.findBySessionId("SESSION-12345678"))
                .thenReturn(Optional.of(conversation));
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(ticketRepository.findBySourceConversationId(50L)).thenReturn(Optional.empty());
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(200L);
            t.setTicketNumber("TCK-20261121-0005");
            return t;
        });
        when(messageRepository.findByConversationIdOrderByCreatedAtAsc(50L))
                .thenReturn(Collections.emptyList());
        when(stepRepository.findByConversationIdOrderByStepNumberAsc(50L))
                .thenReturn(List.of(step));

        AiChatResponse response = aiService.escalateSession(10L, request);

        assertThat(response).isNotNull();
        assertThat(conversation.getStatus()).isEqualTo(ConversationStatus.ESCALATED);
        assertThat(response.getEscalatedTicketNumber()).isEqualTo("TCK-20261121-0005");

        verify(ticketRepository).save(any(Ticket.class));
        verify(historyRepository).save(any(TicketHistory.class));
        verify(conversationRepository).save(conversation);
    }
}
