package com.intellidesk.service;

public interface SmsGatewayService {

    /**
     * Sends a 6-digit OTP verification code via SMS to a recipient mobile number.
     *
     * @param phoneNumber Destination mobile number (e.g. +919876543210 or 9876543210)
     * @param otpCode     The 6-digit verification code
     * @return true if the SMS was accepted and sent by the gateway, false otherwise
     */
    boolean sendOtpSms(String phoneNumber, String otpCode);

    /**
     * Checks whether valid credentials are configured for live SMS dispatch.
     *
     * @return true if the provider is enabled and an API key is present
     */
    boolean isConfigured();
}
