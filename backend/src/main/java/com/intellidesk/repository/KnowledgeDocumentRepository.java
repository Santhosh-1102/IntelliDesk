package com.intellidesk.repository;

import com.intellidesk.entity.KnowledgeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeDocumentRepository extends JpaRepository<KnowledgeDocument, Long> {

    List<KnowledgeDocument> findByActiveTrueOrderByCreatedAtDesc();

    List<KnowledgeDocument> findByCategoryAndActiveTrue(String category);
}
