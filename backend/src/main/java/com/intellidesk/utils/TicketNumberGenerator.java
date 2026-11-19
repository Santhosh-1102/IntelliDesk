package com.intellidesk.utils;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class TicketNumberGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd");

    private TicketNumberGenerator() {
        // Utility class, prevent instantiation
    }

    public static String generateTicketNumber() {
        String datePart = LocalDate.now().format(DATE_FORMATTER);
        int randomPart = 1000 + RANDOM.nextInt(9000); // 4-digit random number (1000 - 9999)
        return String.format("TCK-%s-%04d", datePart, randomPart);
    }
}
