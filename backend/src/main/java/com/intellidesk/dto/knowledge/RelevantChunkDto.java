package com.intellidesk.dto.knowledge;

public class RelevantChunkDto {

    private Long chunkId;
    private Long documentId;
    private String documentTitle;
    private String category;
    private Integer chunkIndex;
    private String chunkContent;
    private Double relevanceScore; // 0.0 - 1.0

    public RelevantChunkDto() {}

    public RelevantChunkDto(Long chunkId, Long documentId, String documentTitle, String category, Integer chunkIndex, String chunkContent, Double relevanceScore) {
        this.chunkId = chunkId;
        this.documentId = documentId;
        this.documentTitle = documentTitle;
        this.category = category;
        this.chunkIndex = chunkIndex;
        this.chunkContent = chunkContent;
        this.relevanceScore = relevanceScore;
    }

    public Long getChunkId() { return chunkId; }
    public void setChunkId(Long chunkId) { this.chunkId = chunkId; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(Integer chunkIndex) { this.chunkIndex = chunkIndex; }

    public String getChunkContent() { return chunkContent; }
    public void setChunkContent(String chunkContent) { this.chunkContent = chunkContent; }

    public Double getRelevanceScore() { return relevanceScore; }
    public void setRelevanceScore(Double relevanceScore) { this.relevanceScore = relevanceScore; }
}
