package com.intellidesk.service;

import com.intellidesk.dto.knowledge.DocumentChunkResponse;
import com.intellidesk.dto.knowledge.KnowledgeDocumentResponse;
import com.intellidesk.dto.knowledge.RelevantChunkDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface KnowledgeDocumentService {

    KnowledgeDocumentResponse uploadDocument(MultipartFile file, String title, String category, Long userId);

    Page<KnowledgeDocumentResponse> getAllDocuments(Pageable pageable);

    KnowledgeDocumentResponse getDocumentById(Long documentId);

    List<DocumentChunkResponse> getDocumentChunks(Long documentId);

    void toggleDocumentActive(Long documentId);

    void deleteDocument(Long documentId);

    List<RelevantChunkDto> searchRelevantChunks(String query, int topK);
}
