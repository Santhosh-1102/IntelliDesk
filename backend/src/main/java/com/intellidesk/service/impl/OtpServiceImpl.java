package com.intellidesk.service.impl;

import com.intellidesk.dto.auth.SendOtpResponse;
import com.intellidesk.dto.auth.VerifyOtpResponse;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.service.OtpService;
import com.intellidesk.service.SmsGatewayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpServiceImpl implements OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpServiceImpl.class);

    private static final String OTP_PREFIX = "otp:code:";
    private static final String VERIFIED_PREFIX = "otp:verified:";
    private static final long OTP_VALIDITY_SECONDS = 300; // 5 minutes
    private static final long VERIFIED_VALIDITY_SECONDS = 900; // 15 minutes

    private final StringRedisTemplate redisTemplate;
    private final SmsGatewayService smsGatewayService;
    private final SecureRandom secureRandom = new SecureRandom();

    // In-memory fallback if Redis is ever unreachable
    private final Map<String, OtpEntry> inMemoryOtpCache = new ConcurrentHashMap<>();
    private final Map<String, Long> inMemoryVerifiedCache = new ConcurrentHashMap<>();

    private record OtpEntry(String code, long expiryTimeMs) {}

    public OtpServiceImpl(
            @Autowired(required = false) StringRedisTemplate redisTemplate,
            SmsGatewayService smsGatewayService
    ) {
        this.redisTemplate = redisTemplate;
        this.smsGatewayService = smsGatewayService;
    }

    @Override
    public SendOtpResponse sendRegistrationOtp(String phoneNumber) {
        String normalized = normalizePhone(phoneNumber);
        String digitsOnly = normalized.replace("+", "");
        if (digitsOnly.length() < 7 || digitsOnly.length() > 15) {
            throw new BadRequestException("Invalid phone number length (" + digitsOnly.length() + " digits). Must contain between 7 and 15 digits (E.164 international standard).");
        }

        String code = String.format("%06d", secureRandom.nextInt(1_000_000));

        boolean storedInRedis = false;
        if (redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(
                        OTP_PREFIX + normalized,
                        code,
                        Duration.ofSeconds(OTP_VALIDITY_SECONDS)
                );
                storedInRedis = true;
            } catch (Exception e) {
                log.warn("Redis unavailable, using in-memory OTP fallback: {}", e.getMessage());
            }
        }

        if (!storedInRedis) {
            inMemoryOtpCache.put(
                    normalized,
                    new OtpEntry(code, System.currentTimeMillis() + (OTP_VALIDITY_SECONDS * 1000))
            );
        }

        // Attempt live SMS dispatch if provider is configured
        boolean smsDispatched = false;
        if (smsGatewayService != null && smsGatewayService.isConfigured()) {
            smsDispatched = smsGatewayService.sendOtpSms(normalized, code);
        }

        log.info("-------------------------------------------------------");
        log.info("📲 [IntelliDesk SMS Gateway] Phone: {} -> OTP: {} (Dispatched via SMS: {})", normalized, code, smsDispatched);
        log.info("-------------------------------------------------------");

        String message = smsDispatched
                ? "A 6-digit verification code has been sent via SMS to " + phoneNumber
                : "A 6-digit verification code has been generated for " + phoneNumber;

        // If SMS was delivered to recipient's phone, do not expose code on screen (devOtp = null).
        // If running in local mock mode without API key, supply devOtp for smooth testing.
        String devOtp = smsDispatched ? null : code;

        return new SendOtpResponse(
                true,
                message,
                phoneNumber,
                OTP_VALIDITY_SECONDS,
                devOtp
        );
    }

    @Override
    public VerifyOtpResponse verifyRegistrationOtp(String phoneNumber, String code) {
        String normalized = normalizePhone(phoneNumber);
        String digitsOnly = normalized.replace("+", "");
        if (digitsOnly.length() < 7 || digitsOnly.length() > 15) {
            throw new BadRequestException("Invalid phone number length (" + digitsOnly.length() + " digits). Must contain between 7 and 15 digits.");
        }
        String expectedCode = null;

        if (redisTemplate != null) {
            try {
                expectedCode = redisTemplate.opsForValue().get(OTP_PREFIX + normalized);
            } catch (Exception e) {
                log.warn("Redis check failed, falling back to in-memory: {}", e.getMessage());
            }
        }

        if (expectedCode == null) {
            OtpEntry entry = inMemoryOtpCache.get(normalized);
            if (entry != null) {
                if (System.currentTimeMillis() <= entry.expiryTimeMs()) {
                    expectedCode = entry.code();
                } else {
                    inMemoryOtpCache.remove(normalized);
                }
            }
        }

        if (expectedCode == null) {
            throw new BadRequestException("Verification code has expired or was not requested. Please request a new OTP.");
        }

        if (!expectedCode.equals(code.trim())) {
            throw new BadRequestException("Invalid verification code. Please check the 6-digit code and try again.");
        }

        // Code matches! Mark as verified
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(OTP_PREFIX + normalized);
                redisTemplate.opsForValue().set(
                        VERIFIED_PREFIX + normalized,
                        "true",
                        Duration.ofSeconds(VERIFIED_VALIDITY_SECONDS)
                );
            } catch (Exception e) {
                log.warn("Redis verified flag save failed: {}", e.getMessage());
            }
        }

        inMemoryOtpCache.remove(normalized);
        inMemoryVerifiedCache.put(
                normalized,
                System.currentTimeMillis() + (VERIFIED_VALIDITY_SECONDS * 1000)
        );

        log.info("✅ Phone number {} successfully verified via OTP", normalized);

        return new VerifyOtpResponse(
                true,
                "Mobile number verified successfully! You may now complete account registration.",
                phoneNumber
        );
    }

    @Override
    public boolean isPhoneVerified(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return false;
        }

        String normalized = normalizePhone(phoneNumber);

        if (redisTemplate != null) {
            try {
                String val = redisTemplate.opsForValue().get(VERIFIED_PREFIX + normalized);
                if ("true".equalsIgnoreCase(val)) {
                    return true;
                }
            } catch (Exception e) {
                log.warn("Redis isPhoneVerified check failed: {}", e.getMessage());
            }
        }

        Long expiry = inMemoryVerifiedCache.get(normalized);
        if (expiry != null && System.currentTimeMillis() <= expiry) {
            return true;
        }

        return false;
    }

    @Override
    public void markPhoneAsConsumed(String phoneNumber) {
        if (phoneNumber == null) return;
        String normalized = normalizePhone(phoneNumber);

        if (redisTemplate != null) {
            try {
                redisTemplate.delete(VERIFIED_PREFIX + normalized);
            } catch (Exception ignored) {}
        }

        inMemoryVerifiedCache.remove(normalized);
    }

    private String normalizePhone(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("[^0-9+]", "").trim();
    }
}
