package com.intellidesk.dto.knowledge;

import jakarta.validation.constraints.NotBlank;

public class SearchKnowledgeRequest {

    @NotBlank(message = "Query cannot be blank")
    private String query;

    private Integer topK = 3;

    private String categoryFilter;

    public SearchKnowledgeRequest() {}

    public SearchKnowledgeRequest(String query, Integer topK) {
        this.query = query;
        this.topK = topK;
    }

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }

    public Integer getTopK() { return topK != null ? topK : 3; }
    public void setTopK(Integer topK) { this.topK = topK; }

    public String getCategoryFilter() { return categoryFilter; }
    public void setCategoryFilter(String categoryFilter) { this.categoryFilter = categoryFilter; }
}
