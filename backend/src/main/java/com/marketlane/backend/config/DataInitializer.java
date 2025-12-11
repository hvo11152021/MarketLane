package com.marketlane.backend.config;

import com.marketlane.backend.model.User;
import com.marketlane.backend.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // create default admin if missing
        String adminUsername = "admin";
        if (userRepo.findByUsername(adminUsername).isEmpty()) {
            User admin = new User(adminUsername, passwordEncoder.encode("admin"), "ROLE_ADMIN");
            userRepo.save(admin);
            System.out.println("Default admin created: admin / admin");
        }
    }
}
