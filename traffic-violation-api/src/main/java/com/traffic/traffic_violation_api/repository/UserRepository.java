package com.traffic.traffic_violation_api.repository;

import com.traffic.traffic_violation_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
}
