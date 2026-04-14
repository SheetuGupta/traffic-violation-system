package com.traffic.traffic_violation_api.entity;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message="Name is required")
    private String name;
    @Email(message="Invalid email format")
    @NotBlank(message="Email is required")
    private String email;
    @NotBlank(message="Password is required")
    @Size(min=4,message="Password must be at least 4 characters")
    private String password;
    @NotBlank(message="Role is required")
    private String role;
    @NotBlank(message="Phone number is required")
    private String phoneNumber;

    @CreationTimestamp
    private LocalDateTime createdAt;





}
