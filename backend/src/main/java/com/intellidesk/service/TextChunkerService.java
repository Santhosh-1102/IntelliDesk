package com.intellidesk.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TextChunkerService {

    private static final Logger log = LoggerFactory.getLogger(TextChunkerService.class);

    public static final int DEFAULT_CHUNK_SIZE = 600; // ~120-150 words per chunk
    public static final int DEFAULT_OVERLAP_SIZE = 120; // ~25 words overlap

    public record Chunk(int index, String content, int tokenCount) {}

    public List<Chunk> chunkText(String text) {
        return chunkText(text, DEFAULT_CHUNK_SIZE, DEFAULT_OVERLAP_SIZE);
    }

    public List<Chunk> chunkText(String text, int targetChunkSize, int overlapSize) {
        List<Chunk> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        String cleanText = text.trim();
        if (cleanText.length() <= targetChunkSize) {
            chunks.add(new Chunk(0, cleanText, estimateTokens(cleanText)));
            return chunks;
        }

        int start = 0;
        int chunkIndex = 0;

        while (start < cleanText.length()) {
            int end = Math.min(start + targetChunkSize, cleanText.length());

            // If we are not at the end of the text, look for natural boundary
            if (end < cleanText.length()) {
                // Priority 1: Double newline (paragraph boundary)
                int boundary = cleanText.lastIndexOf("\n\n", end);
                if (boundary > start + (targetChunkSize / 2)) {
                    end = boundary + 2;
                } else {
                    // Priority 2: Single newline
                    boundary = cleanText.lastIndexOf("\n", end);
                    if (boundary > start + (targetChunkSize / 2)) {
                        end = boundary + 1;
                    } else {
                        // Priority 3: Sentence boundary
                        boundary = findSentenceBoundary(cleanText, start + (targetChunkSize / 2), end);
                        if (boundary != -1) {
                            end = boundary;
                        } else {
                            // Priority 4: Word boundary
                            boundary = cleanText.lastIndexOf(" ", end);
                            if (boundary > start + (targetChunkSize / 2)) {
                                end = boundary + 1;
                            }
                        }
                    }
                }
            }

            String chunkContent = cleanText.substring(start, end).trim();
            if (!chunkContent.isBlank()) {
                chunks.add(new Chunk(chunkIndex++, chunkContent, estimateTokens(chunkContent)));
            }

            if (end >= cleanText.length()) {
                break;
            }

            // Move start forward with overlap
            start = Math.max(end - overlapSize, start + 1);
        }

        log.info("Divided document into {} semantic chunks (target size={}, overlap={})", chunks.size(), targetChunkSize, overlapSize);
        return chunks;
    }

    private int findSentenceBoundary(String text, int minIdx, int maxIdx) {
        for (int i = maxIdx - 1; i >= minIdx; i--) {
            char c = text.charAt(i);
            if ((c == '.' || c == '?' || c == '!') && (i + 1 == text.length() || Character.isWhitespace(text.charAt(i + 1)))) {
                return i + 1;
            }
        }
        return -1;
    }

    public int estimateTokens(String text) {
        if (text == null || text.isBlank()) return 0;
        return Math.max(1, (int) Math.ceil(text.length() / 4.0));
    }
}
