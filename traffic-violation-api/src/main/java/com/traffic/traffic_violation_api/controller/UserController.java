package com.traffic.traffic_violation_api.controller;

import com.traffic.traffic_violation_api.entity.User;
import com.traffic.traffic_violation_api.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Value("${google.client-id:${GOOGLE_CLIENT_ID:}}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    // CREATE
    @PostMapping
    public User createUser(@Valid @RequestBody User user) {
        user.setRole(normalizeRole(user.getRole()));
        return userRepository.save(user);
    }

    // REGISTER
    @PostMapping("/register")
    public User registerUser(@Valid @RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email already exists");
        }
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }
        user.setRole(normalizeRole(user.getRole()));
        user.setAuthProvider("LOCAL");
        return userRepository.save(user);
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> loginUser(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        if (email == null || password == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and password are required");
        }

        User user = userRepository.findByEmail(email);
        if (user == null || user.getPassword() == null || !user.getPassword().equals(password)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return buildAuthResponse(user);
    }

    // GOOGLE / GMAIL REGISTER OR LOGIN
    @PostMapping("/google")
    public Map<String, Object> continueWithGoogle(@RequestBody Map<String, String> payload) {
        String idToken = payload.get("idToken");
        if (idToken == null || idToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google credential is required");
        }
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Google client id is not configured");
        }

        Map<String, Object> profile = verifyGoogleToken(idToken);
        String email = asText(profile.get("email"));
        String emailVerified = asText(profile.get("email_verified"));

        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account email was not found");
        }
        if (!Boolean.parseBoolean(emailVerified)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account email is not verified");
        }

        User user = userRepository.findByEmail(email);
        if (user == null) {
            user = new User();
            user.setName(resolveGoogleName(profile, email));
            user.setEmail(email);
            user.setRole(normalizeRole(payload.get("role")));
            user.setAuthProvider("GOOGLE");
            user.setProviderId(asText(profile.get("sub")));
            user = userRepository.save(user);
        } else {
            user.setAuthProvider("GOOGLE");
            user.setProviderId(asText(profile.get("sub")));
            user = userRepository.save(user);
        }

        return buildAuthResponse(user);
    }

    // GET ALL
    @GetMapping
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userRepository.findById(id).orElse(null);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return "User deleted successfully";
    }

    // UPDATE
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @Valid @RequestBody User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        existingUser.setName(user.getName());
        existingUser.setEmail(user.getEmail());
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            existingUser.setPassword(user.getPassword());
        }
        if (user.getRole() != null && !user.getRole().isBlank()) {
            existingUser.setRole(user.getRole());
        }
        existingUser.setPhoneNumber(user.getPhoneNumber());
        existingUser.setDlNumber(user.getDlNumber());

        return userRepository.save(existingUser);
    }

    private Map<String, Object> verifyGoogleToken(String idToken) {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://oauth2.googleapis.com/tokeninfo")
                .queryParam("id_token", idToken)
                .toUriString();

        Map<String, Object> profile;
        try {
            profile = restTemplate.getForObject(url, Map.class);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
        }

        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
        }

        String audience = asText(profile.get("aud"));
        if (!googleClientId.equals(audience)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google credential audience is invalid");
        }

        return profile;
    }

    private String resolveGoogleName(Map<String, Object> profile, String email) {
        String name = asText(profile.get("name"));
        if (name != null && !name.isBlank()) {
            return name;
        }
        return email.substring(0, email.indexOf("@"));
    }

    private Map<String, Object> buildAuthResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());
        response.put("phoneNumber", user.getPhoneNumber());
        response.put("dlNumber", user.getDlNumber());
        response.put("authProvider", user.getAuthProvider());
        response.put("token", UUID.randomUUID().toString());
        return response;
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "USER";
        }
        String normalized = role.trim().toUpperCase();
        if ("ADMIN".equals(normalized) || "USER".equals(normalized)) {
            return normalized;
        }
        return "USER";
    }

    private String asText(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
