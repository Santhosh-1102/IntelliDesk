package com.intellidesk.repository;

import com.intellidesk.entity.TroubleshootingStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TroubleshootingStepRepository extends JpaRepository<TroubleshootingStep, Long> {

    List<TroubleshootingStep> findByConversationIdOrderByStepNumberAsc(Long conversationId);
}
