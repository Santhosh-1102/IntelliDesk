package com.intellidesk.service.impl;

import com.intellidesk.dto.analytics.AdminAnalyticsResponse;
import com.intellidesk.dto.analytics.CategoryMetricDto;
import com.intellidesk.dto.analytics.EngineerWorkloadDto;
import com.intellidesk.dto.analytics.SlaBreachTicketDto;
import com.intellidesk.entity.Ticket;
import com.intellidesk.entity.User;
import com.intellidesk.entity.enums.ConversationStatus;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import com.intellidesk.repository.AiConversationRepository;
import com.intellidesk.repository.TicketRepository;
import com.intellidesk.repository.UserRepository;
import com.intellidesk.service.AnalyticsService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TicketRepository ticketRepository;
    private final AiConversationRepository conversationRepository;
    private final UserRepository userRepository;

    public AnalyticsServiceImpl(
            TicketRepository ticketRepository,
            AiConversationRepository conversationRepository,
            UserRepository userRepository
    ) {
        this.ticketRepository = ticketRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
    }

    @Override
    public AdminAnalyticsResponse getAdminAnalytics() {
        AdminAnalyticsResponse response = new AdminAnalyticsResponse();

        // 1. Ticket Volumes
        long totalTickets = ticketRepository.count();
        long openTickets = ticketRepository.countByStatus(TicketStatus.OPEN);
        long inProgressTickets = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
        long resolvedTickets = ticketRepository.countByStatus(TicketStatus.RESOLVED);
        long closedTickets = ticketRepository.countByStatus(TicketStatus.CLOSED);

        long criticalTickets = ticketRepository.countByPriority(TicketPriority.CRITICAL);
        long highTickets = ticketRepository.countByPriority(TicketPriority.HIGH);
        long mediumTickets = ticketRepository.countByPriority(TicketPriority.MEDIUM);
        long lowTickets = ticketRepository.countByPriority(TicketPriority.LOW);

        response.setTotalTickets(totalTickets);
        response.setOpenTickets(openTickets);
        response.setInProgressTickets(inProgressTickets);
        response.setResolvedTickets(resolvedTickets);
        response.setClosedTickets(closedTickets);
        response.setCriticalTickets(criticalTickets);
        response.setHighTickets(highTickets);
        response.setMediumTickets(mediumTickets);
        response.setLowTickets(lowTickets);

        // 2. AI Deflection Telemetry
        long aiTotal = conversationRepository.count();
        long aiResolved = conversationRepository.countByStatus(ConversationStatus.RESOLVED);
        long aiEscalated = conversationRepository.countByStatus(ConversationStatus.ESCALATED);
        long aiActive = conversationRepository.countByStatus(ConversationStatus.ACTIVE);

        double deflectionRate = 0.0;
        if (aiTotal > 0) {
            deflectionRate = Math.round(((double) aiResolved / aiTotal) * 1000.0) / 10.0;
        }

        response.setAiTotalConversations(aiTotal);
        response.setAiSelfResolvedConversations(aiResolved);
        response.setAiEscalatedConversations(aiEscalated);
        response.setAiActiveConversations(aiActive);
        response.setAiDeflectionRate(deflectionRate);

        // 3. SLA Telemetry
        Instant now = Instant.now();
        Instant nearDeadline = now.plus(Duration.ofHours(2));

        long slaBreached = ticketRepository.countSlaBreachedTickets(now);
        long slaNearBreach = ticketRepository.countNearSlaBreachedTickets(now, nearDeadline);
        long slaTracked = ticketRepository.countSlaTrackedTickets();

        double slaCompliance = 100.0;
        if (totalTickets > 0) {
            slaCompliance = Math.max(0.0, Math.round(((double) (totalTickets - slaBreached) / totalTickets) * 1000.0) / 10.0);
        }

        response.setSlaTrackedCount(slaTracked);
        response.setSlaBreachedCount(slaBreached);
        response.setSlaNearBreachCount(slaNearBreach);
        response.setSlaComplianceRate(slaCompliance);

        // 4. Mean Time to Resolution (MTTR)
        List<Ticket> resolvedList = ticketRepository.findResolvedTicketsForMttr();
        double avgMinutes = 0.0;
        if (!resolvedList.isEmpty()) {
            long totalMinutes = 0;
            for (Ticket t : resolvedList) {
                if (t.getCreatedAt() != null && t.getResolvedAt() != null) {
                    totalMinutes += Math.max(0, Duration.between(t.getCreatedAt(), t.getResolvedAt()).toMinutes());
                }
            }
            avgMinutes = Math.round(((double) totalMinutes / resolvedList.size()) * 10.0) / 10.0;
        }

        String formattedMttr;
        if (avgMinutes <= 0) {
            formattedMttr = "0m";
        } else if (avgMinutes >= 60) {
            long hours = (long) (avgMinutes / 60);
            long mins = (long) (avgMinutes % 60);
            formattedMttr = hours + "h " + mins + "m";
        } else {
            formattedMttr = Math.round(avgMinutes) + "m";
        }

        response.setMeanTimeToResolveMinutes(avgMinutes);
        response.setFormattedMttr(formattedMttr);

        // 5. Category Breakdown
        List<Object[]> categoryCounts = ticketRepository.countTicketsByCategory();
        List<CategoryMetricDto> catMetrics = new ArrayList<>();
        for (Object[] row : categoryCounts) {
            String catName = row[0] != null ? row[0].toString() : "Unassigned";
            long count = ((Number) row[1]).longValue();
            double pct = totalTickets > 0 ? Math.round(((double) count / totalTickets) * 1000.0) / 10.0 : 0.0;
            catMetrics.add(new CategoryMetricDto(catName, count, pct));
        }
        catMetrics.sort((a, b) -> Long.compare(b.getCount(), a.getCount()));
        response.setCategoryBreakdown(catMetrics);

        // 6. Priority Breakdown
        Map<String, Long> priorityMap = new LinkedHashMap<>();
        priorityMap.put("CRITICAL", criticalTickets);
        priorityMap.put("HIGH", highTickets);
        priorityMap.put("MEDIUM", mediumTickets);
        priorityMap.put("LOW", lowTickets);
        response.setPriorityBreakdown(priorityMap);

        // 7. Engineer Workload & Velocity
        List<User> engineers = userRepository.findByRoles_Name(RoleName.ROLE_SUPPORT_ENGINEER);
        List<EngineerWorkloadDto> workloads = new ArrayList<>();
        for (User eng : engineers) {
            long active = ticketRepository.countActiveTicketsForEngineer(eng.getId());
            long resolved = ticketRepository.countResolvedTicketsForEngineer(eng.getId());
            long totalAssigned = ticketRepository.countByAssignedEngineerId(eng.getId());
            String fullName = ((eng.getFirstName() != null ? eng.getFirstName() : "") + " " +
                               (eng.getLastName() != null ? eng.getLastName() : "")).trim();
            if (fullName.isEmpty()) {
                fullName = eng.getEmail();
            }
            workloads.add(new EngineerWorkloadDto(
                    eng.getId(),
                    fullName,
                    eng.getEmail(),
                    eng.getDepartment() != null ? eng.getDepartment() : "IT Support",
                    active,
                    resolved,
                    totalAssigned
            ));
        }
        workloads.sort((a, b) -> Long.compare(b.getActiveTickets(), a.getActiveTickets()));
        response.setEngineerWorkloads(workloads);

        // 8. Urgent SLA Tickets (Top 6)
        List<Ticket> urgentTickets = ticketRepository.findActiveTicketsBySlaUrgency(PageRequest.of(0, 6));
        List<SlaBreachTicketDto> urgentDtos = urgentTickets.stream()
                .map(SlaBreachTicketDto::fromTicket)
                .collect(Collectors.toList());
        response.setUrgentSlaTickets(urgentDtos);

        return response;
    }

    @Override
    public List<SlaBreachTicketDto> getSlaBreaches(int page, int size) {
        List<Ticket> tickets = ticketRepository.findActiveTicketsBySlaUrgency(PageRequest.of(page, size));
        return tickets.stream()
                .map(SlaBreachTicketDto::fromTicket)
                .collect(Collectors.toList());
    }
}
