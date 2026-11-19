package com.intellidesk.service;

import com.intellidesk.dto.auth.AuthResponse;
import com.intellidesk.dto.auth.LoginRequest;
import com.intellidesk.dto.auth.RegisterRequest;
import com.intellidesk.dto.auth.UserProfileResponse;

public interface AuthService {

    AuthResponse authenticateUser(LoginRequest loginRequest);

    AuthResponse registerUser(RegisterRequest registerRequest);

    UserProfileResponse getCurrentUserProfile(String email);
}
