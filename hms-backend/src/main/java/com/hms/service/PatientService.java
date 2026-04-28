package com.hms.service;

import com.hms.dto.PatientDTO;
import com.hms.exception.ResourceNotFoundException;
import com.hms.model.Patient;
import com.hms.model.User;
import com.hms.repository.PatientRepository;
import com.hms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class PatientService {

    private static final Logger log = LoggerFactory.getLogger(PatientService.class);
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;
    private final AtomicLong counter = new AtomicLong(0);

    public PatientService(PatientRepository patientRepository, UserRepository userRepository) {
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PatientDTO.Response createPatient(PatientDTO.CreateRequest request) {
        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));
        }

        String patientId = generatePatientId();

        Patient patient = Patient.builder()
                .user(user)
                .patientId(patientId)
                .name(request.getName())
                .dateOfBirth(LocalDate.parse(request.getDateOfBirth()))
                .gender(Patient.Gender.valueOf(request.getGender().toUpperCase()))
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .bloodGroup(request.getBloodGroup())
                .allergies(request.getAllergies())
                .chronicConditions(request.getChronicConditions())
                .emergencyContact(request.getEmergencyContact())
                .insuranceProvider(request.getInsuranceProvider())
                .insurancePolicyNumber(request.getInsurancePolicyNumber())
                .status(Patient.Status.ACTIVE)
                .build();

        patient = patientRepository.save(patient);
        log.info("Patient created: {} ({})", patient.getName(), patient.getPatientId());
        return toResponse(patient);
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO.Response> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PatientDTO.Response getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        return toResponse(patient);
    }

    @Transactional(readOnly = true)
    public PatientDTO.Response getPatientByUserId(Long userId) {
        Patient patient = patientRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "userId", userId));
        return toResponse(patient);
    }

    @Transactional(readOnly = true)
    public Page<PatientDTO.Response> searchPatients(String name, Pageable pageable) {
        return patientRepository.findByNameContainingIgnoreCase(name, pageable).map(this::toResponse);
    }

    @Transactional
    public PatientDTO.Response updatePatient(Long id, PatientDTO.CreateRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));

        if (request.getName() != null) patient.setName(request.getName());
        if (request.getDateOfBirth() != null) patient.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
        if (request.getGender() != null) patient.setGender(Patient.Gender.valueOf(request.getGender().toUpperCase()));
        if (request.getPhone() != null) patient.setPhone(request.getPhone());
        if (request.getEmail() != null) patient.setEmail(request.getEmail());
        if (request.getAddress() != null) patient.setAddress(request.getAddress());
        if (request.getBloodGroup() != null) patient.setBloodGroup(request.getBloodGroup());
        if (request.getAllergies() != null) patient.setAllergies(request.getAllergies());
        if (request.getChronicConditions() != null) patient.setChronicConditions(request.getChronicConditions());
        if (request.getEmergencyContact() != null) patient.setEmergencyContact(request.getEmergencyContact());
        if (request.getInsuranceProvider() != null) patient.setInsuranceProvider(request.getInsuranceProvider());
        if (request.getInsurancePolicyNumber() != null) patient.setInsurancePolicyNumber(request.getInsurancePolicyNumber());

        patient = patientRepository.save(patient);
        log.info("Patient updated: {}", patient.getPatientId());
        return toResponse(patient);
    }

    @Transactional
    public void updatePatientStatus(Long id, String status) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", id));
        patient.setStatus(Patient.Status.valueOf(status.toUpperCase()));
        patientRepository.save(patient);
        log.info("Patient {} status updated to: {}", patient.getPatientId(), status);
    }

    private String generatePatientId() {
        long count = patientRepository.count() + counter.incrementAndGet();
        return String.format("HMS-PAT-%05d", count);
    }

    private PatientDTO.Response toResponse(Patient patient) {
        return PatientDTO.Response.builder()
                .id(patient.getId())
                .patientId(patient.getPatientId())
                .userId(patient.getUser() != null ? patient.getUser().getId() : null)
                .name(patient.getName())
                .dateOfBirth(patient.getDateOfBirth().toString())
                .gender(patient.getGender().name())
                .phone(patient.getPhone())
                .email(patient.getEmail())
                .address(patient.getAddress())
                .bloodGroup(patient.getBloodGroup())
                .allergies(patient.getAllergies())
                .chronicConditions(patient.getChronicConditions())
                .emergencyContact(patient.getEmergencyContact())
                .insuranceProvider(patient.getInsuranceProvider())
                .insurancePolicyNumber(patient.getInsurancePolicyNumber())
                .status(patient.getStatus().name())
                .createdAt(patient.getCreatedAt() != null ? patient.getCreatedAt().toString() : null)
                .build();
    }
}
