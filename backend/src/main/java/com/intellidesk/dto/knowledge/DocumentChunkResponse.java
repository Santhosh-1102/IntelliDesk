package com.intellidesk.dto.knowledge;

import java.time.Instant;

public class DocumentChunkResponse {

    private Long id;
    private Long documentId;
    private Integer chunkIndex;
    private String chunkContent;
    private Integer tokenCount;
    private String metadata;
    private Instant createdAt;

    public DocumentChunkResponse() {}

    public DocumentChunkResponse(Long id, Long documentId, Integer chunkIndex, String chunkContent, Integer tokenCount, String metadata, Instant createdAt) {
        this.id = id;
        this.documentId = documentId;
        this.chunkIndex = chunkIndex;
        this.chunkContent = chunkContent;
        this.tokenCount = tokenCount;
        this.metadata = metadata;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Integer getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(Integer chunkIndex) { this.chunkIndex = chunkIndex; }

    public String getChunkContent() { return chunkContent; }
    public void setChunkContent(String chunkContent) { this.chunkContent = chunkContent; }

    public Integer getTokenCount() { return tokenCount; }
    public void setTokenCount(Integer tokenCount) { this.tokenCount = tokenCount; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
