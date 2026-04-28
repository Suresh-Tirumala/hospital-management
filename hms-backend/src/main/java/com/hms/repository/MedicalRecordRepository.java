package com.hms.repository;

import com.hms.model.MedicalRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {

    Optional<MedicalRecord> findByRecordId(String recordId);

    Optional<MedicalRecord> findByAppointmentId(Long appointmentId);

    Page<MedicalRecord> findByPatientId(Long patientId, Pageable pageable);

    Page<MedicalRecord> findByDoctorId(Long doctorId, Pageable pageable);

    Page<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Long patientId, Pageable pageable);
}
