package com.marketlane.backend.controller;

import com.cart.ecom_proj.model.User;
import com.cart.ecom_proj.repo.UserRepo;
import com.cart.ecom_proj.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        if (username == null || password == null) return new ResponseEntity<>("Missing fields", HttpStatus.BAD_REQUEST);
        if (userRepo.findByUsername(username).isPresent()) return new ResponseEntity<>("User exists", HttpStatus.CONFLICT);

        User u = new User(username, passwordEncoder.encode(password));
        userRepo.save(u);
        return new ResponseEntity<>(Map.of("username", u.getUsername()), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
            String token = jwtUtil.generateToken(username);
            String role = userRepo.findByUsername(username).map(u -> u.getRole()).orElse("ROLE_USER");
            return ResponseEntity.ok(Map.of("token", token, "username", username, "role", role));
        } catch (Exception e) {
            return new ResponseEntity<>("Invalid credentials", HttpStatus.UNAUTHORIZED);
        }
    }
}
