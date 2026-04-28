package com.hms.service;

import com.hms.dto.AppointmentDTO;
import com.hms.exception.BadRequestException;
import com.hms.exception.ResourceNotFoundException;
import com.hms.model.Appointment;
import com.hms.model.Doctor;
import com.hms.model.Patient;
import com.hms.repository.AppointmentRepository;
import com.hms.repository.DoctorRepository;
import com.hms.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final AtomicLong counter = new AtomicLong(0);

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public AppointmentDTO.Response createAppointment(AppointmentDTO.CreateRequest request, String bookedBy) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        if (doctor.getStatus() != Doctor.Status.ACTIVE) {
            throw new BadRequestException("Doctor is not available for appointments");
        }

        LocalDateTime appointmentDateTime = LocalDateTime.parse(request.getAppointmentDateTime());

        // Check for conflicts - 30 minute slots
        LocalDateTime slotEnd = appointmentDateTime.plusMinutes(30);
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                doctor.getId(), appointmentDateTime, slotEnd);

        if (!conflicts.isEmpty()) {
            throw new BadRequestException("Doctor already has an appointment at this time slot");
        }

        // Validate appointment is in the future
        if (appointmentDateTime.isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Appointment date must be in the future");
        }

        String appointmentId = generateAppointmentId();

        Appointment.AppointmentType type = Appointment.AppointmentType.CONSULTATION;
        if (request.getType() != null) {
            try {
                type = Appointment.AppointmentType.valueOf(request.getType().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid appointment type: " + request.getType());
            }
        }

        Appointment appointment = Appointment.builder()
                .appointmentId(appointmentId)
                .patient(patient)
                .doctor(doctor)
                .appointmentDateTime(appointmentDateTime)
                .type(type)
                .status(Appointment.Status.SCHEDULED)
                .reason(request.getReason())
                .notes(request.getNotes())
                .bookedBy(bookedBy)
                .build();

        appointment = appointmentRepository.save(appointment);
        log.info("Appointment created: {} for patient {} with doctor {}",
                appointmentId, patient.getPatientId(), doctor.getDoctorId());
        
        AppointmentDTO.Response response = toResponse(appointment);
        messagingTemplate.convertAndSend("/topic/appointments", response);
        messagingTemplate.convertAndSend("/topic/stats", "refresh");
        
        return response;
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO.Response> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public AppointmentDTO.Response getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO.Response> getAppointmentsByPatient(Long patientId, Pageable pageable) {
        return appointmentRepository.findByPatientId(patientId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO.Response> getAppointmentsByDoctor(Long doctorId, Pageable pageable) {
        return appointmentRepository.findByDoctorId(doctorId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDTO.Response> getAppointmentsByStatus(String status, Pageable pageable) {
        Appointment.Status appointmentStatus = Appointment.Status.valueOf(status.toUpperCase());
        return appointmentRepository.findByStatus(appointmentStatus, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AppointmentDTO.Response> getDoctorAppointmentsForDate(Long doctorId, String date) {
        LocalDateTime startOfDay = LocalDateTime.parse(date + "T00:00:00");
        LocalDateTime endOfDay = LocalDateTime.parse(date + "T23:59:59");
        return appointmentRepository.findByDoctorIdAndAppointmentDateTimeBetween(doctorId, startOfDay, endOfDay)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public AppointmentDTO.Response updateAppointmentStatus(Long id, AppointmentDTO.UpdateStatusRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        Appointment.Status newStatus;
        try {
            newStatus = Appointment.Status.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + request.getStatus());
        }

        appointment.setStatus(newStatus);
        if (request.getNotes() != null) {
            appointment.setNotes(request.getNotes());
        }

        appointment = appointmentRepository.save(appointment);
        log.info("Appointment {} status updated to: {}", appointment.getAppointmentId(), newStatus);
        
        AppointmentDTO.Response response = toResponse(appointment);
        messagingTemplate.convertAndSend("/topic/appointments", response);
        messagingTemplate.convertAndSend("/topic/stats", "refresh");
        
        return response;
    }

    @Transactional
    public void cancelAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));

        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        appointment.setStatus(Appointment.Status.CANCELLED);
        appointmentRepository.save(appointment);
        log.info("Appointment cancelled: {}", appointment.getAppointmentId());
    }

    private String generateAppointmentId() {
        long count = appointmentRepository.count() + counter.incrementAndGet();
        return String.format("HMS-APT-%05d", count);
    }

    private AppointmentDTO.Response toResponse(Appointment appointment) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        return AppointmentDTO.Response.builder()
                .id(appointment.getId())
                .appointmentId(appointment.getAppointmentId())
                .patientId(appointment.getPatient().getId())
                .patientName(appointment.getPatient().getName())
                .doctorId(appointment.getDoctor().getId())
                .doctorName(appointment.getDoctor().getName())
                .doctorSpecialization(appointment.getDoctor().getSpecialization())
                .appointmentDateTime(appointment.getAppointmentDateTime().format(formatter))
                .slotDuration(appointment.getSlotDuration())
                .type(appointment.getType().name())
                .status(appointment.getStatus().name())
                .reason(appointment.getReason())
                .notes(appointment.getNotes())
                .bookedBy(appointment.getBookedBy())
                .createdAt(appointment.getCreatedAt() != null ? appointment.getCreatedAt().toString() : null)
                .build();
    }
}
