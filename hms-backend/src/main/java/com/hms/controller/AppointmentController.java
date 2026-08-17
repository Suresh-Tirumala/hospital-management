package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.dto.AppointmentDTO;
import com.hms.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> createAppointment(
            @Valid @RequestBody AppointmentDTO.CreateRequest request,
            Authentication authentication) {
        String bookedBy = authentication != null ? authentication.getName() : "system";
        return ResponseEntity.ok(ApiResponse.success("Appointment booked",
                appointmentService.createAppointment(request, bookedBy)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO.Response>>> getAllAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentDTO.Response> result = appointmentService.getAllAppointments(
                PageRequest.of(page, size, Sort.by("appointmentDateTime").descending()));
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO.Response>>> getByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentDTO.Response> result = appointmentService.getAppointmentsByPatient(patientId,
                PageRequest.of(page, size, Sort.by("appointmentDateTime").descending()));
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO.Response>>> getByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentDTO.Response> result = appointmentService.getAppointmentsByDoctor(doctorId,
                PageRequest.of(page, size, Sort.by("appointmentDateTime").descending()));
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<ApiResponse<List<AppointmentDTO.Response>>> getDoctorSchedule(
            @PathVariable Long doctorId, @PathVariable String date) {
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getDoctorAppointmentsForDate(doctorId, date)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<AppointmentDTO.Response>>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<AppointmentDTO.Response> result = appointmentService.getAppointmentsByStatus(status,
                PageRequest.of(page, size, Sort.by("appointmentDateTime").descending()));
        return ResponseEntity.ok(ApiResponse.success("Appointments retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<AppointmentDTO.Response>> updateStatus(
            @PathVariable Long id, @Valid @RequestBody AppointmentDTO.UpdateStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                appointmentService.updateAppointmentStatus(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelAppointment(@PathVariable Long id) {
        appointmentService.cancelAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", null));
    }

    private <T> ApiResponse.PageInfo buildPageInfo(Page<T> page) {
        return ApiResponse.PageInfo.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .build();
    }
}
