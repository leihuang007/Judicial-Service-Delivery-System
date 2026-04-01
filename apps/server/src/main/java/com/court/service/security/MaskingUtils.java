package com.court.service.security;

public final class MaskingUtils {

    private MaskingUtils() {
    }

    public static String mask(String contactType, String value) {
        if (value == null || value.isBlank()) {
            return value;
        }
        return switch (contactType.toLowerCase()) {
            case "mobile" -> maskMobile(value);
            case "email" -> maskEmail(value);
            default -> maskGeneric(value);
        };
    }

    private static String maskMobile(String mobile) {
        if (mobile.length() < 7) {
            return "***";
        }
        return mobile.substring(0, 3) + "****" + mobile.substring(mobile.length() - 4);
    }

    private static String maskEmail(String email) {
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(at);
    }

    private static String maskGeneric(String value) {
        if (value.length() <= 4) {
            return "****";
        }
        return value.substring(0, 2) + "****" + value.substring(value.length() - 2);
    }
}
