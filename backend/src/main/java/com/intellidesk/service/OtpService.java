package com.intellidesk.service;

import com.intellidesk.dto.auth.SendOtpResponse;
import com.intellidesk.dto.auth.VerifyOtpResponse;

public interface OtpService {

    SendOtpResponse sendRegistrationOtp(String phoneNumber);

    VerifyOtpResponse verifyRegistrationOtp(String phoneNumber, String code);

    boolean isPhoneVerified(String phoneNumber);

    void markPhoneAsConsumed(String phoneNumber);
}
