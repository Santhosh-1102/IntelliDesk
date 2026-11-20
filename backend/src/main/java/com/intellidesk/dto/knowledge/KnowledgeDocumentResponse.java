package com.intellidesk.dto.knowledge;

import java.time.Instant;

public class KnowledgeDocumentResponse {

    private Long id;
    private String title;
    private String fileName;
    private String fileType;
    private String contentType;
    private Long fileSize;
    private String category;
    private Integer chunkCount;
    private boolean active;
    private String uploadedBy;
    private Instant createdAt;
    private Instant updatedAt;

    public KnowledgeDocumentResponse() {}

    public KnowledgeDocumentResponse(
            Long id,
            String title,
            String fileName,
            String fileType,
            String contentType,
            Long fileSize,
            String category,
            Integer chunkCount,
            boolean active,
            String uploadedBy,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.title = title;
        this.fileName = fileName;
        this.fileType = fileType;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.category = category;
        this.chunkCount = chunkCount;
        this.active = active;
        this.uploadedBy = uploadedBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getChunkCount() { return chunkCount; }
    public void setChunkCount(Integer chunkCount) { this.chunkCount = chunkCount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
