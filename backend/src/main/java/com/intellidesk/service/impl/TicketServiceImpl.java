package com.intellidesk.service.impl;

import com.intellidesk.dto.ticket.*;
import com.intellidesk.entity.*;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.exception.ResourceNotFoundException;
import com.intellidesk.repository.*;
import com.intellidesk.service.TicketService;
import com.intellidesk.utils.TicketNumberGenerator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketServiceImpl implements TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketCategoryRepository categoryRepository;
    private final AiConversationRepository conversationRepository;
    private final TicketHistoryRepository historyRepository;
    private final TicketAssignmentRepository assignmentRepository;
    private final TicketMessageRepository messageRepository;
    private final TicketFeedbackRepository feedbackRepository;

    public TicketServiceImpl(
            TicketRepository ticketRepository,
            UserRepository userRepository,
            TicketCategoryRepository categoryRepository,
            AiConversationRepository conversationRepository,
            TicketHistoryRepository historyRepository,
            TicketAssignmentRepository assignmentRepository,
            TicketMessageRepository messageRepository,
            TicketFeedbackRepository feedbackRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.conversationRepository = conversationRepository;
        this.historyRepository = historyRepository;
        this.assignmentRepository = assignmentRepository;
        this.messageRepository = messageRepository;
        this.feedbackRepository = feedbackRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private boolean isStaff(User user) {
        return user.getRoles().stream().anyMatch(r ->
                r.getName() == RoleName.ROLE_ADMIN || r.getName() == RoleName.ROLE_SUPPORT_ENGINEER);
    }

    @Override
    @Transactional
    public TicketResponse createTicket(CreateTicketRequest request, String currentUserEmail) {
        User requester = getUserByEmail(currentUserEmail);

        Ticket ticket = new Ticket();
        ticket.setTicketNumber(TicketNumberGenerator.generateTicketNumber());
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setRequester(requester);
        ticket.setStatus(TicketStatus.OPEN);

        // Assign Category & Default Priority
        if (request.getCategoryId() != null) {
            TicketCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("TicketCategory", "id", request.getCategoryId()));
            ticket.setCategory(category);
            ticket.setPriority(request.getPriority() != null ? request.getPriority() : category.getDefaultPriority());
        } else {
            ticket.setPriority(request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM);
        }

        // Link AI diagnostic session if escalated
        if (request.getSourceConversationId() != null) {
            AiConversation conversation = conversationRepository.findById(request.getSourceConversationId())
                    .orElse(null);
            ticket.setSourceConversation(conversation);
        }

        if (request.getAiSummary() != null && !request.getAiSummary().isBlank()) {
            ticket.setAiSummary(request.getAiSummary().trim());
        }

        Ticket savedTicket = ticketRepository.save(ticket);

        // Record Initial Creation in Audit History
        TicketHistory initialHistory = new TicketHistory(
                savedTicket,
                requester,
                "status",
                null,
                TicketStatus.OPEN.name(),
                "Ticket created by user"
        );
        historyRepository.save(initialHistory);

        return TicketResponse.fromEntity(savedTicket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketByNumber(String ticketNumber, String currentUserEmail) {
        Ticket ticket = ticketRepository.findByTicketNumber(ticketNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "ticketNumber", ticketNumber));

        User currentUser = getUserByEmail(currentUserEmail);
        if (!isStaff(currentUser) && !ticket.getRequester().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view this ticket");
        }

        return TicketResponse.fromEntity(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long ticketId, String currentUserEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User currentUser = getUserByEmail(currentUserEmail);
        if (!isStaff(currentUser) && !ticket.getRequester().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view this ticket");
        }

        return TicketResponse.fromEntity(ticket);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketResponse> getMyTickets(String currentUserEmail, Pageable pageable) {
        User requester = getUserByEmail(currentUserEmail);
        return ticketRepository.findByRequesterId(requester.getId(), pageable)
                .map(TicketResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketResponse> getAssignedTickets(String engineerEmail, Pageable pageable) {
        User engineer = getUserByEmail(engineerEmail);
        return ticketRepository.findByAssignedEngineerId(engineer.getId(), pageable)
                .map(TicketResponse::fromEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TicketResponse> getAllTickets(TicketStatus status, TicketPriority priority, Pageable pageable) {
        if (status != null) {
            return ticketRepository.findByStatus(status, pageable).map(TicketResponse::fromEntity);
        }
        if (priority != null) {
            return ticketRepository.findByPriority(priority, pageable).map(TicketResponse::fromEntity);
        }
        return ticketRepository.findAll(pageable).map(TicketResponse::fromEntity);
    }

    @Override
    @Transactional
    public TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request, String currentUserEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User currentUser = getUserByEmail(currentUserEmail);

        // Status Change
        if (request.getStatus() != null && request.getStatus() != ticket.getStatus()) {
            TicketStatus oldStatus = ticket.getStatus();
            ticket.setStatus(request.getStatus());

            if (request.getStatus() == TicketStatus.RESOLVED) {
                ticket.setResolvedAt(Instant.now());
            }

            TicketHistory history = new TicketHistory(
                    ticket,
                    currentUser,
                    "status",
                    oldStatus.name(),
                    request.getStatus().name(),
                    request.getComment() != null ? request.getComment() : "Status updated"
            );
            historyRepository.save(history);
        }

        // Priority Change
        if (request.getPriority() != null && request.getPriority() != ticket.getPriority()) {
            TicketPriority oldPriority = ticket.getPriority();
            ticket.setPriority(request.getPriority());

            TicketHistory history = new TicketHistory(
                    ticket,
                    currentUser,
                    "priority",
                    oldPriority.name(),
                    request.getPriority().name(),
                    "Priority updated"
            );
            historyRepository.save(history);
        }

        // Resolution Notes and Root Cause
        if (request.getResolutionNotes() != null && !request.getResolutionNotes().isBlank()) {
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
        }

        if (request.getRootCause() != null && !request.getRootCause().isBlank()) {
            ticket.setRootCause(request.getRootCause().trim());
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(savedTicket);
    }

    @Override
    @Transactional
    public TicketResponse assignTicket(Long ticketId, AssignTicketRequest request, String currentUserEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User assignedBy = getUserByEmail(currentUserEmail);
        User assignedTo = userRepository.findById(request.getEngineerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getEngineerId()));

        if (!isStaff(assignedTo)) {
            throw new BadRequestException("Tickets can only be assigned to IT Support Engineers or Administrators");
        }

        String oldEngineerName = ticket.getAssignedEngineer() != null
                ? ticket.getAssignedEngineer().getFirstName() + " " + ticket.getAssignedEngineer().getLastName()
                : "Unassigned";

        ticket.setAssignedEngineer(assignedTo);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }

        TicketAssignment assignment = new TicketAssignment(
                ticket,
                assignedBy,
                assignedTo,
                request.getNotes()
        );
        assignmentRepository.save(assignment);

        String newEngineerName = assignedTo.getFirstName() + " " + assignedTo.getLastName();
        TicketHistory history = new TicketHistory(
                ticket,
                assignedBy,
                "assignedEngineer",
                oldEngineerName,
                newEngineerName,
                request.getNotes() != null ? request.getNotes() : "Ticket reassigned"
        );
        historyRepository.save(history);

        Ticket savedTicket = ticketRepository.save(ticket);
        return TicketResponse.fromEntity(savedTicket);
    }

    @Override
    @Transactional
    public TicketCommentResponse addComment(Long ticketId, AddTicketCommentRequest request, String currentUserEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User sender = getUserByEmail(currentUserEmail);

        // Security check: Only staff can post internal notes
        boolean isInternal = request.isInternalNote();
        if (isInternal && !isStaff(sender)) {
            isInternal = false;
        }

        TicketMessage message = new TicketMessage(
                ticket,
                sender,
                request.getMessage().trim(),
                isInternal
        );

        TicketMessage savedMessage = messageRepository.save(message);
        return TicketCommentResponse.fromEntity(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketCommentResponse> getComments(Long ticketId, String currentUserEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User currentUser = getUserByEmail(currentUserEmail);

        List<TicketMessage> messages;
        if (isStaff(currentUser)) {
            // Staff sees all messages including internal notes
            messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
        } else {
            // Employees only see public messages
            if (!ticket.getRequester().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You are not authorized to view comments on this ticket");
            }
            messages = messageRepository.findByTicketIdAndIsInternalNoteFalseOrderByCreatedAtAsc(ticketId);
        }

        return messages.stream()
                .map(TicketCommentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketHistoryResponse> getHistory(Long ticketId, String currentUserEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User currentUser = getUserByEmail(currentUserEmail);
        if (!isStaff(currentUser) && !ticket.getRequester().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not authorized to view the history of this ticket");
        }

        return historyRepository.findByTicketIdOrderByCreatedAtDesc(ticketId).stream()
                .map(TicketHistoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void submitFeedback(Long ticketId, TicketFeedbackRequest request, String currentUserEmail) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", "id", ticketId));

        User currentUser = getUserByEmail(currentUserEmail);

        if (!ticket.getRequester().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the employee who reported this ticket can submit feedback");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Feedback can only be submitted on resolved or closed tickets");
        }

        if (feedbackRepository.existsByTicketId(ticketId)) {
            throw new BadRequestException("Feedback has already been submitted for this ticket");
        }

        TicketFeedback feedback = new TicketFeedback(
                ticket,
                currentUser,
                request.getRating(),
                request.getFeedbackText() != null ? request.getFeedbackText().trim() : null
        );

        feedbackRepository.save(feedback);
    }
}
