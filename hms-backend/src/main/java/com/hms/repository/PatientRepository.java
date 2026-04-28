package com.hms.repository;

import com.hms.model.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientId(String patientId);

    Optional<Patient> findByUserId(Long userId);

    Page<Patient> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Patient> findByStatus(Patient.Status status, Pageable pageable);

    Page<Patient> findByPhoneContaining(String phone, Pageable pageable);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    long countByStatus(Patient.Status status);
}
