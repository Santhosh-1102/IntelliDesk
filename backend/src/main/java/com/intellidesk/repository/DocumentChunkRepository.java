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

    long countByDocumentId(Long documentId);

    void deleteByDocumentId(Long documentId);

    @Query(value = """
        SELECT dc.* FROM document_chunks dc
        JOIN knowledge_documents kd ON dc.document_id = kd.id
        WHERE kd.active = true
          AND to_tsvector('english', dc.chunk_content) @@ plainto_tsquery('english', :query)
        ORDER BY ts_rank_cd(to_tsvector('english', dc.chunk_content), plainto_tsquery('english', :query)) DESC
        LIMIT :topK
        """, nativeQuery = true)
    List<DocumentChunk> searchChunksFullText(@Param("query") String query, @Param("topK") int topK);

    @Query(value = """
        SELECT dc.* FROM document_chunks dc
        JOIN knowledge_documents kd ON dc.document_id = kd.id
        WHERE kd.active = true AND (
            LOWER(dc.chunk_content) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(kd.title) LIKE LOWER(CONCAT('%', :query, '%'))
            OR LOWER(kd.category) LIKE LOWER(CONCAT('%', :query, '%'))
        )
        ORDER BY dc.id ASC
        LIMIT :topK
        """, nativeQuery = true)
    List<DocumentChunk> searchChunksByKeyword(@Param("query") String query, @Param("topK") int topK);

    @Query(value = """
        SELECT * FROM document_chunks
        ORDER BY embedding <=> cast(:queryEmbedding as vector)
        LIMIT :topK
        """, nativeQuery = true)
    List<DocumentChunk> findSimilarChunks(@Param("queryEmbedding") String queryEmbedding, @Param("topK") int topK);
}
