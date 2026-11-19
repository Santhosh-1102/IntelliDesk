package com.intellidesk.repository;

import com.intellidesk.entity.DocumentChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    List<DocumentChunk> findByDocumentIdOrderByChunkIndexAsc(Long documentId);

    void deleteByDocumentId(Long documentId);

    @Query(value = """
        SELECT * FROM document_chunks
        ORDER BY embedding <=> cast(:queryEmbedding as vector)
        LIMIT :topK
        """, nativeQuery = true)
    List<DocumentChunk> findSimilarChunks(@Param("queryEmbedding") String queryEmbedding, @Param("topK") int topK);
}
