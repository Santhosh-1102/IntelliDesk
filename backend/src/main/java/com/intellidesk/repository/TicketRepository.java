package com.intellidesk.repository;

import com.intellidesk.entity.Ticket;
import com.intellidesk.entity.enums.TicketPriority;
import com.intellidesk.entity.enums.TicketStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    Optional<Ticket> findBySourceConversationId(Long sourceConversationId);

    Page<Ticket> findByRequesterId(Long requesterId, Pageable pageable);

    Page<Ticket> findByAssignedEngineerId(Long engineerId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByPriority(TicketPriority priority, Pageable pageable);

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    long countByRequesterId(Long requesterId);

    long countByAssignedEngineerId(Long engineerId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedEngineer.id = :engineerId AND t.status NOT IN ('RESOLVED', 'CLOSED')")
    long countActiveTicketsForEngineer(@Param("engineerId") Long engineerId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedEngineer.id = :engineerId AND t.status IN ('RESOLVED', 'CLOSED')")
    long countResolvedTicketsForEngineer(@Param("engineerId") Long engineerId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status NOT IN ('RESOLVED', 'CLOSED') AND t.slaDeadline IS NOT NULL AND t.slaDeadline < :now")
    long countSlaBreachedTickets(@Param("now") Instant now);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.status NOT IN ('RESOLVED', 'CLOSED') AND t.slaDeadline IS NOT NULL AND t.slaDeadline >= :now AND t.slaDeadline <= :nearDeadline")
    long countNearSlaBreachedTickets(@Param("now") Instant now, @Param("nearDeadline") Instant nearDeadline);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.slaDeadline IS NOT NULL")
    long countSlaTrackedTickets();

    @Query("SELECT t FROM Ticket t WHERE t.status NOT IN ('RESOLVED', 'CLOSED') AND t.slaDeadline IS NOT NULL ORDER BY t.slaDeadline ASC")
    List<Ticket> findActiveTicketsBySlaUrgency(Pageable pageable);

    @Query("SELECT t FROM Ticket t WHERE t.status IN ('RESOLVED', 'CLOSED') AND t.resolvedAt IS NOT NULL AND t.createdAt IS NOT NULL")
    List<Ticket> findResolvedTicketsForMttr();

    @Query("SELECT COALESCE(t.category.name, 'Uncategorized'), COUNT(t) FROM Ticket t GROUP BY t.category.name")
    List<Object[]> countTicketsByCategory();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> countTicketsByPriorityGroup();
}
