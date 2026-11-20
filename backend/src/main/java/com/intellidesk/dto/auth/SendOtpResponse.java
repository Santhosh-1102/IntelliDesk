package com.intellidesk.dto.auth;

public class SendOtpResponse {

    private boolean success;
    private String message;
    private String phoneNumber;
    private long expiresInSeconds;
    private String devOtp; // Provided for smooth local development/testing

    public SendOtpResponse() {}

    public SendOtpResponse(boolean success, String message, String phoneNumber, long expiresInSeconds, String devOtp) {
        this.success = success;
        this.message = message;
        this.phoneNumber = phoneNumber;
        this.expiresInSeconds = expiresInSeconds;
        this.devOtp = devOtp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getDevOtp() {
        return devOtp;
    }

    public void setDevOtp(String devOtp) {
        this.devOtp = devOtp;
    }
}
