package com.intellidesk.dto.auth;

public class VerifyOtpResponse {

    private boolean verified;
    private String message;
    private String phoneNumber;

    public VerifyOtpResponse() {}

    public VerifyOtpResponse(boolean verified, String message, String phoneNumber) {
        this.verified = verified;
        this.message = message;
        this.phoneNumber = phoneNumber;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
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
}
