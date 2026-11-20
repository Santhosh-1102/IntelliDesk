package com.intellidesk.service;

import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.metadata.TikaCoreProperties;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class DocumentParserService {

    private static final Logger log = LoggerFactory.getLogger(DocumentParserService.class);
    private final Tika tika = new Tika();

    public String parseDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        try (InputStream inputStream = file.getInputStream()) {
            return parseDocument(inputStream, file.getOriginalFilename());
        } catch (Exception e) {
            log.error("Failed to parse document: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Document parsing failed for file " + file.getOriginalFilename() + ": " + e.getMessage(), e);
        }
    }

    public String parseDocument(InputStream inputStream, String fileName) {
        try {
            BodyContentHandler handler = new BodyContentHandler(-1); // No write limit
            Metadata metadata = new Metadata();
            if (fileName != null) {
                metadata.set(TikaCoreProperties.RESOURCE_NAME_KEY, fileName);
            }
            ParseContext context = new ParseContext();
            AutoDetectParser parser = new AutoDetectParser();

            parser.parse(inputStream, handler, metadata, context);
            String rawText = handler.toString();

            if (rawText == null || rawText.isBlank()) {
                // Fallback to basic Tika parse
                rawText = tika.parseToString(inputStream);
            }

            // Normalize line endings and collapse excess blank lines
            String cleaned = rawText.replaceAll("\\r\\n", "\n")
                    .replaceAll("\\r", "\n")
                    .replaceAll("\n{3,}", "\n\n")
                    .trim();

            log.info("Successfully extracted {} characters from document: {}", cleaned.length(), fileName);
            return cleaned;
        } catch (Exception e) {
            log.error("Tika extraction error for file {}: {}", fileName, e.getMessage());
            throw new RuntimeException("Failed to extract text from document: " + e.getMessage(), e);
        }
    }

    public String detectMimeType(InputStream inputStream, String fileName) {
        try {
            return tika.detect(inputStream, fileName);
        } catch (Exception e) {
            return "application/octet-stream";
        }
    }
}
