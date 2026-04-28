package com.hms.controller;

import com.hms.dto.ApiResponse;
import com.hms.dto.BillDTO;
import com.hms.service.BillService;
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
@RequestMapping("/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<BillDTO.Response>> createBill(
            @Valid @RequestBody BillDTO.CreateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Bill created", billService.createBill(request)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<BillDTO.Response>>> getAllBills(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<BillDTO.Response> result = billService.getAllBills(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Bills retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BillDTO.Response>> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(billService.getBillById(id)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<BillDTO.Response>>> getByPatient(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<BillDTO.Response> result = billService.getBillsByPatient(patientId,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Bills retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<List<BillDTO.Response>>> getByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<BillDTO.Response> result = billService.getBillsByStatus(status,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Bills retrieved", result.getContent(),
                buildPageInfo(result)));
    }

    @PostMapping("/{id}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public ResponseEntity<ApiResponse<BillDTO.Response>> addPayment(
            @PathVariable Long id,
            @Valid @RequestBody BillDTO.PaymentRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success("Payment recorded",
                billService.addPayment(id, request, authentication.getName())));
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
