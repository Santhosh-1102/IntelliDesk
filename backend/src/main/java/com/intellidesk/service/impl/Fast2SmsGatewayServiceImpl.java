package com.intellidesk.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.intellidesk.service.SmsGatewayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class Fast2SmsGatewayServiceImpl implements SmsGatewayService {

    private static final Logger log = LoggerFactory.getLogger(Fast2SmsGatewayServiceImpl.class);
    private static final String FAST2SMS_ENDPOINT = "https://www.fast2sms.com/dev/bulkV2";

    @Value("${intellidesk.sms.fast2sms.api-key:}")
    private String apiKey;

    @Value("${intellidesk.sms.provider:fast2sms}")
    private String provider;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public boolean isConfigured() {
        return "fast2sms".equalsIgnoreCase(provider) && apiKey != null && !apiKey.trim().isBlank();
    }

    @Override
    public boolean sendOtpSms(String phoneNumber, String otpCode) {
        if (!isConfigured()) {
            log.info("ℹ️ Fast2SMS is not configured or disabled (provider={}, apiKeyPresent={}). Running in local test mode.",
                    provider, (apiKey != null && !apiKey.trim().isBlank()));
            return false;
        }

        // Fast2SMS requires 10-digit Indian numbers (strip +91, 91, or leading 0s)
        String cleanedDigits = phoneNumber.replaceAll("[^0-9]", "");
        if (cleanedDigits.startsWith("91") && cleanedDigits.length() == 12) {
            cleanedDigits = cleanedDigits.substring(2);
        } else if (cleanedDigits.startsWith("0") && cleanedDigits.length() == 11) {
            cleanedDigits = cleanedDigits.substring(1);
        }

        if (cleanedDigits.length() != 10) {
            log.warn("⚠️ Fast2SMS only supports 10-digit Indian mobile numbers. Given: {}", phoneNumber);
            return false;
        }

        try {
            // Fast2SMS OTP Route sends an official OTP template:
            // "Your OTP is <code\>. Do not share it with anyone."
            Map<String, Object> payload = new HashMap<>();
            payload.put("route", "otp");
            payload.put("variables_values", otpCode);
            payload.put("numbers", cleanedDigits);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(FAST2SMS_ENDPOINT))
                    .header("authorization", apiKey.trim())
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(15))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            log.info("📲 Dispatching live OTP SMS via Fast2SMS to +91-{}...", cleanedDigits);

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                boolean returned = root.path("return").asBoolean(false);
                if (returned) {
                    log.info("✅ [Fast2SMS] Successfully delivered OTP SMS to +91-{}", cleanedDigits);
                    return true;
                } else {
                    String errorMsg = root.path("message").asText("Unknown gateway rejection");
                    log.error("❌ [Fast2SMS] Gateway rejected dispatch: {}", errorMsg);
                    return false;
                }
            } else {
                log.error("❌ [Fast2SMS] HTTP Error status {}: {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception e) {
            log.error("❌ [Fast2SMS] Exception while sending SMS: {}", e.getMessage(), e);
            return false;
        }
    }
}
