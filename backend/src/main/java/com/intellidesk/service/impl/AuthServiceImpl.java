package com.intellidesk.service.impl;

import com.intellidesk.dto.auth.AuthResponse;
import com.intellidesk.dto.auth.LoginRequest;
import com.intellidesk.dto.auth.RegisterRequest;
import com.intellidesk.dto.auth.UserProfileResponse;
import com.intellidesk.entity.Role;
import com.intellidesk.entity.User;
import com.intellidesk.entity.enums.RoleName;
import com.intellidesk.exception.BadRequestException;
import com.intellidesk.exception.ResourceNotFoundException;
import com.intellidesk.repository.RoleRepository;
import com.intellidesk.repository.UserRepository;
import com.intellidesk.security.JwtUtils;
import com.intellidesk.security.UserDetailsImpl;
import com.intellidesk.service.AuthService;
import com.intellidesk.service.OtpService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final OtpService otpService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            JwtUtils jwtUtils,
            OtpService otpService
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.otpService = otpService;
    }

    @Override
    @Transactional
    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim().toLowerCase(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                userDetails.getDepartment(),
                roles
        );
    }

    @Override
    @Transactional
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        String normalizedEmail = registerRequest.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new BadRequestException("An account with email " + normalizedEmail + " already exists");
        }

        User user = new User(
                normalizedEmail,
                passwordEncoder.encode(registerRequest.getPassword()),
                registerRequest.getFirstName().trim(),
                registerRequest.getLastName().trim(),
                registerRequest.getDepartment() != null ? registerRequest.getDepartment().trim() : null
        );

        // Enforce Phone Number + OTP Verification
        if (registerRequest.getPhoneNumber() == null || registerRequest.getPhoneNumber().trim().isBlank()) {
            throw new BadRequestException("Phone number is required. Please verify your mobile number via OTP before completing registration.");
        }
        String rawPhone = registerRequest.getPhoneNumber().trim();
        if (!otpService.isPhoneVerified(rawPhone)) {
            throw new BadRequestException("Phone number " + rawPhone + " has not been verified via OTP. Please verify your phone number to complete registration.");
        }
        user.setPhoneNumber(rawPhone);
        user.setPhoneVerified(true);
        otpService.markPhoneAsConsumed(rawPhone);

        // Assign Role (Default to ROLE_EMPLOYEE unless specified and allowed)
        Set<Role> roles = new HashSet<>();
        RoleName targetRole = RoleName.ROLE_EMPLOYEE;

        if (registerRequest.getRole() != null && !registerRequest.getRole().isBlank()) {
            try {
                String roleStr = registerRequest.getRole().toUpperCase().trim();
                if (!roleStr.startsWith("ROLE_")) {
                    roleStr = "ROLE_" + roleStr;
                }
                targetRole = RoleName.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                targetRole = RoleName.ROLE_EMPLOYEE;
            }
        }

        Role userRole = roleRepository.findByName(targetRole)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ROLE_EMPLOYEE, "Standard employee")));
        roles.add(userRole);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Auto-login upon registration
        List<String> roleNames = savedUser.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        String jwt = jwtUtils.generateTokenFromEmail(savedUser.getEmail(), savedUser.getId(), roleNames);

        return new AuthResponse(
                jwt,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getDepartment(),
                roleNames
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        List<String> roles = user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList());

        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getDepartment(),
                user.getPhoneNumber(),
                roles,
                user.isActive(),
                user.getCreatedAt()
        );
    }
}
