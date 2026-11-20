package com.intellidesk.service.impl;

import com.intellidesk.dto.knowledge.DocumentChunkResponse;
import com.intellidesk.dto.knowledge.KnowledgeDocumentResponse;
import com.intellidesk.dto.knowledge.RelevantChunkDto;
import com.intellidesk.entity.DocumentChunk;
import com.intellidesk.entity.KnowledgeDocument;
import com.intellidesk.entity.User;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.exception.ResourceNotFoundException;
import com.intellidesk.repository.DocumentChunkRepository;
import com.intellidesk.repository.KnowledgeDocumentRepository;
import com.intellidesk.repository.UserRepository;
import com.intellidesk.service.DocumentParserService;
import com.intellidesk.service.KnowledgeDocumentService;
import com.intellidesk.service.TextChunkerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KnowledgeDocumentServiceImpl implements KnowledgeDocumentService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeDocumentServiceImpl.class);

    @Value("${knowledge.upload.dir:./uploads/knowledge-documents}")
    private String uploadDir;

    private final KnowledgeDocumentRepository documentRepository;
    private final DocumentChunkRepository chunkRepository;
    private final UserRepository userRepository;
    private final DocumentParserService parserService;
    private final TextChunkerService chunkerService;

    public KnowledgeDocumentServiceImpl(
            KnowledgeDocumentRepository documentRepository,
            DocumentChunkRepository chunkRepository,
            UserRepository userRepository,
            DocumentParserService parserService,
            TextChunkerService chunkerService
    ) {
        this.documentRepository = documentRepository;
        this.chunkRepository = chunkRepository;
        this.userRepository = userRepository;
        this.parserService = parserService;
        this.chunkerService = chunkerService;
    }

    @Override
    @Transactional
    public KnowledgeDocumentResponse uploadDocument(MultipartFile file, String title, String category, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a non-empty document file to upload");
        }
        if (title == null || title.isBlank()) {
            throw new BadRequestException("Document title is required");
        }
        if (category == null || category.isBlank()) {
            category = "General SOP";
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.txt";
        String fileExtension = getFileExtension(originalFilename).toUpperCase();

        // 1. Ensure target directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
        } catch (IOException e) {
            log.error("Failed to create knowledge base upload directory: {}", uploadPath, e);
            throw new RuntimeException("Could not create document upload directory: " + e.getMessage(), e);
        }

        // 2. Save physical file to disk
        String storedFileName = UUID.randomUUID() + "_" + originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path destination = uploadPath.resolve(storedFileName);

        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Failed to store file to disk: {}", destination, e);
            throw new RuntimeException("Could not save document file to disk: " + e.getMessage(), e);
        }

        // 3. Extract text via Apache Tika
        String extractedText;
        try {
            extractedText = parserService.parseDocument(file);
        } catch (Exception e) {
            log.error("Error parsing document with Apache Tika: {}", originalFilename, e);
            throw new BadRequestException("Apache Tika could not parse the document contents: " + e.getMessage());
        }

        if (extractedText == null || extractedText.isBlank()) {
            throw new BadRequestException("Document parsed successfully but yielded no readable text");
        }

        // 4. Split extracted text into semantic overlapping chunks
        List<TextChunkerService.Chunk> chunks = chunkerService.chunkText(extractedText);

        // 5. Persist KnowledgeDocument entity
        KnowledgeDocument document = new KnowledgeDocument();
        document.setTitle(title.trim());
        document.setFileName(originalFilename);
        document.setFileType(fileExtension);
        document.setContentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        document.setFileSize(file.getSize());
        document.setCategory(category.trim());
        document.setStoragePath(destination.toString());
        document.setVersion(1);
        document.setActive(true);
        document.setUploadedBy(user);
        document = documentRepository.save(document);

        // 6. Persist DocumentChunk entities
        for (TextChunkerService.Chunk chunk : chunks) {
            DocumentChunk chunkEntity = new DocumentChunk(
                    document,
                    chunk.index(),
                    chunk.content(),
                    chunk.tokenCount()
            );
            chunkRepository.save(chunkEntity);
        }

        log.info("Successfully ingested document '{}' (id={}): {} chunks stored into PostgreSQL",
                document.getTitle(), document.getId(), chunks.size());

        return mapToResponse(document, chunks.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeDocumentResponse> getAllDocuments(Pageable pageable) {
        Page<KnowledgeDocument> page = documentRepository.findAll(pageable);
        return page.map(doc -> {
            int chunkCount = (int) chunkRepository.countByDocumentId(doc.getId());
            return mapToResponse(doc, chunkCount);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public KnowledgeDocumentResponse getDocumentById(Long documentId) {
        KnowledgeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeDocument", "id", documentId));
        int chunkCount = (int) chunkRepository.countByDocumentId(document.getId());
        return mapToResponse(document, chunkCount);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentChunkResponse> getDocumentChunks(Long documentId) {
        if (!documentRepository.existsById(documentId)) {
            throw new ResourceNotFoundException("KnowledgeDocument", "id", documentId);
        }
        List<DocumentChunk> chunks = chunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId);
        return chunks.stream()
                .map(this::mapChunkToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void toggleDocumentActive(Long documentId) {
        KnowledgeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeDocument", "id", documentId));
        document.setActive(!document.isActive());
        document.setUpdatedAt(Instant.now());
        documentRepository.save(document);
        log.info("Toggled document active state: id={}, title='{}', active={}", document.getId(), document.getTitle(), document.isActive());
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId) {
        KnowledgeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KnowledgeDocument", "id", documentId));

        // 1. Delete associated chunks from DB
        chunkRepository.deleteByDocumentId(documentId);

        // 2. Delete document entity
        documentRepository.delete(document);

        // 3. Delete physical file from disk if present
        if (document.getStoragePath() != null) {
            try {
                Files.deleteIfExists(Paths.get(document.getStoragePath()));
            } catch (IOException e) {
                log.warn("Could not delete physical file at {}: {}", document.getStoragePath(), e.getMessage());
            }
        }
        log.info("Successfully deleted knowledge document id={} and associated chunks", documentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RelevantChunkDto> searchRelevantChunks(String query, int topK) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }

        int limit = topK > 0 ? Math.min(topK, 10) : 3;
        Set<Long> seenChunkIds = new HashSet<>();
        List<RelevantChunkDto> results = new ArrayList<>();

        // 1. Full-Text Natural Language Search using plainto_tsquery and ts_rank_cd
        try {
            List<DocumentChunk> ftChunks = chunkRepository.searchChunksFullText(query.trim(), limit);
            for (DocumentChunk chunk : ftChunks) {
                if (seenChunkIds.add(chunk.getId())) {
                    results.add(mapToRelevantDto(chunk, 0.95));
                }
            }
        } catch (Exception e) {
            log.warn("Full-text search query failed; falling back to keyword search: {}", e.getMessage());
        }

        // 2. Keyword fallback if full-text yielded fewer results than limit
        if (results.size() < limit) {
            try {
                // Split query into keywords to catch technical terms, codes, or error numbers
                String[] keywords = query.trim().split("\\s+");
                for (String kw : keywords) {
                    if (kw.length() >= 3 && results.size() < limit) {
                        List<DocumentChunk> kwChunks = chunkRepository.searchChunksByKeyword(kw, limit - results.size());
                        for (DocumentChunk chunk : kwChunks) {
                            if (seenChunkIds.add(chunk.getId())) {
                                results.add(mapToRelevantDto(chunk, 0.85));
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Keyword search fallback failed: {}", e.getMessage());
            }
        }

        log.info("RAG search for query '{}' retrieved {} relevant SOP chunks", query, results.size());
        return results;
    }

    // Helper mappings
    private KnowledgeDocumentResponse mapToResponse(KnowledgeDocument doc, int chunkCount) {
        String uploaderName = doc.getUploadedBy() != null ?
                doc.getUploadedBy().getFirstName() + " " + doc.getUploadedBy().getLastName() : "System Admin";

        return new KnowledgeDocumentResponse(
                doc.getId(),
                doc.getTitle(),
                doc.getFileName(),
                doc.getFileType(),
                doc.getContentType(),
                doc.getFileSize(),
                doc.getCategory(),
                chunkCount,
                doc.isActive(),
                uploaderName,
                doc.getCreatedAt(),
                doc.getUpdatedAt()
        );
    }

    private DocumentChunkResponse mapChunkToResponse(DocumentChunk chunk) {
        return new DocumentChunkResponse(
                chunk.getId(),
                chunk.getDocument().getId(),
                chunk.getChunkIndex(),
                chunk.getChunkContent(),
                chunk.getTokenCount(),
                chunk.getMetadata(),
                chunk.getCreatedAt()
        );
    }

    private RelevantChunkDto mapToRelevantDto(DocumentChunk chunk, double score) {
        return new RelevantChunkDto(
                chunk.getId(),
                chunk.getDocument().getId(),
                chunk.getDocument().getTitle(),
                chunk.getDocument().getCategory(),
                chunk.getChunkIndex(),
                chunk.getChunkContent(),
                score
        );
    }

    private String getFileExtension(String filename) {
        int dot = filename.lastIndexOf(".");
        return dot != -1 ? filename.substring(dot + 1) : "TXT";
    }
}
