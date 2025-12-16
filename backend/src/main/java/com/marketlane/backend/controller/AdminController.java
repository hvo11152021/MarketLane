package com.marketlane.backend.controller;

import com.marketlane.backend.model.Product;
import com.marketlane.backend.model.User;
import com.marketlane.backend.repo.UserRepo;
import com.marketlane.backend.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProductService productService;

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> listUsers() {
        List<User> users = userRepo.findAll();
        List<Map<String, Object>> out = users.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("role", u.getRole());
            return m;
        }).toList();
        return ResponseEntity.ok(out);
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");
        String role = body.getOrDefault("role", "ROLE_USER");
        if (username == null || password == null) return new ResponseEntity<>("Missing fields", HttpStatus.BAD_REQUEST);
        if (userRepo.findByUsername(username).isPresent()) return new ResponseEntity<>("User exists", HttpStatus.CONFLICT);
        User u = new User(username, passwordEncoder.encode(password), role);
        userRepo.save(u);
        return new ResponseEntity<>(Map.of("id", u.getId(), "username", u.getUsername(), "role", u.getRole()), HttpStatus.CREATED);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        if (!userRepo.existsById(id)) return new ResponseEntity<>("Not found", HttpStatus.NOT_FOUND);
        userRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    @GetMapping("/products")
    public ResponseEntity<List<Product>> listProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        Product p = productService.getProductById(id);
        if (p == null) return new ResponseEntity<>("Not found", HttpStatus.NOT_FOUND);
        productService.deleteProduct(id);
        return ResponseEntity.ok(Map.of("deleted", id));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> analytics() {
        List<Product> products = productService.getAllProducts();
        int productCount = products.size();
        int totalStock = products.stream().mapToInt(p -> p.getStockQuantity()).sum();

        java.math.BigDecimal avgPrice = java.math.BigDecimal.ZERO;
        if (!products.isEmpty()) {
            java.math.BigDecimal sum = products.stream()
                .map(Product::getPrice)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
            avgPrice = sum.divide(java.math.BigDecimal.valueOf(productCount), 2, java.math.RoundingMode.HALF_UP);
        }

        Map<String, Object> out = new HashMap<>();
        out.put("productCount", productCount);
        out.put("totalStock", totalStock);
        out.put("avgPrice", avgPrice.doubleValue());
        return ResponseEntity.ok(out);
    }
}
