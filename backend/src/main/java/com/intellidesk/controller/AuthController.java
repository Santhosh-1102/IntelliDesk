package com.intellidesk.controller;

import com.intellidesk.dto.auth.AuthResponse;
import com.intellidesk.dto.auth.LoginRequest;
import com.intellidesk.dto.auth.RegisterRequest;
import com.intellidesk.dto.auth.SendOtpRequest;
import com.intellidesk.dto.auth.SendOtpResponse;
import com.intellidesk.dto.auth.UserProfileResponse;
import com.intellidesk.dto.auth.VerifyOtpRequest;
import com.intellidesk.dto.auth.VerifyOtpResponse;
import com.intellidesk.service.AuthService;
import com.intellidesk.service.OtpService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthService authService, OtpService otpService) {
        this.authService = authService;
        this.otpService = otpService;
    }

    @PostMapping("/otp/send")
    public ResponseEntity<SendOtpResponse> sendRegistrationOtp(@Valid @RequestBody SendOtpRequest request) {
        SendOtpResponse response = otpService.sendRegistrationOtp(request.getPhoneNumber());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<VerifyOtpResponse> verifyRegistrationOtp(@Valid @RequestBody VerifyOtpRequest request) {
        VerifyOtpResponse response = otpService.verifyRegistrationOtp(request.getPhoneNumber(), request.getCode());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse response = authService.registerUser(registerRequest);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        UserProfileResponse response = authService.getCurrentUserProfile(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
}
