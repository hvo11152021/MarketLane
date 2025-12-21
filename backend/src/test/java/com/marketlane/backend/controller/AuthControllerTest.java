package com.marketlane.backend.controller;

import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.marketlane.backend.model.User;
import com.marketlane.backend.repo.UserRepo;
import com.marketlane.backend.security.JwtUtil;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthController controller;

    @Test
    void register_missingFields_returnsBadRequest() {
        ResponseEntity<?> response = controller.register(Map.of("username", "sam"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).isEqualTo("Missing fields");
    }

    @Test
    void register_existingUser_returnsConflict() {
        when(userRepo.findByUsername("sam")).thenReturn(Optional.of(new User("sam", "hash")));

        ResponseEntity<?> response = controller.register(Map.of("username", "sam", "password", "pw"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isEqualTo("User exists");
    }

    @Test
    void register_success_savesUserAndReturnsCreated() {
        when(userRepo.findByUsername("sam")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("pw")).thenReturn("encoded");

        ResponseEntity<?> response = controller.register(Map.of("username", "sam", "password", "pw"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isEqualTo(Map.of("username", "sam"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepo).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getUsername()).isEqualTo("sam");
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encoded");
    }

    @Test
    void login_success_returnsTokenAndRole() {
        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtil.generateToken("sam")).thenReturn("jwt-token");
        when(userRepo.findByUsername("sam")).thenReturn(Optional.of(new User("sam", "hash", "ROLE_ADMIN")));

        ResponseEntity<?> response = controller.login(Map.of("username", "sam", "password", "pw"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(
                Map.of("token", "jwt-token", "username", "sam", "role", "ROLE_ADMIN")
        );
    }

    @Test
    void login_invalidCredentials_returnsUnauthorized() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("bad credentials"));

        ResponseEntity<?> response = controller.login(Map.of("username", "sam", "password", "pw"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).isEqualTo("Invalid credentials");
    }
}
