package com.intellidesk.controller;

import com.intellidesk.dto.ticket.*;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import com.intellidesk.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TicketResponse response = ticketService.createTicket(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TicketResponse>> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TicketResponse> response = ticketService.getMyTickets(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assigned")
    @PreAuthorize("hasAnyRole('SUPPORT_ENGINEER', 'ADMIN')")
    public ResponseEntity<Page<TicketResponse>> getAssignedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<TicketResponse> response = ticketService.getAssignedTickets(userDetails.getUsername(), pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPPORT_ENGINEER', 'ADMIN')")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<TicketResponse> response = ticketService.getAllTickets(status, priority, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketNumber}")
    public ResponseEntity<TicketResponse> getTicketByNumber(
            @PathVariable String ticketNumber,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TicketResponse response = ticketService.getTicketByNumber(ticketNumber, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{ticketId}/status")
    @PreAuthorize("hasAnyRole('SUPPORT_ENGINEER', 'ADMIN')")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TicketResponse response = ticketService.updateTicketStatus(ticketId, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{ticketId}/assign")
    @PreAuthorize("hasAnyRole('SUPPORT_ENGINEER', 'ADMIN')")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long ticketId,
            @Valid @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TicketResponse response = ticketService.assignTicket(ticketId, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{ticketId}/comments")
    public ResponseEntity<TicketCommentResponse> addComment(
            @PathVariable Long ticketId,
            @Valid @RequestBody AddTicketCommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        TicketCommentResponse response = ticketService.addComment(ticketId, request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{ticketId}/comments")
    public ResponseEntity<List<TicketCommentResponse>> getComments(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<TicketCommentResponse> response = ticketService.getComments(ticketId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{ticketId}/history")
    public ResponseEntity<List<TicketHistoryResponse>> getHistory(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<TicketHistoryResponse> response = ticketService.getHistory(ticketId, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{ticketId}/feedback")
    public ResponseEntity<Void> submitFeedback(
            @PathVariable Long ticketId,
            @Valid @RequestBody TicketFeedbackRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        ticketService.submitFeedback(ticketId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
