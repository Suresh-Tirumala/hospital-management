package com.hms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class BillDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Appointment ID is required")
        private Long appointmentId;

        private BigDecimal consultationCharge;
        private BigDecimal treatmentCharge;
        private BigDecimal medicationCharge;
        private BigDecimal labTestCharge;
        private BigDecimal otherCharges;
        private BigDecimal discount;
        private BigDecimal tax;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest {
        @NotNull(message = "Amount is required")
        private BigDecimal amount;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;

        private String referenceNumber;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String billNumber;
        private Long appointmentId;
        private Long patientId;
        private String patientName;
        private BigDecimal consultationCharge;
        private BigDecimal treatmentCharge;
        private BigDecimal medicationCharge;
        private BigDecimal labTestCharge;
        private BigDecimal otherCharges;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private String paymentStatus;
        private String notes;
        private List<PaymentResponse> payments;
        private String createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentResponse {
        private Long id;
        private String transactionId;
        private BigDecimal amount;
        private String paymentMethod;
        private String referenceNumber;
        private String notes;
        private String receivedBy;
        private String paymentDate;
    }
}
