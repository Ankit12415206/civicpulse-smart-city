package com.civicpulse.civicpulse_backend.repository;

import com.civicpulse.civicpulse_backend.model.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
}