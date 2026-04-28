package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.dto.MedicalRecordDTO;
import com.hms.service.MedicalRecordService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medical-records")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordDTO.Response>> createRecord(
            @Valid @RequestBody MedicalRecordDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Medical record created",
                medicalRecordService.createMedicalRecord(request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalRecordDTO.Response>> getRecordById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(medicalRecordService.getRecordById(id)));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<ApiResponse<MedicalRecordDTO.Response>> getByAppointment(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(ApiResponse.success(
                medicalRecordService.getRecordByAppointmentId(appointmentId)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<MedicalRecordDTO.Response>>> getByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MedicalRecordDTO.Response> result = medicalRecordService.getRecordsByPatient(patientId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Records retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<List<MedicalRecordDTO.Response>>> getByDoctor(
            @PathVariable Long doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MedicalRecordDTO.Response> result = medicalRecordService.getRecordsByDoctor(doctorId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Records retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<ApiResponse<MedicalRecordDTO.Response>> updateRecord(
            @PathVariable Long id, @Valid @RequestBody MedicalRecordDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Record updated",
                medicalRecordService.updateRecord(id, request)));
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
