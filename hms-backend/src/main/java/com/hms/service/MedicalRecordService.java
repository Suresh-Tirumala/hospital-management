package com.hms.service;

import com.hms.dto.MedicalRecordDTO;
import com.hms.exception.BadRequestException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.model.Appointment;
import com.hms.model.MedicalRecord;
import com.hms.model.Prescription;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.MedicalRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class MedicalRecordService {

    private static final Logger log = LoggerFactory.getLogger(MedicalRecordService.class);
    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final AtomicLong counter = new AtomicLong(0);

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                AppointmentRepository appointmentRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public MedicalRecordDTO.Response createMedicalRecord(MedicalRecordDTO.CreateRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", request.getAppointmentId()));

        // Check if record already exists for this appointment
        if (medicalRecordRepository.findByAppointmentId(appointment.getId()).isPresent()) {
            throw new BadRequestException("Medical record already exists for this appointment");
        }

        String recordId = generateRecordId();

        MedicalRecord record = MedicalRecord.builder()
                .recordId(recordId)
                .appointment(appointment)
                .patient(appointment.getPatient())
                .doctor(appointment.getDoctor())
                .chiefComplaint(request.getChiefComplaint())
                .diagnosis(request.getDiagnosis())
                .symptoms(request.getSymptoms())
                .examFindings(request.getExamFindings())
                .labResults(request.getLabResults())
                .treatment(request.getTreatment())
                .doctorNotes(request.getDoctorNotes())
                .followUpInstructions(request.getFollowUpInstructions())
                .nextFollowUpDate(request.getNextFollowUpDate() != null ?
                        LocalDateTime.parse(request.getNextFollowUpDate() + "T00:00:00") : null)
                .build();

        // Add prescriptions
        if (request.getPrescriptions() != null && !request.getPrescriptions().isEmpty()) {
            List<Prescription> prescriptions = new ArrayList<>();
            for (MedicalRecordDTO.PrescriptionItem item : request.getPrescriptions()) {
                Prescription prescription = Prescription.builder()
                        .medicalRecord(record)
                        .medicineName(item.getMedicineName())
                        .dosage(item.getDosage())
                        .frequency(item.getFrequency())
                        .duration(item.getDuration())
                        .route(item.getRoute())
                        .instructions(item.getInstructions())
                        .build();
                prescriptions.add(prescription);
            }
            record.setPrescriptions(prescriptions);
        }

        // Update appointment status to COMPLETED
        appointment.setStatus(Appointment.Status.COMPLETED);
        appointmentRepository.save(appointment);

        record = medicalRecordRepository.save(record);
        log.info("Medical record created: {} for appointment {}", recordId, appointment.getAppointmentId());
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public MedicalRecordDTO.Response getRecordById(Long id) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", id));
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public MedicalRecordDTO.Response getRecordByAppointmentId(Long appointmentId) {
        MedicalRecord record = medicalRecordRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "appointmentId", appointmentId));
        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordDTO.Response> getRecordsByPatient(Long patientId, Pageable pageable) {
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<MedicalRecordDTO.Response> getRecordsByDoctor(Long doctorId, Pageable pageable) {
        return medicalRecordRepository.findByDoctorId(doctorId, pageable).map(this::toResponse);
    }

    @Transactional
    public MedicalRecordDTO.Response updateRecord(Long id, MedicalRecordDTO.CreateRequest request) {
        MedicalRecord record = medicalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MedicalRecord", "id", id));

        if (request.getDiagnosis() != null) record.setDiagnosis(request.getDiagnosis());
        if (request.getSymptoms() != null) record.setSymptoms(request.getSymptoms());
        if (request.getExamFindings() != null) record.setExamFindings(request.getExamFindings());
        if (request.getLabResults() != null) record.setLabResults(request.getLabResults());
        if (request.getTreatment() != null) record.setTreatment(request.getTreatment());
        if (request.getDoctorNotes() != null) record.setDoctorNotes(request.getDoctorNotes());
        if (request.getFollowUpInstructions() != null) record.setFollowUpInstructions(request.getFollowUpInstructions());

        record = medicalRecordRepository.save(record);
        log.info("Medical record updated: {}", record.getRecordId());
        return toResponse(record);
    }

    private String generateRecordId() {
        long count = medicalRecordRepository.count() + counter.incrementAndGet();
        return String.format("HMS-REC-%05d", count);
    }

    private MedicalRecordDTO.Response toResponse(MedicalRecord record) {
        List<MedicalRecordDTO.PrescriptionResponse> prescriptions = new ArrayList<>();
        if (record.getPrescriptions() != null) {
            prescriptions = record.getPrescriptions().stream()
                    .map(p -> MedicalRecordDTO.PrescriptionResponse.builder()
                            .id(p.getId())
                            .medicineName(p.getMedicineName())
                            .dosage(p.getDosage())
                            .frequency(p.getFrequency())
                            .duration(p.getDuration())
                            .route(p.getRoute())
                            .instructions(p.getInstructions())
                            .build())
                    .collect(Collectors.toList());
        }

        return MedicalRecordDTO.Response.builder()
                .id(record.getId())
                .recordId(record.getRecordId())
                .appointmentId(record.getAppointment().getId())
                .appointmentDate(record.getAppointment().getAppointmentDateTime().toString())
                .patientId(record.getPatient().getId())
                .patientName(record.getPatient().getName())
                .doctorId(record.getDoctor().getId())
                .doctorName(record.getDoctor().getName())
                .chiefComplaint(record.getChiefComplaint())
                .diagnosis(record.getDiagnosis())
                .symptoms(record.getSymptoms())
                .examFindings(record.getExamFindings())
                .labResults(record.getLabResults())
                .treatment(record.getTreatment())
                .doctorNotes(record.getDoctorNotes())
                .followUpInstructions(record.getFollowUpInstructions())
                .nextFollowUpDate(record.getNextFollowUpDate() != null ? record.getNextFollowUpDate().toLocalDate().toString() : null)
                .prescriptions(prescriptions)
                .createdAt(record.getCreatedAt() != null ? record.getCreatedAt().toString() : null)
                .build();
    }
}
