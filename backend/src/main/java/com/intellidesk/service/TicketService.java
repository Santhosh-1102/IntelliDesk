package com.intellidesk.service;

import com.intellidesk.dto.ticket.*;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TicketService {

    TicketResponse createTicket(CreateTicketRequest request, String currentUserEmail);

    TicketResponse getTicketByNumber(String ticketNumber, String currentUserEmail);

    TicketResponse getTicketById(Long ticketId, String currentUserEmail);

    Page<TicketResponse> getMyTickets(String currentUserEmail, Pageable pageable);

    Page<TicketResponse> getAssignedTickets(String engineerEmail, Pageable pageable);

    Page<TicketResponse> getAllTickets(TicketStatus status, TicketPriority priority, Pageable pageable);

    TicketResponse updateTicketStatus(Long ticketId, UpdateTicketStatusRequest request, String currentUserEmail);

    TicketResponse assignTicket(Long ticketId, AssignTicketRequest request, String currentUserEmail);

    TicketCommentResponse addComment(Long ticketId, AddTicketCommentRequest request, String currentUserEmail);

    List<TicketCommentResponse> getComments(Long ticketId, String currentUserEmail);

    List<TicketHistoryResponse> getHistory(Long ticketId, String currentUserEmail);

    void submitFeedback(Long ticketId, TicketFeedbackRequest request, String currentUserEmail);
}
