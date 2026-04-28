package com.hms.repository;

import com.hms.model.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentId(String appointmentId);

    Page<Appointment> findByPatientId(Long patientId, Pageable pageable);

    Page<Appointment> findByDoctorId(Long doctorId, Pageable pageable);

    Page<Appointment> findByStatus(Appointment.Status status, Pageable pageable);

    List<Appointment> findByDoctorIdAndAppointmentDateTimeBetween(
            Long doctorId, LocalDateTime start, LocalDateTime end);

    List<Appointment> findByPatientIdAndAppointmentDateTimeBetween(
            Long patientId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId " +
            "AND a.appointmentDateTime BETWEEN :start AND :end " +
            "AND a.status NOT IN ('CANCELLED')")
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDateTime BETWEEN :start AND :end")
    List<Appointment> findAppointmentsBetween(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    long countByStatus(Appointment.Status status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDateTime BETWEEN :start AND :end")
    long countAppointmentsBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
