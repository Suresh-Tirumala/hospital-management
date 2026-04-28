package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.dto.DoctorDTO;
import com.hms.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> createDoctor(
            @Valid @RequestBody DoctorDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Doctor created", doctorService.createDoctor(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DoctorDTO.Response>>> getAllDoctors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DoctorDTO.Response> result = doctorService.getAllDoctors(
                PageRequest.of(page, size, Sort.by("name").ascending()));
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> getDoctorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorByUserId(userId)));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<DoctorDTO.Response>>> getBySpecialization(
            @PathVariable String specialization,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DoctorDTO.Response> result = doctorService.getDoctorsBySpecialization(specialization,
                PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Doctors retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DoctorDTO.Response>>> searchDoctors(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<DoctorDTO.Response> result = doctorService.searchDoctors(name, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success("Doctors found", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/specializations")
    public ResponseEntity<ApiResponse<List<String>>> getAllSpecializations() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllSpecializations()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<ApiResponse<DoctorDTO.Response>> updateDoctor(
            @PathVariable Long id, @Valid @RequestBody DoctorDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Doctor updated", doctorService.updateDoctor(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id, @RequestParam String status) {
        doctorService.updateDoctorStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Doctor status updated", null));
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
