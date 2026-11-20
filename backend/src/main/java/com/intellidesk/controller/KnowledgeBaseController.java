package com.intellidesk.controller;

import com.intellidesk.dto.knowledge.DocumentChunkResponse;
import com.intellidesk.dto.knowledge.KnowledgeDocumentResponse;
import com.intellidesk.dto.knowledge.RelevantChunkDto;
import com.intellidesk.dto.knowledge.SearchKnowledgeRequest;
import com.intellidesk.security.UserDetailsImpl;
import com.intellidesk.service.KnowledgeDocumentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/knowledge")
public class KnowledgeBaseController {

    private final KnowledgeDocumentService knowledgeDocumentService;

    public KnowledgeBaseController(KnowledgeDocumentService knowledgeDocumentService) {
        this.knowledgeDocumentService = knowledgeDocumentService;
    }

    /**
     * Upload and ingest a corporate SOP or knowledge base document (PDF, DOCX, TXT, MD).
     * Extracts text via Apache Tika, generates overlapping chunks, and stores in PostgreSQL.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_ENGINEER')")
    public ResponseEntity<KnowledgeDocumentResponse> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "category", required = false) String category,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        KnowledgeDocumentResponse response = knowledgeDocumentService.uploadDocument(
                file,
                title,
                category,
                userDetails.getId()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * List all ingested knowledge documents with chunk counts and metadata.
     */
    @GetMapping("/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_ENGINEER')")
    public ResponseEntity<Page<KnowledgeDocumentResponse>> getAllDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<KnowledgeDocumentResponse> documents = knowledgeDocumentService.getAllDocuments(pageable);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get a specific knowledge document's metadata.
     */
    @GetMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_ENGINEER')")
    public ResponseEntity<KnowledgeDocumentResponse> getDocumentById(@PathVariable Long id) {
        KnowledgeDocumentResponse document = knowledgeDocumentService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    /**
     * Inspect all chunk fragments of a specific document for RAG auditing.
     */
    @GetMapping("/documents/{id}/chunks")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_ENGINEER')")
    public ResponseEntity<List<DocumentChunkResponse>> getDocumentChunks(@PathVariable Long id) {
        List<DocumentChunkResponse> chunks = knowledgeDocumentService.getDocumentChunks(id);
        return ResponseEntity.ok(chunks);
    }

    /**
     * Toggle document active status (enables or disables chunk inclusion in RAG searches).
     */
    @PatchMapping("/documents/{id}/toggle-active")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_ENGINEER')")
    public ResponseEntity<Void> toggleDocumentActive(@PathVariable Long id) {
        knowledgeDocumentService.toggleDocumentActive(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Permanently delete a document, its disk file, and all associated chunks.
     */
    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        knowledgeDocumentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Real-time semantic & full-text search against active chunks (RAG retrieval tester).
     */
    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPPORT_ENGINEER', 'EMPLOYEE')")
    public ResponseEntity<List<RelevantChunkDto>> searchRelevantChunks(
            @Valid @RequestBody SearchKnowledgeRequest request
    ) {
        List<RelevantChunkDto> chunks = knowledgeDocumentService.searchRelevantChunks(
                request.getQuery(),
                request.getTopK()
        );
        return ResponseEntity.ok(chunks);
    }
}
