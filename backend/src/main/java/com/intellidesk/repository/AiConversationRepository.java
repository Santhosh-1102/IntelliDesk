package com.intellidesk.repository;

import com.intellidesk.entity.AiConversation;
import com.intellidesk.entity.enums.ConversationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, Long> {

    Optional<AiConversation> findBySessionId(String sessionId);

    Page<AiConversation> findByUserIdOrderByStartedAtDesc(Long userId, Pageable pageable);

    Page<AiConversation> findByKnowledgeGapTrueOrderByStartedAtDesc(Pageable pageable);

    long countByStatus(ConversationStatus status);
}
