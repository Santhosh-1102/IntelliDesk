package com.intellidesk.service;

import com.intellidesk.dto.auth.AuthResponse;
import com.intellidesk.dto.auth.LoginRequest;
import com.intellidesk.dto.auth.RegisterRequest;
import com.intellidesk.dto.auth.UserProfileResponse;
import com.intellidesk.entity.Role;
import com.intellidesk.entity.User;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.repository.RoleRepository;
import com.intellidesk.repository.UserRepository;
import com.intellidesk.security.JwtUtils;
import com.intellidesk.security.UserDetailsImpl;
import com.intellidesk.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private OtpService otpService;

    @InjectMocks
    private AuthServiceImpl authService;

    private User testUser;
    private Role employeeRole;

    @BeforeEach
    void setUp() {
        employeeRole = new Role(RoleName.ROLE_EMPLOYEE, "Employee");
        employeeRole.setId(1L);

        testUser = new User();
        testUser.setId(10L);
        testUser.setEmail("alex.morgan@company.com");
        testUser.setPasswordHash("encodedPassword123");
        testUser.setFirstName("Alex");
        testUser.setLastName("Morgan");
        testUser.setDepartment("DevOps");
        testUser.setPhoneNumber("+919876543210");
        testUser.setPhoneVerified(true);
        testUser.setActive(true);
        testUser.setRoles(Set.of(employeeRole));
    }

    @Test
    @DisplayName("authenticateUser: returns JWT token and user profile on valid credentials")
    void testAuthenticateUser_Success() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("alex.morgan@company.com");
        loginRequest.setPassword("SecretPass123!");

        UserDetailsImpl userDetails = UserDetailsImpl.build(testUser);
        Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn("mock.jwt.token.xyz");

        AuthResponse response = authService.authenticateUser(loginRequest);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token.xyz");
        assertThat(response.getEmail()).isEqualTo("alex.morgan@company.com");
        assertThat(response.getRoles()).contains("ROLE_EMPLOYEE");
    }

    @Test
    @DisplayName("registerUser: registers user when phone is verified via OTP")
    void testRegisterUser_Success_WithVerifiedPhone() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new.employee@company.com");
        request.setPassword("SecurePassword123!");
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setDepartment("Security");
        request.setPhoneNumber("+919876543210");

        when(userRepository.existsByEmail("new.employee@company.com")).thenReturn(false);
        when(otpService.isPhoneVerified("+919876543210")).thenReturn(true);
        when(roleRepository.findByName(RoleName.ROLE_EMPLOYEE)).thenReturn(Optional.of(employeeRole));
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(99L);
            return saved;
        });
        when(jwtUtils.generateTokenFromEmail(anyString(), any(), anyList())).thenReturn("mock.jwt.token.abc");

        AuthResponse response = authService.registerUser(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mock.jwt.token.abc");
        verify(otpService).markPhoneAsConsumed("+919876543210");
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("registerUser: throws BadRequestException when phone is not verified")
    void testRegisterUser_ThrowsBadRequest_WhenPhoneNotVerified() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setEmail("unverified@company.com");
        request.setPassword("Password123!");
        request.setPhoneNumber("+919999999999");

        when(userRepository.existsByEmail("unverified@company.com")).thenReturn(false);
        when(otpService.isPhoneVerified("+919999999999")).thenReturn(false);

        assertThatThrownBy(() -> authService.registerUser(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("has not been verified via OTP");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("registerUser: throws BadRequestException when email already exists")
    void testRegisterUser_ThrowsBadRequest_WhenEmailExists() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Alex");
        request.setLastName("Morgan");
        request.setEmail("alex.morgan@company.com");

        when(userRepository.existsByEmail("alex.morgan@company.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerUser(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("getCurrentUserProfile: returns mapped profile DTO")
    void testGetCurrentUserProfile_Success() {
        when(userRepository.findByEmail("alex.morgan@company.com")).thenReturn(Optional.of(testUser));

        UserProfileResponse profile = authService.getCurrentUserProfile("alex.morgan@company.com");

        assertThat(profile).isNotNull();
        assertThat(profile.getId()).isEqualTo(10L);
        assertThat(profile.getEmail()).isEqualTo("alex.morgan@company.com");
        assertThat(profile.getFirstName()).isEqualTo("Alex");
        assertThat(profile.getDepartment()).isEqualTo("DevOps");
    }
}
