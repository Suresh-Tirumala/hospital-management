package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.dto.PatientDTO;
import com.hms.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<ApiResponse<PatientDTO.Response>> createPatient(
            @Valid @RequestBody PatientDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Patient created", patientService.createPatient(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<List<PatientDTO.Response>>> getAllPatients(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PatientDTO.Response> result = patientService.getAllPatients(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Patients retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientDTO.Response>> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<PatientDTO.Response>> getPatientByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(patientService.getPatientByUserId(userId)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<ApiResponse<List<PatientDTO.Response>>> searchPatients(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PatientDTO.Response> result = patientService.searchPatients(name, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Patients found", result.getContent(),
                buildPageInfo(result)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'PATIENT')")
    public ResponseEntity<ApiResponse<PatientDTO.Response>> updatePatient(
            @PathVariable Long id, @Valid @RequestBody PatientDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Patient updated", patientService.updatePatient(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        patientService.updatePatientStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Patient status updated", null));
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
