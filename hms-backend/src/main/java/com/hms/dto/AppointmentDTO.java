package com.hms.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class AppointmentDTO {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotNull(message = "Patient ID is required")
        private Long patientId;

        @NotNull(message = "Doctor ID is required")
        private Long doctorId;

        @NotBlank(message = "Appointment date/time is required")
        private String appointmentDateTime;       // "2024-03-15T10:00:00"

        private String type;                       // CONSULTATION, FOLLOW_UP, etc.
        private String reason;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        @NotBlank(message = "Status is required")
        private String status;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private String appointmentId;
        private Long patientId;
        private String patientName;
        private Long doctorId;
        private String doctorName;
        private String doctorSpecialization;
        private String appointmentDateTime;
        private String slotDuration;
        private String type;
        private String status;
        private String reason;
        private String notes;
        private String bookedBy;
        private String createdAt;
    }
}
