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

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketNumber(String ticketNumber);

    Page<Ticket> findByRequesterId(Long requesterId, Pageable pageable);

    Page<Ticket> findByAssignedEngineerId(Long engineerId, Pageable pageable);

    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);

    Page<Ticket> findByPriority(TicketPriority priority, Pageable pageable);

    long countByStatus(TicketStatus status);

    long countByPriority(TicketPriority priority);

    long countByRequesterId(Long requesterId);

    long countByAssignedEngineerId(Long engineerId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.assignedEngineer.id = :engineerId AND t.status IN ('ASSIGNED', 'IN_PROGRESS')")
    long countActiveTicketsForEngineer(@Param("engineerId") Long engineerId);

    @Query("SELECT t.category.name, COUNT(t) FROM Ticket t GROUP BY t.category.name")
    List<Object[]> countTicketsByCategory();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> countTicketsByPriorityGroup();
}
