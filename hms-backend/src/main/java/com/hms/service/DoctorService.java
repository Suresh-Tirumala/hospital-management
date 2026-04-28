package com.hms.service;

import com.hms.dto.DoctorDTO;
import com.hms.exception.ResourceNotFoundException;
import com.hms.model.Doctor;
import com.hms.model.User;
import com.hms.repository.DoctorRepository;
import com.hms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class DoctorService {

    private static final Logger log = LoggerFactory.getLogger(DoctorService.class);
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final AtomicLong counter = new AtomicLong(0);

    public DoctorService(DoctorRepository doctorRepository, UserRepository userRepository) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public DoctorDTO.Response createDoctor(DoctorDTO.CreateRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
        }

        String doctorId = generateDoctorId();

        Doctor doctor = Doctor.builder()
                .user(user)
                .doctorId(doctorId)
                .name(request.getName())
                .specialization(request.getSpecialization())
                .department(request.getDepartment())
                .qualification(request.getQualification())
                .experienceYears(request.getExperienceYears())
                .phone(request.getPhone())
                .email(request.getEmail())
                .consultationFee(request.getConsultationFee() != null ? request.getConsultationFee() : new BigDecimal("500"))
                .availableFrom(request.getAvailableFrom() != null ? LocalTime.parse(request.getAvailableFrom()) : LocalTime.of(9, 0))
                .availableTo(request.getAvailableTo() != null ? LocalTime.parse(request.getAvailableTo()) : LocalTime.of(17, 0))
                .availableDays(request.getAvailableDays() != null ? request.getAvailableDays() : "MON,TUE,WED,THU,FRI")
                .bio(request.getBio())
                .status(Doctor.Status.ACTIVE)
                .build();

        doctor = doctorRepository.save(doctor);
        log.info("Doctor created: {} ({})", doctor.getName(), doctor.getDoctorId());
        return toResponse(doctor);
    }

    @Transactional(readOnly = true)
    public Page<DoctorDTO.Response> getAllDoctors(Pageable pageable) {
        return doctorRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public DoctorDTO.Response getDoctorById(Long id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        return toResponse(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorDTO.Response getDoctorByUserId(Long userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", userId));
        return toResponse(doctor);
    }

    @Transactional(readOnly = true)
    public Page<DoctorDTO.Response> getDoctorsBySpecialization(String specialization, Pageable pageable) {
        return doctorRepository.findBySpecializationContainingIgnoreCase(specialization, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<DoctorDTO.Response> searchDoctors(String name, Pageable pageable) {
        return doctorRepository.findByNameContainingIgnoreCase(name, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<String> getAllSpecializations() {
        return doctorRepository.findAllSpecializations();
    }

    @Transactional
    public DoctorDTO.Response updateDoctor(Long id, DoctorDTO.CreateRequest request) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));

        if (request.getName() != null) doctor.setName(request.getName());
        if (request.getSpecialization() != null) doctor.setSpecialization(request.getSpecialization());
        if (request.getDepartment() != null) doctor.setDepartment(request.getDepartment());
        if (request.getQualification() != null) doctor.setQualification(request.getQualification());
        if (request.getExperienceYears() != null) doctor.setExperienceYears(request.getExperienceYears());
        if (request.getPhone() != null) doctor.setPhone(request.getPhone());
        if (request.getEmail() != null) doctor.setEmail(request.getEmail());
        if (request.getConsultationFee() != null) doctor.setConsultationFee(request.getConsultationFee());
        if (request.getAvailableFrom() != null) doctor.setAvailableFrom(LocalTime.parse(request.getAvailableFrom()));
        if (request.getAvailableTo() != null) doctor.setAvailableTo(LocalTime.parse(request.getAvailableTo()));
        if (request.getAvailableDays() != null) doctor.setAvailableDays(request.getAvailableDays());
        if (request.getBio() != null) doctor.setBio(request.getBio());

        doctor = doctorRepository.save(doctor);
        log.info("Doctor updated: {}", doctor.getDoctorId());
        return toResponse(doctor);
    }

    @Transactional
    public void updateDoctorStatus(Long id, String status) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", id));
        doctor.setStatus(Doctor.Status.valueOf(status.toUpperCase()));
        doctorRepository.save(doctor);
        log.info("Doctor {} status updated to: {}", doctor.getDoctorId(), status);
    }

    private String generateDoctorId() {
        long count = doctorRepository.count() + counter.incrementAndGet();
        return String.format("HMS-DOC-%05d", count);
    }

    private DoctorDTO.Response toResponse(Doctor doctor) {
        return DoctorDTO.Response.builder()
                .id(doctor.getId())
                .doctorId(doctor.getDoctorId())
                .userId(doctor.getUser() != null ? doctor.getUser().getId() : null)
                .name(doctor.getName())
                .specialization(doctor.getSpecialization())
                .department(doctor.getDepartment())
                .qualification(doctor.getQualification())
                .experienceYears(doctor.getExperienceYears())
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .consultationFee(doctor.getConsultationFee())
                .availableFrom(doctor.getAvailableFrom() != null ? doctor.getAvailableFrom().toString() : null)
                .availableTo(doctor.getAvailableTo() != null ? doctor.getAvailableTo().toString() : null)
                .availableDays(doctor.getAvailableDays())
                .bio(doctor.getBio())
                .status(doctor.getStatus().name())
                .createdAt(doctor.getCreatedAt() != null ? doctor.getCreatedAt().toString() : null)
                .build();
    }
}
