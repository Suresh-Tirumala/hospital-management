package com.hms.repository;

import com.hms.model.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByDoctorId(String doctorId);

    Optional<Doctor> findByUserId(Long userId);

    Page<Doctor> findBySpecializationContainingIgnoreCase(String specialization, Pageable pageable);

    Page<Doctor> findByStatus(Doctor.Status status, Pageable pageable);

    Page<Doctor> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query("SELECT d FROM Doctor d WHERE d.status = :status AND d.specialization = :spec")
    List<Doctor> findAvailableDoctors(@Param("status") Doctor.Status status, @Param("spec") String specialization);

    long countByStatus(Doctor.Status status);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d ORDER BY d.specialization")
    List<String> findAllSpecializations();
}
